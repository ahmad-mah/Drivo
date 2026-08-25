import {
  FARE_BASE,
  FARE_PER_KM,
  NEARBY_RADIUS_KM,
  NO_SHOW_WAIT_MS,
  RECENT_RIDES_LIMIT_DEFAULT,
  RIDE_ENDED_GRACE_MS,
  RIDE_TTL_MS,
  STUCK_TRIP_LOG_MS,
} from "../../config";
import { prisma } from "../../config/database";
import { DRIVER_DECLINED_REASON } from "./cancellation-reasons";
import { ConflictError } from "../../errors/ConflictError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { NotFoundError } from "../../errors/NotFoundError";
import { requireUserByClerkId } from "../../shared/require-user";
import { ApprovalStatus } from "@prisma/client";
import * as directionsService from "../directions/directions.service";
import * as driverRepository from "../drivers/driver.repository";
import * as rideRepository from "./ride.repository";
import * as rideOfferRepository from "./ride-offer.repository";
import {
  canTransition,
  transitionSources,
} from "./trip-state-machine";
import { etaMinutesForDistanceKm } from "./dispatch.utils";
import {
  notifyDriverAssigned,
  notifyRideExpired,
  notifyRideUpdated,
} from "./ride.notifications";
import type { AssignedDriverDto, RequestRideDto } from "./ride.types";
import type { RideResponse } from "./ride.types";
import { RideStatus, type Ride } from "@prisma/client";

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function toResponse(
  ride: Ride,
  driverRating: number | null = null,
): RideResponse {
  return {
    id: ride.id,
    status: ride.status,
    originAddress: ride.originAddress,
    originLatitude: ride.originLatitude,
    originLongitude: ride.originLongitude,
    destinationAddress: ride.destinationAddress,
    destinationLatitude: ride.destinationLatitude,
    destinationLongitude: ride.destinationLongitude,
    distanceKm: ride.distanceKm,
    fare: ride.fare.toFixed(2),
    currency: ride.currency,
    rideTimeMinutes: ride.rideTimeMinutes,
    driverFirstName: ride.driverFirstName,
    driverLastName: ride.driverLastName,
    seats: ride.seats,
    driverRating,
    nearbyDrivers: ride.nearbyDrivers,
    expiresAt: ride.expiresAt.toISOString(),
    expiresInSeconds: Math.max(
      0,
      Math.round((ride.expiresAt.getTime() - Date.now()) / 1000),
    ),
    arrivedAt: ride.arrivedAt?.toISOString() ?? null,
    startedAt: ride.startedAt?.toISOString() ?? null,
    completedAt: ride.completedAt?.toISOString() ?? null,
    cancelReason: ride.cancelReason ?? null,    // Only meaningful while the driver is waiting at pickup — counts down to
    // when the driver may mark the rider a no-show (relative, skew-proof).
    noShowInSeconds:
      ride.status === RideStatus.ARRIVED && ride.arrivedAt
        ? Math.max(
            0,
            Math.round(
              (ride.arrivedAt.getTime() + NO_SHOW_WAIT_MS - Date.now()) / 1000,
            ),
          )
        : null,
    riderRating: ride.riderRating ?? null,
    // Only while the trip is underway — clients count it up locally; the
    // authoritative duration for payments is startedAt → completedAt.
    tripElapsedSeconds:
      ride.status === RideStatus.IN_PROGRESS && ride.startedAt
        ? Math.max(0, Math.round((Date.now() - ride.startedAt.getTime()) / 1000))
        : null,
    createdAt: ride.createdAt.toISOString(),
  };
}

/** Rounded average from the denormalized driver aggregates; null when new. */
function driverAverage(sum: number, count: number): number | null {
  return count > 0 ? Math.round((sum / count) * 10) / 10 : null;
}
export async function requestRide(
  clerkId: string,
  dto: RequestRideDto,
): Promise<RideResponse> {
  const user = await requireUserByClerkId(clerkId);

  const [active, nearbyDrivers] = await Promise.all([
    rideRepository.findActiveByUser(user.id),
    driverRepository.countNearbyDrivers(
      dto.origin.latitude,
      dto.origin.longitude,
      NEARBY_RADIUS_KM,
    ),
  ]);
  if (active) {
    throw new ConflictError("You already have an active ride request");
  }

  // Prefer the real driving distance so riders pay for the actual route; if
  // the Routes API is down the haversine estimate keeps ride requests working.
  let distanceKm: number;
  try {
    distanceKm =
      (await directionsService.getRouteDistanceMeters(
        dto.origin.latitude,
        dto.origin.longitude,
        dto.destination.latitude,
        dto.destination.longitude,
      )) / 1000;
  } catch {
    distanceKm = haversineKm(
      dto.origin.latitude,
      dto.origin.longitude,
      dto.destination.latitude,
      dto.destination.longitude,
    );
  }
  const fare = Math.round((FARE_BASE + distanceKm * FARE_PER_KM) * 100) / 100;

  const ride = await rideRepository.create({
    user: { connect: { id: user.id } },
    status: RideStatus.PENDING,
    originAddress: dto.origin.address,
    originLatitude: dto.origin.latitude,
    originLongitude: dto.origin.longitude,
    destinationAddress: dto.destination.address,
    destinationLatitude: dto.destination.latitude,
    destinationLongitude: dto.destination.longitude,
    distanceKm,
    fare,
    nearbyDrivers,
    expiresAt: new Date(Date.now() + RIDE_TTL_MS),
  });

  return toResponse(ride);
}

/**
 * PENDING → ACCEPTED transition driven by the fake-driver matcher. The atomic
 * accept in the repository rejects races with cancel/expiry; the guards below
 * give clearer errors for the common cases.
 */
export async function assignDriver(
  clerkId: string,
  rideId: string,
  driver: AssignedDriverDto,
): Promise<RideResponse> {
  const user = await requireUserByClerkId(clerkId);

  const ride = await rideRepository.findOwnedById(rideId, user.id);
  if (!ride) {
    throw new NotFoundError("Ride not found");
  }
  if (ride.status !== RideStatus.PENDING) {
    throw new ConflictError("Ride is no longer pending");
  }
  if (ride.expiresAt.getTime() <= Date.now()) {
    throw new ConflictError("Ride request has expired");
  }

  const updated = await rideRepository.acceptPending(ride.id, user.id, {
    driverId: driver.id,
    driverFirstName: driver.firstName,
    driverLastName: driver.lastName,
  });
  if (updated.count === 0) {
    throw new ConflictError("Ride is no longer pending");
  }

  // Push the assigned driver to the rider's open socket so the searching
  // card transitions without a refetch.
  await notifyDriverAssigned(clerkId, ride.id, {
    id: driver.id,
    firstName: driver.firstName,
    lastName: driver.lastName,
    vehicleType: driver.vehicleType,
    vehicleModel: driver.vehicleModel,
    vehicleColor: driver.vehicleColor,
    latitude: driver.latitude,
    longitude: driver.longitude,
    heading: driver.heading,
    rating: driver.rating,
    fare: driver.fare,
    timeMinutes: driver.etaMinutes,
    seats: driver.seats,
    carPlate: driver.carPlate,
    imageUrl: driver.imageUrl,
  });

  const fresh = await rideRepository.findOwnedById(ride.id, user.id);
  if (!fresh) throw new NotFoundError("Ride not found");
  return toResponse(fresh);
}

/** The poll target for the rider's status screen. */
export async function getActiveRide(clerkId: string): Promise<RideResponse> {
  const user = await requireUserByClerkId(clerkId);

  const ride = await rideRepository.findActiveByUser(user.id);

  // Grace fallback: right after a ride ends it leaves the "active" set, but
  // the client still needs its true terminal state (completed vs cancelled)
  // to render the right summary card instead of a generic no-ride screen.
  if (!ride) {
    const ended = await rideRepository.findRecentlyEnded(
      user.id,
      new Date(Date.now() - RIDE_ENDED_GRACE_MS),
    );
    if (ended) {
      return toResponse(
        ended,
        ended.driver
          ? driverAverage(ended.driver.ratingSum, ended.driver.ratingCount)
          : null,
      );
    }
    throw new NotFoundError("No active ride");
  }

  return toResponse(
    ride,
    ride.driver ? driverAverage(ride.driver.ratingSum, ride.driver.ratingCount) : null,
  );
}

export async function cancelRide(
  clerkId: string,
  rideId: string,
): Promise<RideResponse> {
  const user = await requireUserByClerkId(clerkId);

  const existing = await rideRepository.findOwnedById(rideId, user.id);
  if (!existing) throw new NotFoundError("Ride not found");
  // Mid-trip cancellation is blocked — the trip is underway. Pre-trip states
  // (including a driver already en route) may still be cancelled.
  if (existing.status === RideStatus.IN_PROGRESS) {
    throw new ConflictError("Cannot cancel while on the trip");
  }

  // Resolve the assigned driver before the flip so they can be notified.
  let driverClerkId: string | null = null;
  if (existing.driverId) {
    const driver = await driverRepository.findById(existing.driverId);
    driverClerkId = driver?.user?.clerkId ?? null;
  }

  const updated = await rideRepository.cancelActive(rideId, user.id);
  if (updated.count === 0) {
    throw new ConflictError("Ride can no longer be cancelled");
  }

  // Any driver still holding an unresponded offer must dismiss their card
  // immediately — otherwise they see an accept option for a dead ride.
  const holdingDrivers = await rideOfferRepository.expireOpenOffers(rideId);
  const rooms = [driverClerkId, ...holdingDrivers].filter(
    (id): id is string => Boolean(id),
  );
  if (rooms.length > 0) {
    await notifyRideUpdated(rooms, rideId);
  }

  // The ride was just cancelled above; the re-read builds the response. A
  // null here means it was deleted between the two queries.
  const ride = await rideRepository.findOwnedById(rideId, user.id);
  if (!ride) throw new NotFoundError("Ride not found");
  return toResponse(ride);
}

export async function getRecentRides(
  clerkId: string,
  limit = RECENT_RIDES_LIMIT_DEFAULT,
): Promise<RideResponse[]> {
  const user = await requireUserByClerkId(clerkId);

  const rides = await rideRepository.findRecent(user.id, limit);
  return rides.map((r) =>
    toResponse(r, r.driver ? driverAverage(r.driver.ratingSum, r.driver.ratingCount) : null),
  );
}

export async function getRideHistory(clerkId: string, limit: number, offset: number) {
  const user = await requireUserByClerkId(clerkId);

  const rides = await rideRepository.findHistory(user.id, limit, offset);
  return rides.map((r) =>
    toResponse(r, r.driver ? driverAverage(r.driver.ratingSum, r.driver.ratingCount) : null),
  );
}

/** TTL sweep entry point, driven by the interval started in server.ts. */
export async function expireOverdueRides() {
  const expired = await rideRepository.expireOverdue(new Date());
  await Promise.all(
    expired.map((ride) => notifyRideExpired(ride.user.clerkId, ride.id)),
  );
}

/**
 * Observability sweep: flags matched rides (ACCEPTED/ARRIVED) that have sat
 * untouched past the threshold — a driver never acted or an app died. No
 * automatic action on purpose; cancellation is a product decision.
 */
export async function logStuckTrips() {
  const stuck = await prisma.ride.findMany({
    where: {
      status: { in: [RideStatus.ACCEPTED, RideStatus.ARRIVED] },
      updatedAt: { lt: new Date(Date.now() - STUCK_TRIP_LOG_MS) },
    },
    select: { id: true, status: true, updatedAt: true },
  });
  for (const trip of stuck) {
    console.warn(
      `[stuck-trip] ride ${trip.id} in ${trip.status} since ${trip.updatedAt.toISOString()}`,
    );
  }
}

/**
 * Resolves the driver profile behind the caller, enforcing that the user is
 * actually an approved driver before any ride-offer action.
 */
async function requireApprovedDriver(clerkId: string) {
  const user = await requireUserByClerkId(clerkId);
  const profile = await driverRepository.findByUserId(user.id);
  if (!profile || profile.approvalStatus !== ApprovalStatus.APPROVED) {
    throw new ForbiddenError("Only approved drivers can respond to ride requests");
  }
  return profile;
}

/**
 * Driver-side PENDING → ACCEPTED transition: the accepting driver claims the
 * ride inside one transaction with their OFFERED offer (see
 * `rideOfferRepository.acceptOffer`), then the rider's socket is pushed so
 * the searching card flips to the driver info card.
 */
export async function acceptRideRequest(
  clerkId: string,
  rideId: string,
): Promise<RideResponse> {
  const profile = await requireApprovedDriver(clerkId);

  const ride = await rideRepository.findByIdWithRider(rideId);
  if (!ride) throw new NotFoundError("Ride not found");

  const offer = await rideOfferRepository.findByRideAndDriver(
    ride.id,
    profile.id,
  );
  if (!offer) throw new NotFoundError("No ride request was sent to you");

  let updated: Ride | null;
  try {
    updated = await rideOfferRepository.acceptOffer(ride.id, profile.id, ride.userId, {
      driverFirstName: profile.firstName,
      driverLastName: profile.lastName,
      seats: profile.seats,
    });
  } catch {
    // The transaction rolled back the offer acceptance along with the failed
    // ride claim — the driver's offer stays untouched for a clean retry.
    throw new ConflictError("Ride is no longer pending");
  }
  if (!updated) {
    throw new ConflictError("Offer already responded or expired");
  }

  await notifyDriverAssigned(ride.user.clerkId, updated.id, {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    vehicleType: profile.vehicleType,
    vehicleModel: profile.vehicleModel,
    vehicleColor: profile.vehicleColor,
    latitude: profile.latitude ?? ride.originLatitude,
    longitude: profile.longitude ?? ride.originLongitude,
    heading: profile.heading ?? undefined,
    rating: driverAverage(profile.ratingSum, profile.ratingCount) ?? undefined,
    fare: Number(updated.fare),
    timeMinutes: etaMinutesForDistanceKm(offer.distanceKm),
    carPlate: profile.vehiclePlate,
    imageUrl: undefined,
  });

  // Nudge the accepting driver's own app so its trip panel appears without
  // depending on which device initiated the accept.
  await notifyRideUpdated([clerkId], updated.id);

  return toResponse(
    updated,
    driverAverage(profile.ratingSum, profile.ratingCount),
  );
}

/**
 * Driver-side rejection: the offer is flipped REJECTED and the dispatcher's
 * next tick escalates the still-pending ride to the next-nearest candidate.
 */
/**
 * Driver-side rejection: the offer is flipped REJECTED and the ride itself
 * cancels with `driver_declined` — the rider is bounced straight back to the
 * driver list to re-pick (per product flow; silent escalation felt broken).
 * The 30s cooldown guarantees this same driver isn't offered again.
 */
export async function rejectRideRequest(clerkId: string, rideId: string) {
  const profile = await requireApprovedDriver(clerkId);

  const ride = await rideRepository.findByIdWithRider(rideId);
  if (!ride) throw new NotFoundError("Ride not found");

  const rejected = await rideOfferRepository.rejectOffer(ride.id, profile.id);
  if (rejected.count === 0) {
    throw new ConflictError("Offer already responded or expired");
  }

  const cancelled = await rideRepository.cancelPendingWithReason(
    ride.id,
    DRIVER_DECLINED_REASON,
  );

  if (cancelled) {
    await notifyRideUpdated(
      [ride.user.clerkId, clerkId].filter(Boolean),
      ride.id,
    );
  }
}

/** Resolves the approved driver behind the caller for trip actions. */
async function requireDriverForTrip(clerkId: string) {
  const user = await requireUserByClerkId(clerkId);
  const profile = await driverRepository.findByUserId(user.id);
  if (!profile || profile.approvalStatus !== ApprovalStatus.APPROVED) {
    throw new ForbiddenError("Only approved drivers can manage trips");
  }
  return profile;
}

/**
 * Shared tail of every driver transition: validate against the state
 * machine, notify both parties (with minimal lookups — only the socket room
 * identifiers are fetched), and respond.
 */
async function finishTransition(
  clerkId: string,
  from: RideStatus,
  to: RideStatus,
  updated: Ride | null,
): Promise<RideResponse> {
  if (!updated) throw new ConflictError("Trip is not in a state for this action");
  // Defense in depth: the repo guard already enforced this; the assertion
  // documents the contract and catches call-site mistakes at runtime.
  if (!canTransition(from, to)) {
    throw new ConflictError("Invalid trip transition");
  }

  const withRider = await rideRepository.findByIdWithRider(updated.id);
  const driverClerk = updated.driverId
    ? await driverRepository.findClerkIdByDriverId(updated.driverId)
    : null;

  const rooms = [withRider?.user.clerkId, driverClerk ?? clerkId].filter(
    (id): id is string => Boolean(id),
  );
  await notifyRideUpdated(rooms, updated.id);

  return toResponse(
    withRider ?? updated,
    withRider?.driver
      ? driverAverage(withRider.driver.ratingSum, withRider.driver.ratingCount)
      : null,
  );
}

export async function getDriverActiveRide(clerkId: string): Promise<RideResponse> {
  const profile = await requireDriverForTrip(clerkId);

  const ride = await rideRepository.findActiveByDriver(profile.id);
  if (!ride) throw new NotFoundError("No active trip");

  return toResponse(ride);
}

export async function arriveAtPickup(clerkId: string, rideId: string) {
  const profile = await requireDriverForTrip(clerkId);
  const updated = await rideRepository.transitionForDriver(
    rideId,
    profile.id,
    transitionSources(RideStatus.ARRIVED),
    RideStatus.ARRIVED,
  );
  return finishTransition(clerkId, RideStatus.ACCEPTED, RideStatus.ARRIVED, updated);
}

export async function startTrip(clerkId: string, rideId: string) {
  const profile = await requireDriverForTrip(clerkId);
  const updated = await rideRepository.transitionForDriver(
    rideId,
    profile.id,
    transitionSources(RideStatus.IN_PROGRESS),
    RideStatus.IN_PROGRESS,
  );
  return finishTransition(clerkId, RideStatus.ARRIVED, RideStatus.IN_PROGRESS, updated);
}

export async function completeTrip(clerkId: string, rideId: string) {
  const profile = await requireDriverForTrip(clerkId);
  const updated = await rideRepository.transitionForDriver(
    rideId,
    profile.id,
    transitionSources(RideStatus.COMPLETED),
    RideStatus.COMPLETED,
  );
  return finishTransition(clerkId, RideStatus.IN_PROGRESS, RideStatus.COMPLETED, updated);
}

/**
 * No-show: the wait window elapsed with nobody at pickup. ARRIVED →
 * CANCELLED with a fixed reason — terminal by design (no re-dispatch to an
 * empty curb). The eligibility window is enforced client-side via
 * `noShowInSeconds`; this server guard accepts it any time after arrival.
 */
export async function markRiderNoShow(clerkId: string, rideId: string) {
  const profile = await requireDriverForTrip(clerkId);
  const updated = await rideRepository.markRiderNoShow(rideId, profile.id);
  return finishTransition(
    clerkId,
    RideStatus.ARRIVED,
    RideStatus.CANCELLED,
    updated,
  );
}

/**
 * Driver-initiated cancel, phase-aware:
 * - pre-`IN_PROGRESS`: back to PENDING with the snapshot cleared — the
 *   dispatcher's next tick escalates to the next-nearest candidate (this
 *   driver is excluded via their rejected offer)
 * - mid-trip: the ride terminates as CANCELLED
 * Both parties are notified either way.
 */
export async function cancelTripAsDriver(clerkId: string, rideId: string) {
  const profile = await requireDriverForTrip(clerkId);
  const { ride: updated } = await rideRepository.cancelByDriver(
    rideId,
    profile.id,
  );
  if (!updated) throw new ConflictError("Trip is not in a state for this action");

  const withRider = await rideRepository.findByIdWithRider(updated.id);
  const rooms = [withRider?.user.clerkId, clerkId].filter(
    (id): id is string => Boolean(id),
  );
  await notifyRideUpdated(rooms, updated.id);

  return toResponse(updated);
}

/**
 * Rider rates the driver on a completed ride. One rating per ride (the
 * rider's own), stars validated 1–5; the driver's denormalized aggregates
 * update in the same transaction so matching sees the new average instantly.
 */
export async function rateRide(
  clerkId: string,
  rideId: string,
  dto: { stars: number; comment?: string },
): Promise<RideResponse> {
  const user = await requireUserByClerkId(clerkId);

  const ride = await rideRepository.findOwnedById(rideId, user.id);
  if (!ride) throw new NotFoundError("Ride not found");
  if (ride.status !== RideStatus.COMPLETED) {
    throw new ConflictError("You can rate only completed rides");
  }
  if (ride.riderRating != null) {
    throw new ConflictError("You already rated this ride");
  }
  if (!ride.driverId) throw new ConflictError("Nothing to rate");

  await prisma.$transaction([
    rideRepository.setRiderRating(ride.id, user.id, dto.stars, dto.comment),
    driverRepository.incrementDriverRating(ride.driverId, dto.stars),
  ]);

  const fresh = await rideRepository.findByIdWithRider(rideId);
  return toResponse(
    fresh ?? ride,
    fresh?.driver ? driverAverage(fresh.driver.ratingSum, fresh.driver.ratingCount) : null,
  );
}
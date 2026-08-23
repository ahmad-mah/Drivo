import {
  FARE_BASE,
  FARE_PER_KM,
  NEARBY_RADIUS_KM,
  RIDE_TTL_MS,
} from "../../config";
import { ConflictError } from "../../errors/ConflictError";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { NotFoundError } from "../../errors/NotFoundError";
import { requireUserByClerkId } from "../../shared/require-user";
import { ApprovalStatus } from "@prisma/client";
import * as directionsService from "../directions/directions.service";
import * as driverRepository from "../drivers/driver.repository";
import * as rideRepository from "./ride.repository";
import * as rideOfferRepository from "./ride-offer.repository";
import { etaMinutesForDistanceKm } from "./dispatch.utils";
import { notifyDriverAssigned, notifyRideExpired } from "./ride.notifications";
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

function toResponse(ride: Ride): RideResponse {
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
    nearbyDrivers: ride.nearbyDrivers,
    expiresAt: ride.expiresAt.toISOString(),
    expiresInSeconds: Math.max(
      0,
      Math.round((ride.expiresAt.getTime() - Date.now()) / 1000),
    ),
    createdAt: ride.createdAt.toISOString(),
  };
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

/** The poll target for the rider's searching screen. */
export async function getActiveRide(clerkId: string): Promise<RideResponse> {
  const user = await requireUserByClerkId(clerkId);

  const ride = await rideRepository.findActiveByUser(user.id);
  if (!ride) {
    throw new NotFoundError("No active ride");
  }

  return toResponse(ride);
}

export async function cancelRide(
  clerkId: string,
  rideId: string,
): Promise<RideResponse> {
  const user = await requireUserByClerkId(clerkId);

  const updated = await rideRepository.cancelActive(rideId, user.id);
  if (updated.count === 0) {
    throw new ConflictError("Ride can no longer be cancelled");
  }

  // The ride was just cancelled above; the re-read builds the response. A
  // null here means it was deleted between the two queries.
  const ride = await rideRepository.findOwnedById(rideId, user.id);
  if (!ride) throw new NotFoundError("Ride not found");
  return toResponse(ride);
}

export async function getRecentRides(
  clerkId: string,
): Promise<RideResponse[]> {
  const user = await requireUserByClerkId(clerkId);

  const rides = await rideRepository.findRecent(user.id);
  return rides.map(toResponse);
}

/** TTL sweep entry point, driven by the interval started in server.ts. */
export async function expireOverdueRides() {
  const expired = await rideRepository.expireOverdue(new Date());
  await Promise.all(
    expired.map((ride) => notifyRideExpired(ride.user.clerkId, ride.id)),
  );
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
    fare: Number(updated.fare),
    timeMinutes: etaMinutesForDistanceKm(offer.distanceKm),
    carPlate: profile.vehiclePlate,
    imageUrl: undefined,
  });

  return toResponse(updated);
}

/**
 * Driver-side rejection: the offer is flipped REJECTED and the dispatcher's
 * next tick escalates the still-pending ride to the next-nearest candidate.
 */
export async function rejectRideRequest(clerkId: string, rideId: string) {
  const profile = await requireApprovedDriver(clerkId);

  const ride = await rideRepository.findByIdWithRider(rideId);
  if (!ride) throw new NotFoundError("Ride not found");

  const rejected = await rideOfferRepository.rejectOffer(ride.id, profile.id);
  if (rejected.count === 0) {
    throw new ConflictError("Offer already responded or expired");
  }
}
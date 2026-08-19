import {
  FARE_BASE,
  FARE_PER_KM,
  NEARBY_RADIUS_KM,
  RIDE_TTL_MS,
} from "../../config";
import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";
import { requireUserByClerkId } from "../../shared/require-user";
import * as directionsService from "../directions/directions.service";
import * as driverRepository from "../drivers/driver.repository";
import * as rideRepository from "./ride.repository";
import { notifyDriverAssigned } from "./ride.notifications";
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

  const updated = await rideRepository.cancelPending(rideId, user.id);
  if (updated.count === 0) {
    throw new ConflictError("Ride is no longer pending");
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
  return rideRepository.expireOverdue(new Date());
}
import { prisma } from "../../config/database";
import { DRIVER_STALE_MS } from "../../config";
import {
  ApprovalStatus,
  type Prisma,
} from "@prisma/client";
import type { DriverPersonalInfo } from "./driver.types";
import type { ApplyDriverDto } from "./driver.validation";

export async function findByUserId(userId: string) {
  return prisma.driverProfile.findUnique({
    where: { userId },
  });
}

export async function findById(id: string) {
  return prisma.driverProfile.findUnique({
    where: { id },
    include: { user: true },
  });
}

export async function upsert(
  userId: string,
  personal: DriverPersonalInfo,
  data: ApplyDriverDto,
) {
  const personalData = {
    firstName: personal.firstName,
    lastName: personal.lastName,
    phone: personal.phone,
  };
  const vehicleData = {
    vehicleType: data.vehicleType,
    vehicleModel: data.vehicleModel,
    vehicleColor: data.vehicleColor,
    vehiclePlate: data.vehiclePlate,
    licenseNumber: data.licenseNumber,
  };

  return prisma.driverProfile.upsert({
    where: { userId },
    update: {
      ...personalData,
      ...vehicleData,
      approvalStatus: ApprovalStatus.PENDING,
      rejectionReason: null,
      rejectedAt: null,
    },
    create: {
      userId,
      ...personalData,
      ...vehicleData,
    },
  });
}

export async function findAll(status?: ApprovalStatus) {
  const where = status ? { approvalStatus: status } : {};
  return prisma.driverProfile.findMany({
    where,
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Applies a status transition only when the profile is currently in
 * `expected`. The guard lives in the WHERE clause, so two concurrent admin
 * actions (or a status changed since the last read) cannot double-apply —
 * the second update simply matches 0 rows. Returns the affected row count.
 */
export async function updateStatusIf(
  id: string,
  expected: ApprovalStatus,
  data: Prisma.DriverProfileUpdateInput,
) {
  return prisma.driverProfile.updateMany({
    where: { id, approvalStatus: expected },
    data,
  });
}

/**
 * Flips a driver online only if they are approved. The approval check lives in
 * the WHERE clause, so an admin suspending the driver mid-request cannot race
 * the write — the rows just won't match. Returns the affected row count.
 */
export async function setOnlineIfApproved(userId: string) {
  return prisma.driverProfile.updateMany({
    where: {
      userId,
      approvalStatus: ApprovalStatus.APPROVED,
    },
    data: {
      isOnline: true,
      lastSeenAt: new Date(),
    },
  });
}

/**
 * Flips a driver offline. Intentionally idempotent: calling it on a driver
 * that is already offline, or has no profile, succeeds silently.
 */
export async function setOffline(userId: string) {
  return prisma.driverProfile.updateMany({
    where: { userId },
    data: {
      isOnline: false,
      lastSeenAt: null,
    },
  });
}

/**
 * Records the driver's latest position and bumps the staleness clock.
 * No-op (0 rows) when no profile exists, matching the idempotent availability
 * posture — a driver pinging once during the offline transition should not 500.
 */
export async function updateLocation(
  userId: string,
  location: { latitude: number; longitude: number; heading?: number },
) {
  return prisma.driverProfile.updateMany({
    where: { userId },
    data: {
      latitude: location.latitude,
      longitude: location.longitude,
      ...(location.heading !== undefined && { heading: location.heading }),
      lastSeenAt: new Date(),
    },
  });
}

const FAKE_CLERK_PREFIX = "fake-clerk-";

/**
 * Returns simulated drivers only — the rider map should never broadcast real
 * emulator sessions alongside fakes, which is what caused marker pile-up.
 */
export async function findOnlineFakeDrivers(limit = 4) {
  return prisma.driverProfile.findMany({
    where: {
      isOnline: true,
      approvalStatus: ApprovalStatus.APPROVED,
      latitude: { not: null },
      longitude: { not: null },
      user: { clerkId: { startsWith: FAKE_CLERK_PREFIX } },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      vehicleType: true,
      vehicleModel: true,
      vehicleColor: true,
      latitude: true,
      longitude: true,
      heading: true,
      lastSeenAt: true,
      user: { select: { id: true, email: true, imageUrl: true } },
    },
    take: limit,
  });
}

/**
 * Returns all drivers currently flagged online, with the fields the admin
 * live map needs. Used for the initial snapshot and socket broadcasts.
 */
export async function findOnlineDrivers() {
  return prisma.driverProfile.findMany({
    where: {
      isOnline: true,
      approvalStatus: ApprovalStatus.APPROVED,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      vehicleType: true,
      vehicleModel: true,
      vehicleColor: true,
      latitude: true,
      longitude: true,
      heading: true,
      lastSeenAt: true,
      user: { select: { id: true, email: true, imageUrl: true } },
    },
  });
}

/**
 * Bumps the staleness clock without moving the driver. Emitted on a fixed
 * interval independent of GPS motion, so a stationary but alive driver is not
 * swept offline by the stale sweep. Idempotent.
 */
export async function refreshSeen(userId: string) {
  return prisma.driverProfile.updateMany({
    where: { userId },
    data: { lastSeenAt: new Date() },
  });
}

/**
 * Counts approved, online drivers inside a square bounding box around a point.
 * The box overestimates near its corners, but for a "X drivers near you" count
 * on the rider screen that bias is acceptable — and keeps the query indexable
 * instead of a haversine scan over the whole table.
 *
 * Near the poles cos(latitude) collapses to zero, which would make the
 * longitude span diverge; the clamped denominator and 180° cap keep the box
 * finite everywhere, degrading to "all longitudes" at the poles where
 * east-west distance is ~0 anyway. Latitude bounds are already enforced by the
 * ride request schema (±90), but the guard makes this util safe standalone.
 */
export async function countNearbyDrivers(
  latitude: number,
  longitude: number,
  radiusKm: number,
) {
  const latDeg = radiusKm / 111;
  const lngDeg = Math.min(
    180,
    radiusKm / (111 * Math.max(Math.cos((latitude * Math.PI) / 180), 1e-6)),
  );
  const freshSince = new Date(Date.now() - DRIVER_STALE_MS);

  return prisma.driverProfile.count({
    where: {
      isOnline: true,
      approvalStatus: ApprovalStatus.APPROVED,
      latitude: { not: null, gte: latitude - latDeg, lte: latitude + latDeg },
      longitude: {
        not: null,
        gte: longitude - lngDeg,
        lte: longitude + lngDeg,
      },
      lastSeenAt: { gte: freshSince },
    },
  });
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * Returns the nearest approved, online drivers inside the bounding box around
 * a point. The box filter stays indexable (same rationale as
 * `countNearbyDrivers`); true haversine distance then prunes box-corner
 * false positives and orders the result nearest-first for the rider map.
 */
export async function findNearbyDrivers(
  latitude: number,
  longitude: number,
  radiusKm: number,
  limit = 6,
) {
  const latDeg = radiusKm / 111;
  const lngDeg = Math.min(
    180,
    radiusKm / (111 * Math.max(Math.cos((latitude * Math.PI) / 180), 1e-6)),
  );
  const freshSince = new Date(Date.now() - DRIVER_STALE_MS);

  const candidates = await prisma.driverProfile.findMany({
    where: {
      isOnline: true,
      approvalStatus: ApprovalStatus.APPROVED,
      latitude: { not: null, gte: latitude - latDeg, lte: latitude + latDeg },
      longitude: {
        not: null,
        gte: longitude - lngDeg,
        lte: longitude + lngDeg,
      },
      lastSeenAt: { gte: freshSince },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      vehicleType: true,
      vehicleModel: true,
      vehicleColor: true,
      latitude: true,
      longitude: true,
      heading: true,
      user: { select: { imageUrl: true } },
    },
  });

  return candidates
    .filter(
      (driver): driver is typeof driver & { latitude: number; longitude: number } =>
        driver.latitude !== null && driver.longitude !== null,
    )
    .map((driver) => ({
      ...driver,
      distanceKm: haversineKm(latitude, longitude, driver.latitude, driver.longitude),
    }))
    .filter((driver) => driver.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
    .map(({ distanceKm: _distanceKm, ...driver }) => driver);
}

/**
 * Real (non-simulated) dispatch candidates: online, approved, fresh, inside
 * the bounding box around a ride origin. Returns the nearest-first list with
 * each driver's clerkId so the dispatcher can address their socket room.
 */
export async function findDispatchCandidates(
  latitude: number,
  longitude: number,
  radiusKm: number,
) {
  const latDeg = radiusKm / 111;
  const lngDeg = Math.min(
    180,
    radiusKm / (111 * Math.max(Math.cos((latitude * Math.PI) / 180), 1e-6)),
  );
  const freshSince = new Date(Date.now() - DRIVER_STALE_MS);

  const candidates = await prisma.driverProfile.findMany({
    where: {
      isOnline: true,
      approvalStatus: ApprovalStatus.APPROVED,
      latitude: { not: null, gte: latitude - latDeg, lte: latitude + latDeg },
      longitude: {
        not: null,
        gte: longitude - lngDeg,
        lte: longitude + lngDeg,
      },
      lastSeenAt: { gte: freshSince },
      user: { clerkId: { not: { startsWith: FAKE_CLERK_PREFIX } } },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      vehicleType: true,
      vehicleModel: true,
      vehicleColor: true,
      vehiclePlate: true,
      latitude: true,
      longitude: true,
      heading: true,
      user: { select: { clerkId: true, imageUrl: true } },
    },
  });

  return candidates
    .filter(
      (driver): driver is typeof driver & { latitude: number; longitude: number } =>
        driver.latitude !== null && driver.longitude !== null,
    )
    .map((driver) => ({
      ...driver,
      distanceKm: haversineKm(latitude, longitude, driver.latitude, driver.longitude),
    }))
    .filter((driver) => driver.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Flips drivers offline whose last location ping is older than `before`.
 * Treats silence as offline — the driver's device is not trustworthy here
 * (app killed, connection lost), so the server makes the call.
 */
export async function markStaleDriversOffline(before: Date) {
  return prisma.driverProfile.updateMany({
    where: {
      isOnline: true,
      OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: before } }],
    },
    data: { isOnline: false },
  });
}

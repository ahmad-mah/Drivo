import { prisma } from "../../config/database";
import {
  ApprovalStatus,
  type Prisma,
} from "@prisma/client";
import type { CreateDriverDto, DriverPersonalInfo } from "./driver.types";

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
  data: CreateDriverDto,
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

export async function updateStatus(
  id: string,
  data: Prisma.DriverProfileUpdateInput,
) {
  return prisma.driverProfile.update({
    where: { id },
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
  location: { latitude: number; longitude: number },
) {
  return prisma.driverProfile.updateMany({
    where: { userId },
    data: {
      latitude: location.latitude,
      longitude: location.longitude,
      lastSeenAt: new Date(),
    },
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
      latitude: true,
      longitude: true,
      lastSeenAt: true,
      vehicleType: true,
      user: { select: { id: true, email: true } },
    },
  });
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

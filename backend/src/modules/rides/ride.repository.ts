import { prisma } from "../../config/database";
import {
  RideStatus,
  type Prisma,
} from "@prisma/client";

export async function create(data: Prisma.RideCreateInput) {
  return prisma.ride.create({ data });
}

/** The user's current ride — the invariant "one active ride per user". */
export async function findActiveByUser(userId: string) {
  return prisma.ride.findFirst({
    where: {
      userId,
      status: { in: [RideStatus.PENDING, RideStatus.ACCEPTED] },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findOwnedById(id: string, userId: string) {
  return prisma.ride.findFirst({
    where: { id, userId },
  });
}

/**
 * Atomic PENDING → CANCELLED flip. Returns the affected row count so the
 * service can reject cancels that raced an accept or a previous cancel.
 */
export async function cancelPending(id: string, userId: string) {
  return prisma.ride.updateMany({
    where: { id, userId, status: RideStatus.PENDING },
    data: { status: RideStatus.CANCELLED, cancelledAt: new Date() },
  });
}

/**
 * Atomic PENDING → ACCEPTED flip. The status guard makes it safe to run
 * concurrently with a cancel or the expiry sweep: only the first writer
 * touches each row.
 */
export async function acceptPending(
  id: string,
  userId: string,
  driver: { driverId: string; driverFirstName: string; driverLastName: string },
) {
  return prisma.ride.updateMany({
    where: { id, userId, status: RideStatus.PENDING },
    data: { status: RideStatus.ACCEPTED, ...driver },
  });
}

/**
 * Sweep that flips overdue pending rides to EXPIRED. The status guard makes it
 * safe to run concurrently with a cancel or an accept: only the first writer
 * touches each row.
 */
export async function expireOverdue(before: Date) {
  return prisma.ride.updateMany({
    where: {
      status: RideStatus.PENDING,
      expiresAt: { lt: before },
    },
    data: { status: RideStatus.EXPIRED },
  });
}

export async function findRecent(userId: string, limit = 10) {
  return prisma.ride.findMany({
    where: { userId, status: RideStatus.COMPLETED },
    orderBy: { completedAt: "desc" },
    take: limit,
  });
}
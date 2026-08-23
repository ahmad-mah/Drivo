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

/** Ride with its owner's clerkId — needed to address the rider's socket room. */
export async function findByIdWithRider(id: string) {
  return prisma.ride.findUnique({
    where: { id },
    include: { user: { select: { clerkId: true } } },
  });
}

/**
 * Atomic PENDING/ACCEPTED → CANCELLED flip. Accepting cancels too so a rider
 * can back out after a driver accepted (interim until trip lifecycle lands) —
 * the driver's client simply drops its accepted context. Returns the affected
 * row count so the service can reject cancels that raced an expiry.
 */
export async function cancelActive(id: string, userId: string) {
  return prisma.ride.updateMany({
    where: {
      id,
      userId,
      status: { in: [RideStatus.PENDING, RideStatus.ACCEPTED] },
    },
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
 * Sweep that flips overdue pending rides to EXPIRED and returns them with
 * their riders' clerkIds so the service can push `ride:expired`. Each ride is
 * updated individually behind the PENDING guard — a ride accepted between the
 * read and the write stays accepted and is excluded from the result.
 */
export async function expireOverdue(before: Date) {
  const overdue = await prisma.ride.findMany({
    where: { status: RideStatus.PENDING, expiresAt: { lt: before } },
    select: { id: true, user: { select: { clerkId: true } } },
  });

  const expired: { id: string; user: { clerkId: string } }[] = [];
  for (const ride of overdue) {
    const result = await prisma.ride.updateMany({
      where: { id: ride.id, status: RideStatus.PENDING },
      data: { status: RideStatus.EXPIRED },
    });
    if (result.count > 0) expired.push(ride);
  }
  return expired;
}

export async function findRecent(userId: string, limit = 10) {
  return prisma.ride.findMany({
    where: { userId, status: RideStatus.COMPLETED },
    orderBy: { completedAt: "desc" },
    take: limit,
  });
}
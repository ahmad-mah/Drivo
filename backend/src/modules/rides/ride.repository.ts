import { prisma } from "../../config/database";
import { RIDE_TTL_MS } from "../../config";
import {
  RideStatus,
  type Prisma,
  type Ride,
} from "@prisma/client";

export async function create(data: Prisma.RideCreateInput) {
  return prisma.ride.create({ data });
}

/** The user's current ride — the invariant "one active ride per user". */
export async function findActiveByUser(userId: string) {
  return prisma.ride.findFirst({
    where: {
      userId,
      status: {
        in: [RideStatus.PENDING, RideStatus.ACCEPTED, RideStatus.ARRIVED, RideStatus.IN_PROGRESS, RideStatus.TRIP_ENDED],
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      driver: { select: { ratingSum: true, ratingCount: true } },
    },
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
    include: {
      user: { select: { clerkId: true } },
      driver: { select: { ratingSum: true, ratingCount: true } },
    },
  });
}

/**
 * Rider cancellation: allowed while PENDING, ACCEPTED or ARRIVED — blocked
 * once the trip is IN_PROGRESS (the service pre-check gives a clearer
 * message; this guard is the race-safe backstop).
 */
export async function cancelActive(id: string, userId: string) {
  return prisma.ride.updateMany({
    where: {
      id,
      userId,
      status: {
        in: [RideStatus.PENDING, RideStatus.ACCEPTED, RideStatus.ARRIVED],
      },
    },
    data: { status: RideStatus.CANCELLED, cancelledAt: new Date() },
  });
}

/**
 * Driver marks the rider a no-show: the wait window elapsed with nobody at
 * pickup. ARRIVED → CANCELLED, terminal — no re-dispatch to an empty curb.
 */
export async function markRiderNoShow(rideId: string, driverId: string) {
  const result = await prisma.ride.updateMany({
    where: { id: rideId, driverId, status: RideStatus.ARRIVED },
    data: {
      status: RideStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: "rider_no_show",
    },
  });
  if (result.count === 0) return null;
  return prisma.ride.findUnique({ where: { id: rideId } });
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
 * The driver's current trip, if any — the restore path when the driver app
 * restarts or reconnects mid-trip.
 */
export async function findActiveByDriver(driverId: string) {
  return prisma.ride.findFirst({
    where: {
      driverId,
      status: { in: [RideStatus.ACCEPTED, RideStatus.ARRIVED, RideStatus.IN_PROGRESS, RideStatus.TRIP_ENDED] },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Set the rider's rating once, on a completed ride — guarded against doubles. */
export function setRiderRating(
  rideId: string,
  userId: string,
  stars: number,
  comment?: string,
) {
  return prisma.ride.updateMany({
    where: { id: rideId, userId, status: RideStatus.COMPLETED, riderRating: null },
    data: {
      riderRating: stars,
      ...(comment && { riderComment: comment }),
    },
  });
}

/**
 * Cancels a still-unmatched PENDING ride with an explicit reason — used by
 * the driver-decline flow so the rider is bounced back to the driver list.
 */
export async function cancelPendingWithReason(rideId: string, reason: string) {
  const result = await prisma.ride.updateMany({
    where: { id: rideId, status: RideStatus.PENDING },
    data: { status: RideStatus.CANCELLED, cancelledAt: new Date(), cancelReason: reason },
  });
  if (result.count === 0) return null;
  return prisma.ride.findUnique({ where: { id: rideId } });
}

/**
 * Full paginated history: completions and cancellations the user
 * participated in as the rider (EXPIRED excluded by product decision).
 */
export async function findHistory(
  userId: string,
  limit: number,
  offset: number,
) {
  return prisma.ride.findMany({
    where: {
      userId,
      status: { in: [RideStatus.COMPLETED, RideStatus.CANCELLED] },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      driver: { select: { ratingSum: true, ratingCount: true } },
    },
  });
}

/**
 * Atomic guarded transition for driver actions (arrive/start/complete).
 * The WHERE clause carries both ownership and expected status, so double
 * taps, rider cancels racing a start, and stale screens all lose cleanly
 * with a 0-row result instead of corrupting the state machine.
 */
export async function transitionForDriver(
  rideId: string,
  driverId: string,
  from: RideStatus[],
  to: RideStatus,
) {
  const extra =
    to === RideStatus.ARRIVED
      ? { arrivedAt: new Date() }
      : to === RideStatus.IN_PROGRESS
        ? { startedAt: new Date() }
        : to === RideStatus.COMPLETED
          ? { completedAt: new Date() }
          : {};

  const result = await prisma.ride.updateMany({
    where: { id: rideId, driverId, status: { in: from } },
    data: { status: to, ...extra },
  });
  if (result.count === 0) return null;
  return prisma.ride.findUnique({ where: { id: rideId } });
}

/**
 * Driver-initiated cancellation, phase-aware:
 * - pre-trip (ACCEPTED/ARRIVED): the ride re-enters PENDING with the driver
 *   snapshot cleared so the dispatcher escalates to the next candidate
 * - mid-trip (IN_PROGRESS): the ride terminates as CANCELLED — no
 *   re-dispatch with the rider in the car (reason fixed server-side)
 */
export async function cancelByDriver(
  rideId: string,
  driverId: string,
): Promise<{ ride: Ride | null; redispatched: boolean }> {
  const redispatch = await prisma.ride.updateMany({
    where: {
      id: rideId,
      driverId,
      status: { in: [RideStatus.ACCEPTED, RideStatus.ARRIVED] },
    },
    data: {
      status: RideStatus.PENDING,
      driverId: null,
      driverFirstName: null,
      driverLastName: null,
      expiresAt: new Date(Date.now() + RIDE_TTL_MS),
    },
  });
  if (redispatch.count > 0) {
    return { ride: await prisma.ride.findUnique({ where: { id: rideId } }), redispatched: true };
  }

  const abort = await prisma.ride.updateMany({
    where: { id: rideId, driverId, status: RideStatus.IN_PROGRESS },
    data: {
      status: RideStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: "driver_cancelled_trip",
    },
  });
  if (abort.count > 0) {
    return { ride: await prisma.ride.findUnique({ where: { id: rideId } }), redispatched: false };
  }

  return { ride: null, redispatched: false };
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

/**
 * Full history: completions and cancellations the user participated in as
 * the rider (EXPIRED rides excluded by product decision). Driver averages
 * ride along so cards can show them without extra queries.
 */
/**
 * The most recent ride that ended within the grace window (completed or
 * cancelled) — lets clients render the true terminal state right after it
 * happens instead of falling into "no ride" handling.
 */
export async function findRecentlyEnded(userId: string, since: Date) {
  return prisma.ride.findFirst({
    where: {
      userId,
      status: { in: [RideStatus.COMPLETED, RideStatus.CANCELLED] },
      OR: [{ completedAt: { gte: since } }, { cancelledAt: { gte: since } }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      driver: { select: { ratingSum: true, ratingCount: true } },
    },
  });
}

/**
 * Home preview: the few most recent rides (completions + cancellations).
 * The History tab paginates everything via `findHistory`.
 */
export async function findRecent(userId: string, limit = 3) {
  return prisma.ride.findMany({
    where: {
      userId,
      status: { in: [RideStatus.COMPLETED, RideStatus.CANCELLED] },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      driver: { select: { ratingSum: true, ratingCount: true } },
    },
  });
}
import { prisma } from "../../config/database";
import { RideOfferStatus } from "@prisma/client";

/**
 * Creates a dispatch offer. The (rideId, driverId) unique index makes this
 * idempotent across escalation cycles — re-offering a driver after their
 * cooldown simply revives the existing row back to OFFERED.
 */
export async function createOffer(data: {
  rideId: string;
  driverId: string;
  distanceKm: number;
}) {
  return prisma.rideOffer.upsert({
    where: {
      rideId_driverId: { rideId: data.rideId, driverId: data.driverId },
    },
    update: {
      status: RideOfferStatus.OFFERED,
      distanceKm: data.distanceKm,
      offeredAt: new Date(),
      respondedAt: null,
    },
    create: data,
  });
}

export async function findByRideAndDriver(rideId: string, driverId: string) {
  return prisma.rideOffer.findUnique({
    where: { rideId_driverId: { rideId, driverId } },
  });
}

/**
 * Expires offers whose response window elapsed. Returns the affected rides'
 * ids so the dispatcher can immediately escalate those rides to new
 * candidates instead of waiting for the next sweep tick.
 */
export async function expireStaleOffers(before: Date): Promise<string[]> {
  const stale = await prisma.rideOffer.findMany({
    where: { status: RideOfferStatus.OFFERED, offeredAt: { lt: before } },
    select: { rideId: true },
  });

  await prisma.rideOffer.updateMany({
    where: { status: RideOfferStatus.OFFERED, offeredAt: { lt: before } },
    data: { status: RideOfferStatus.EXPIRED },
  });

  return [...new Set(stale.map((offer) => offer.rideId))];
}

const RIDE_DISPATCH_SELECT = {
  id: true,
  originAddress: true,
  originLatitude: true,
  originLongitude: true,
  destinationAddress: true,
  destinationLatitude: true,
  destinationLongitude: true,
  distanceKm: true,
  fare: true,
  currency: true,
  user: { select: { clerkId: true } },
} as const;

/**
 * Pending rides with no open offer — the dispatcher's work queue. Rides that
 * already reached a driver are skipped until that offer resolves; escalation
 * happens via `expireStaleOffers` flipping it to EXPIRED.
 */
export async function findUnofferedPendingRides() {
  return prisma.ride.findMany({
    where: {
      status: "PENDING",
      expiresAt: { gt: new Date() },
      offers: { none: {} },
    },
    select: RIDE_DISPATCH_SELECT,
  });
}

/**
 * Rides whose only open offers just expired and must be escalated. Re-offered
 * candidates exclude drivers who already rejected or let an offer lapse for
 * this ride — they had their chance.
 */
export async function findRidesNeedingEscalation(rideIds: string[]) {
  return prisma.ride.findMany({
    where: {
      id: { in: rideIds },
      status: "PENDING",
      expiresAt: { gt: new Date() },
      offers: { none: { status: RideOfferStatus.OFFERED } },
    },
    select: RIDE_DISPATCH_SELECT,
  });
}

/**
 * Driver ids excluded from dispatch right now: anyone whose previous offer
 * on this ride was rejected (or silently expired) within the cooldown
 * window. Older responders become eligible again — a rejection is a
 * cooldown, not a lifetime ban.
 */
export async function findRecentlyRespondedDriverIds(
  rideId: string,
  cooldownMs: number,
) {
  const cutoff = new Date(Date.now() - cooldownMs);
  const rows = await prisma.rideOffer.findMany({
    where: {
      rideId,
      status: { not: RideOfferStatus.OFFERED },
      OR: [
        { respondedAt: { gte: cutoff } },
        { respondedAt: null, offeredAt: { gte: cutoff } },
      ],
    },
    select: { driverId: true },
  });
  return rows.map((row) => row.driverId);
}

/** Total responded offers on a ride — drives the radius-widening ladder. */
export async function countRespondedOffers(rideId: string) {
  return prisma.rideOffer.count({
    where: { rideId, status: { not: RideOfferStatus.OFFERED } },
  });
}

/**
 * Expires every OFFERED offer on a ride and returns the holding drivers'
 * clerkIds — used when a rider cancels so waiting drivers dismiss their
 * cards instantly.
 */
export async function expireOpenOffers(rideId: string): Promise<string[]> {
  const open = await prisma.rideOffer.findMany({
    where: { rideId, status: RideOfferStatus.OFFERED },
    select: { driver: { select: { user: { select: { clerkId: true } } } } },
  });

  await prisma.rideOffer.updateMany({
    where: { rideId, status: RideOfferStatus.OFFERED },
    data: { status: RideOfferStatus.EXPIRED },
  });

  return open.map((offer) => offer.driver.user.clerkId);
}

/**
 * Accepts this driver's OFFERED offer and claims the PENDING ride in one
 * transaction. The guards live in each WHERE clause:
 *
 * - the offer update matches only while still OFFERED (reject/timeout raced)
 * - the ride update matches only while PENDING and unexpired (cancel/expiry)
 *
 * If the ride write loses the race the transaction throws and the offer
 * acceptance rolls back with it. Remaining OFFERED offers for the ride are
 * expired so no other driver is left holding a phantom request.
 */
export async function acceptOffer(
  rideId: string,
  driverId: string,
  rideOwnerUserId: string,
  driver: {
    driverFirstName: string;
    driverLastName: string;
    seats: number;
  },
) {
  return prisma.$transaction(async (tx) => {
    const offer = await tx.rideOffer.updateMany({
      where: {
        rideId,
        driverId,
        status: RideOfferStatus.OFFERED,
      },
      data: { status: RideOfferStatus.ACCEPTED, respondedAt: new Date() },
    });
    if (offer.count === 0) return null;

    const ride = await tx.ride.updateMany({
      where: {
        id: rideId,
        userId: rideOwnerUserId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      data: {
        status: "ACCEPTED",
        driverId,
        seats: driver.seats,
        driverFirstName: driver.driverFirstName,
        driverLastName: driver.driverLastName,
      },
    });
    if (ride.count === 0) {
      // Not a typed error on purpose: throwing inside $transaction rolls back
      // the offer acceptance above, then the service maps this to a Conflict.
      throw new Error("RIDE_NO_LONGER_PENDING");
    }

    await tx.rideOffer.updateMany({
      where: { rideId, status: RideOfferStatus.OFFERED },
      data: { status: RideOfferStatus.EXPIRED },
    });

    return prisma.ride.findUnique({ where: { id: rideId } });
  });
}

/**
 * Marks this driver's OFFERED offer rejected so the dispatcher escalates to
 * the next candidate on its next tick.
 */
export async function rejectOffer(rideId: string, driverId: string) {
  return prisma.rideOffer.updateMany({
    where: { rideId, driverId, status: RideOfferStatus.OFFERED },
    data: { status: RideOfferStatus.REJECTED, respondedAt: new Date() },
  });
}

import { prisma } from "../../config/database";
import { RideOfferStatus } from "@prisma/client";

/**
 * Creates a dispatch offer. The (rideId, driverId) unique index makes a
 * re-offer of the same driver idempotent — the dispatcher may re-scan a ride
 * before the previous offer expired, and the second create simply loses.
 */
export async function createOffer(data: {
  rideId: string;
  driverId: string;
  distanceKm: number;
}) {
  return prisma.rideOffer.create({ data });
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

/** Driver ids that already received an offer on this ride (any terminal state). */
export async function findRespondedDriverIds(rideId: string) {
  const rows = await prisma.rideOffer.findMany({
    where: { rideId, status: { not: RideOfferStatus.OFFERED } },
    select: { driverId: true },
  });
  return rows.map((row) => row.driverId);
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
  driver: { driverFirstName: string; driverLastName: string },
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
        ...driver,
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

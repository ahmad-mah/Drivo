import { DISPATCH_RADIUS_KM, OFFER_TTL_MS } from "../../config";
import * as driverRepository from "../drivers/driver.repository";
import { etaMinutesForDistanceKm } from "./dispatch.utils";
import {
  notifyNewRideRequest,
  type IncomingRideRequest,
} from "./ride.notifications";
import * as rideOfferRepository from "./ride-offer.repository";

type DispatchableRide = Awaited<
  ReturnType<typeof rideOfferRepository.findUnofferedPendingRides>
>[number];

/**
 * Offers the ride to the nearest candidate that has not already had a chance
 * on this ride. One driver at a time: a sequential offer keeps acceptance
 * unambiguous (no two drivers both seeing "accept" with one silently losing).
 */
async function dispatchToNextCandidate(ride: DispatchableRide): Promise<boolean> {
  const candidates = await driverRepository.findDispatchCandidates(
    ride.originLatitude,
    ride.originLongitude,
    DISPATCH_RADIUS_KM,
  );
  if (candidates.length === 0) {
    // The #1 "driver sees nothing" cause: no approved+online+fresh driver
    // inside DISPATCH_RADIUS_KM of the pickup point.
    console.log(
      `[dispatcher] ride ${ride.id}: no dispatchable drivers within ${DISPATCH_RADIUS_KM}km`,
    );
    return false;
  }

  // Drivers who already rejected or let an offer expire for this ride are
  // excluded — escalation must move forward, not loop over the same person.
  const triedDriverIds = new Set(
    await rideOfferRepository.findRespondedDriverIds(ride.id),
  );
  const next = candidates.find((candidate) => !triedDriverIds.has(candidate.id));
  if (!next) {
    console.log(
      `[dispatcher] ride ${ride.id}: ${candidates.length} candidates but all already responded`,
    );
    return false;
  }

  await rideOfferRepository.createOffer({
    rideId: ride.id,
    driverId: next.id,
    distanceKm: next.distanceKm,
  });
  console.log(
    `[dispatcher] ride ${ride.id} → offered to ${next.firstName} ${next.lastName} (${next.distanceKm.toFixed(2)}km away)`,
  );

  const payload: IncomingRideRequest = {
    rideId: ride.id,
    originAddress: ride.originAddress,
    originLatitude: ride.originLatitude,
    originLongitude: ride.originLongitude,
    destinationAddress: ride.destinationAddress,
    destinationLatitude: ride.destinationLatitude,
    destinationLongitude: ride.destinationLongitude,
    tripDistanceKm: ride.distanceKm,
    fare: Number(ride.fare),
    currency: ride.currency,
    etaMinutes: etaMinutesForDistanceKm(next.distanceKm),
    respondWithinSeconds: Math.round(OFFER_TTL_MS / 1000),
  };
  await notifyNewRideRequest(next.user.clerkId, payload);
  return true;
}

/**
 * The realtime matching engine. Every tick it:
 *
 * 1. expires offers past their response window and collects those rides for
 *    immediate re-dispatch (timeout handling)
 * 2. offers each unoffered pending ride to its nearest online real driver,
 *    escalating through rejected/timed-out candidates nearest-first
 *
 * Rides with no reachable real driver stay untouched so the fake-driver
 * simulator can still service them in development.
 */
export function startRideDispatcher() {
  setInterval(async () => {
    try {
      const escalated = await rideOfferRepository.expireStaleOffers(
        new Date(Date.now() - OFFER_TTL_MS),
      );

      const [fresh, escalations] = await Promise.all([
        rideOfferRepository.findUnofferedPendingRides(),
        escalated.length > 0
          ? rideOfferRepository.findRidesNeedingEscalation(escalated)
          : Promise.resolve([] as DispatchableRide[]),
      ]);

      for (const ride of [...fresh, ...escalations]) {
        try {
          await dispatchToNextCandidate(ride);
        } catch (err) {
          console.error("[dispatcher] offer failed", err);
        }
      }
    } catch (err) {
      console.error("[dispatcher] sweep failed", err);
    }
  }, 1_000);
}

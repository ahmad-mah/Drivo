import {
  DISPATCH_RADIUS_LADDER_KM,
  WIDEN_EVERY_OFFERS,
} from "../../config";

/** Pickup ETA from the driver's distance to the origin, assuming 30 km/h. */
export function etaMinutesForDistanceKm(distanceKm: number) {
  return Math.max(1, Math.round((distanceKm / 30) * 60));
}

/**
 * Progressive search radius: the base rung while offers are fresh, widening
 * every WIDEN_EVERY_OFFERS failed attempts — industry-standard escalation
 * so a ride exhausts nearby drivers before reaching further ones.
 */
export function dispatchRadiusForAttempts(failedOffers: number): number {
  const stepsWidened = Math.floor(failedOffers / WIDEN_EVERY_OFFERS);
  const index = Math.min(stepsWidened, DISPATCH_RADIUS_LADDER_KM.length - 1);
  return DISPATCH_RADIUS_LADDER_KM[index];
}

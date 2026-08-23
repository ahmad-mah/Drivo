/** Pickup ETA from the driver's distance to the origin, assuming 30 km/h. */
export function etaMinutesForDistanceKm(distanceKm: number) {
  return Math.max(1, Math.round((distanceKm / 30) * 60));
}

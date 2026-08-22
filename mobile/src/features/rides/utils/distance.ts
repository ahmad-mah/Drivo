const EARTH_RADIUS_M = 6_371_000;

/** Great-circle distance between two coordinates, in meters (haversine). */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/** True when both coordinates are within a fixed degree tolerance of each other. */
export function coordsWithinTolerance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  toleranceDeg: number,
): boolean {
  return (
    Math.abs(lat2 - lat1) < toleranceDeg &&
    Math.abs(lon2 - lon1) < toleranceDeg
  );
}
/** How long a ride waits for a driver before it expires. */
export const RIDE_TTL_MS = 60_000;

/** How often overdue rides are swept to EXPIRED. */
export const RIDE_EXPIRY_SWEEP_INTERVAL_MS = 5_000;

/** Flat pickup fee in the ride currency. */
export const FARE_BASE = 3.0;

/** Per-kilometer fare in the ride currency. */
export const FARE_PER_KM = 1.2;

/** Radius used to count nearby online drivers for a ride request. */
export const NEARBY_RADIUS_KM = 1;

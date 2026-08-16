/** How long a driver can go silent before being flipped offline. */
export const DRIVER_STALE_MS = 15_000;

/** How often the staleness sweep scans for silent drivers. */
export const STALE_CHECK_INTERVAL_MS = 5_000;

/** Coalescing window for nearby-driver socket broadcasts; kept well below the
 * fake fleet's 10s movement tick so each new position ships without lag. */
export const NEARBY_DRIVERS_BROADCAST_MS = 2_000;

/** How long a ride waits for a driver before it expires. */
export const RIDE_TTL_MS = 60_000;

/** How often overdue rides are swept to EXPIRED. */
export const RIDE_EXPIRY_SWEEP_INTERVAL_MS = 5_000;

/**
 * A driver-matched ride sitting in ACCEPTED/ARRIVED longer than this is
 * logged as stuck — no automatic action, pure observability (per industry
 * guidance: a stuck trip you don't monitor is invisible).
 */
export const STUCK_TRIP_LOG_MS = 30 * 60_000;
export const STUCK_TRIP_LOG_INTERVAL_MS = 60_000;

/** Flat pickup fee in the ride currency. */
export const FARE_BASE = 3.0;

/** Per-kilometer fare in the ride currency. */
export const FARE_PER_KM = 1.2;

/** Radius used to count nearby online drivers for a ride request. */
export const NEARBY_RADIUS_KM = 1;

/**
 * How long a single driver has to respond to a dispatch offer before it is
 * expired and the ride escalates to the next-nearest candidate.
 */
export const OFFER_TTL_MS = 20_000;

/**
 * How long a driver who rejected (or let expire) an offer is excluded from
 * being re-offered the same ride. Cooldown, not a lifetime ban — drivers
 * mis-tap reject, and small fleets need the second chance.
 */
export const REOFFER_COOLDOWN_MS = 30_000;

/** How often the dispatcher sweeps stale offers and unoffered pending rides. */
export const DISPATCH_SWEEP_INTERVAL_MS = 1_000;

/** Radius used to find real dispatch candidates around a ride origin. */
export const DISPATCH_RADIUS_KM = 3;

/**
 * How long a driver waits at pickup before they may mark the rider a
 * no-show (Uber standard: 2–5 minutes depending on tier).
 */
export const NO_SHOW_WAIT_MS = 3 * 60_000;

/**
 * Progressive search: after every WIDEN_EVERY_OFFERS failed offers, the
 * dispatch radius widens to the next rung of the ladder.
 */
export const DISPATCH_RADIUS_LADDER_KM: readonly number[] = [3, 6, 12];
export const WIDEN_EVERY_OFFERS = 2;

/**
 * Grace window after a ride ends: GET /rides/me/active keeps returning the
 * just-ended ride so clients render its true terminal state (completed vs
 * cancelled) instead of falling into "no ride" handling.
 */
export const RIDE_ENDED_GRACE_MS = 3 * 60_000;

/** Home shows a small preview; the History tab paginates everything. */
export const RECENT_RIDES_LIMIT_DEFAULT = 3;
export const HISTORY_PAGE_SIZE = 20;

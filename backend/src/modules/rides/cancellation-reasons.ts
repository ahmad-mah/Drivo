/**
 * Cancellation reason catalog. Fixed server-side reasons (no-show, driver
 * abort) are set by the service; actor-chosen ones arrive validated from the
 * client against these lists.
 */

export const RIDER_CANCEL_REASONS = [
  "change_of_plans",
  "booked_by_accident",
  "driver_taking_too_long",
  "wrong_pickup",
  "other",
] as const;

export const DRIVER_CANCEL_REASONS = [
  "too_far_away",
  "cannot_reach_pickup",
  "vehicle_issue",
  "other",
] as const;

/** Driver abort mid-trip — fixed, not chosen. */
export const DRIVER_ABORTED_REASON = "driver_cancelled_trip";

/** Rider never appeared at pickup within the wait window. */
export const NO_SHOW_REASON = "rider_no_show";

/** Driver explicitly rejected the dispatch — ride cancels so the rider
 *  re-picks another driver from the list immediately. */
export const DRIVER_DECLINED_REASON = "driver_declined";

export type RiderCancelReason = (typeof RIDER_CANCEL_REASONS)[number];
export type DriverCancelReason = (typeof DRIVER_CANCEL_REASONS)[number];

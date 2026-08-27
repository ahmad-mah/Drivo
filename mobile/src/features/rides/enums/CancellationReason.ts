/**
 * Cancellation / decline reasons that the backend may set on a ride.
 * Must stay in sync with `backend/src/modules/rides/cancellation-reasons.ts`.
 */
export enum CancellationReason {
  DRIVER_DECLINED = "driver_declined",
  RIDER_NO_SHOW = "rider_no_show",
  DRIVER_CANCELLED_TRIP = "driver_cancelled_trip",
  CHANGE_OF_PLANS = "change_of_plans",
  BOOKED_BY_ACCIDENT = "booked_by_accident",
  DRIVER_TAKING_TOO_LONG = "driver_taking_too_long",
  WRONG_PICKUP = "wrong_pickup",
  TOO_FAR_AWAY = "too_far_away",
  CANNOT_REACH_PICKUP = "cannot_reach_pickup",
  VEHICLE_ISSUE = "vehicle_issue",
  OTHER = "other",
}

/**
 * Display labels for cancellation reasons that can appear on history items
 * or snackbars.
 */
export const CANCEL_REASON_LABELS: Record<CancellationReason, string> = {
  [CancellationReason.DRIVER_DECLINED]: "Driver declined",
  [CancellationReason.RIDER_NO_SHOW]: "Rider didn't show up",
  [CancellationReason.DRIVER_CANCELLED_TRIP]: "Driver cancelled the trip",
  [CancellationReason.CHANGE_OF_PLANS]: "Change of plans",
  [CancellationReason.BOOKED_BY_ACCIDENT]: "Booked by accident",
  [CancellationReason.DRIVER_TAKING_TOO_LONG]: "Driver is taking too long",
  [CancellationReason.WRONG_PICKUP]: "Pickup location is wrong",
  [CancellationReason.TOO_FAR_AWAY]: "Too far away",
  [CancellationReason.CANNOT_REACH_PICKUP]: "Can't reach the pickup point",
  [CancellationReason.VEHICLE_ISSUE]: "Vehicle issue",
  [CancellationReason.OTHER]: "Other",
};

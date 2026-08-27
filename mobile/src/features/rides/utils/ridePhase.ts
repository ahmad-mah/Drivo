import { RideStatus, TERMINAL_RIDE_STATUSES } from "../enums/RideStatus";
import { CancellationReason } from "../enums/CancellationReason";
import type { Ride } from "../types/ride.types";

/** Drops grace-period or terminal rides so stale data never drives the sheet. */
export function toLiveRide(ride: Ride | null | undefined): Ride | null {
  if (!ride) return null;
  if (TERMINAL_RIDE_STATUSES.includes(ride.status)) return null;
  return ride;
}

export enum RidePhase {
  IDLE = "idle",
  SEARCHING = "searching",
  TRIP = "trip",
  ENDED = "ended",
}

/**
 * Pure function: derives the UI phase from the current ride status.
 *
 * `wasInTrip` indicates the ride was previously in ACCEPTED/ARRIVED/IN_PROGRESS.
 * When the ride goes back to PENDING after being in trip, it's a re-dispatch
 * (driver cancelled pre-trip) and should map to ENDED, not SEARCHING.
 */
export function deriveRidePhase(
  ride: Ride | null,
  wasInTrip: boolean,
): RidePhase {
  if (!ride) return RidePhase.IDLE;

  if (ride.status === RideStatus.PENDING) {
    if (wasInTrip) return RidePhase.ENDED;
    return RidePhase.SEARCHING;
  }

  if (
    ride.status === RideStatus.CANCELLED ||
    ride.status === RideStatus.EXPIRED
  ) {
    return RidePhase.ENDED;
  }

  // ACCEPTED / ARRIVED / IN_PROGRESS / COMPLETED
  return RidePhase.TRIP;
}

/**
 * Pure function: derives the snackbar message when a ride ends.
 * Returns null when no snackbar should be shown (rider-initiated cancel, completion).
 */
export function getEndedMessage(ride: Ride | null): string | null {
  if (!ride) return null;

  if (ride.status === RideStatus.EXPIRED) {
    return "No drivers available right now";
  }

  switch (ride.cancelReason) {
    case CancellationReason.DRIVER_DECLINED:
      return "Driver cancelled your request";
    case CancellationReason.DRIVER_CANCELLED_TRIP:
      return "Driver cancelled your trip";
    case CancellationReason.RIDER_NO_SHOW:
      return "Driver marked you as no-show";
    case null:
      return null;
    default:
      return "Ride was cancelled";
  }
}

import { RideStatus } from "@/features/rides/enums/RideStatus";

/** Primary action label per trip status — advances the lifecycle. */
export const TRIP_PRIMARY_LABELS: Record<string, string> = {
  [RideStatus.ACCEPTED]: "I've arrived",
  [RideStatus.ARRIVED]: "Start trip",
  [RideStatus.IN_PROGRESS]: "Arrived at destination",
  [RideStatus.TRIP_ENDED]: "Trip ended",
};

/** Contextual hint line under the route rows. */
export const TRIP_STATUS_HINTS: Record<string, string> = {
  [RideStatus.ACCEPTED]: "Head to the pickup point",
  [RideStatus.ARRIVED]: "Waiting for the rider",
  [RideStatus.IN_PROGRESS]: "Trip underway — drive safely",
  [RideStatus.TRIP_ENDED]: "Waiting for rider payment",
};

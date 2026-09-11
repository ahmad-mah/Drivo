import { RideStatus } from "@/features/rides/enums/RideStatus";

/** Rider-facing headline per trip status. */
export const TRIP_TITLES: Record<string, string> = {
  [RideStatus.ACCEPTED]: "Driver is on the way",
  [RideStatus.ARRIVED]: "Your driver has arrived",
  [RideStatus.IN_PROGRESS]: "Heading to your destination",
  [RideStatus.TRIP_ENDED]: "Trip ended — payment due",
};

export const STATUS_ICONS: Record<string, number> = {
  [RideStatus.ACCEPTED]: require("@/assets/icons/point.png"),
  [RideStatus.ARRIVED]: require("@/assets/icons/check.png"),
  [RideStatus.IN_PROGRESS]: require("@/assets/icons/marker.png"),
  [RideStatus.TRIP_ENDED]: require("@/assets/icons/dollar.png"),
  [RideStatus.COMPLETED]: require("@/assets/icons/check.png"),
};

export const STATUS_BG: Record<string, string> = {
  [RideStatus.ACCEPTED]: "bg-primary-500",
  [RideStatus.ARRIVED]: "bg-green-500",
  [RideStatus.IN_PROGRESS]: "bg-primary-500",
  [RideStatus.TRIP_ENDED]: "bg-amber-500",
  [RideStatus.COMPLETED]: "bg-primary-500",
};

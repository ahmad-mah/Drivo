import { RideStatus } from "@/features/rides/enums/RideStatus";

/** Rider-facing headline per trip status. */
export const TRIP_TITLES: Record<string, string> = {
  [RideStatus.ACCEPTED]: "Driver is on the way",
  [RideStatus.ARRIVED]: "Your driver has arrived",
  [RideStatus.IN_PROGRESS]: "Heading to your destination",
  [RideStatus.TRIP_ENDED]: "Trip ended — payment due",
};

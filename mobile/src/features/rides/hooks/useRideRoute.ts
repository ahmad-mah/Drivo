import { useMemo } from "react";
import { useDirections } from "./useDirections";
import type { Ride, RidePoint } from "../types/ride.types";

/**
 * Derives origin/destination points and the route from an active ride.
 * Returns null points and no route when ride is null.
 */
export function useRideRoute(displayRide: Ride | null) {
  const origin: RidePoint | null = useMemo(
    () =>
      displayRide
        ? {
            address: displayRide.originAddress,
            latitude: displayRide.originLatitude,
            longitude: displayRide.originLongitude,
          }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      displayRide?.originAddress,
      displayRide?.originLatitude,
      displayRide?.originLongitude,
    ],
  );

  const destination: RidePoint | null = useMemo(
    () =>
      displayRide
        ? {
            address: displayRide.destinationAddress,
            latitude: displayRide.destinationLatitude,
            longitude: displayRide.destinationLongitude,
          }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      displayRide?.destinationAddress,
      displayRide?.destinationLatitude,
      displayRide?.destinationLongitude,
    ],
  );

  const { route } = useDirections(origin, destination);

  return { origin, destination, route };
}

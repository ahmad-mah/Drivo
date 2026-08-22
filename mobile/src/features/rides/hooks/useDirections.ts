import { useEffect, useState } from "react";
import * as directionsApi from "@/api/directions/directions.api";
import type { RidePoint, RouteCoordinate } from "../types/ride.types";

/**
 * Fetches the best driving route once both map ends exist and clears it when
 * either is unset or re-picked. Failures stay silent — the map simply shows no
 * line rather than blocking the ride request.
 */
export function useDirections(
  origin: RidePoint | null,
  destination: RidePoint | null,
) {
  const [route, setRoute] = useState<RouteCoordinate[]>([]);

  useEffect(() => {
    if (!origin || !destination) {
      // Defer so the route never renders stale while the effect settles.
      void Promise.resolve().then(() => setRoute([]));
      return;
    }

    let cancelled = false;

    void directionsApi
      .fetchDirections(origin, destination)
      .then((result) => {
        if (!cancelled) setRoute(result);
      })
      .catch(() => {
        if (!cancelled) setRoute([]);
      });

    return () => {
      cancelled = true;
    };
  }, [origin, destination]);

  return { route };
}
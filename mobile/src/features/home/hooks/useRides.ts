import { useCallback, useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import * as ridesApi from "@/api/rides/rides.api";
import { rateRide } from "@/api/rides/rides.api";
import { getErrorMessage } from "@/errors";
import type { Ride } from "@/features/rides/types/ride.types";

export const RIDE_COMPLETED_EVENT = "ride:completed";

/** Home preview only — the History tab loads the full paginated list. */
export function useRides(limit = 3) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRides = useCallback(async () => {
    try {
      const result = await ridesApi.getRecentRides(limit);
      setRides(result);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load recent rides"));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await ridesApi.getRecentRides(limit);
        if (cancelled) return;
        setRides(result);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, "Failed to load recent rides"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  // Refetch when a ride is completed anywhere in the app.
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(RIDE_COMPLETED_EVENT, () => {
      void fetchRides();
    });
    return () => sub.remove();
  }, [fetchRides]);

  /** Submits a rating and reflects it on the list item without a refetch. */
  const submitRating = async (rideId: string, stars: number, comment?: string) => {
    try {
      await rateRide(rideId, { stars, comment });
      setRides((prev) =>
        prev.map((ride) =>
          ride.id === rideId ? { ...ride, riderRating: stars } : ride,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err, "Could not submit your rating"));
    }
  };

  return { rides, loading, error, submitRating };
}

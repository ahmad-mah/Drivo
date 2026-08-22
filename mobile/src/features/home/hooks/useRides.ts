import { useEffect, useState } from "react";
import * as ridesApi from "@/api/rides/rides.api";
import { getErrorMessage } from "@/errors";
import type { Ride } from "@/features/rides/types/ride.types";

export function useRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRides = async () => {
      try {
        const result = await ridesApi.getRecentRides();
        if (cancelled) return;
        setRides(result);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, "Failed to load recent rides"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchRides();

    return () => {
      cancelled = true;
    };
  }, []);

  return { rides, loading, error };
}
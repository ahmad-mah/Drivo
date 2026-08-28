import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { fetchRouteDuration } from "@/api/directions/directions.api";
import type { RidePoint } from "../types/ride.types";

const POLL_INTERVAL_MS = 20_000;

export interface LiveEtaResult {
  etaMinutes: number | null;
  loading: boolean;
}

/**
 * Real-time ETA from the rider's current GPS position to a destination.
 * Polls the Directions ETA endpoint every 20 seconds so the "Arriving in"
 * countdown stays accurate as the car moves.
 */
export function useLiveEta(
  destination: RidePoint | null,
  enabled: boolean,
): LiveEtaResult {
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const etaRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !destination) return;

    let cancelled = false;

    const fetchEta = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!cancelled) setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;

        const from: RidePoint = {
          address: "",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        const minutes = await fetchRouteDuration(from, destination);
        if (!cancelled) {
          etaRef.current = minutes;
          setEtaMinutes(minutes);
          setLoading(false);
        }
      } catch {
        // Retry on interval — only mark as loaded if we already have an ETA.
        if (!cancelled && etaRef.current !== null) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    void fetchEta();

    intervalRef.current = setInterval(() => {
      void fetchEta();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      etaRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [destination, enabled]);

  if (!enabled || !destination) {
    return { etaMinutes: null, loading: false };
  }

  return { etaMinutes, loading };
}

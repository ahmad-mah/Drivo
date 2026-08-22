import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as ridesApi from "@/api/rides/rides.api";
import { RideStatus } from "@/features/rides/enums/RideStatus";
import { ApiError, getErrorMessage } from "@/errors";
import type { Ride } from "../types/ride.types";

const POLL_INTERVAL_MS = 5_000;

/**
 * Polls the rider's active ride every 5s for the full-screen searching view.
 * Stops polling once the ride leaves PENDING: a 404 means it expired or was
 * cancelled (no active ride), and a terminal status means the same for Day 6
 * where acceptance lands in a later milestone.
 */
export function useActiveRide() {
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stoppedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    stoppedRef.current = false;

    const fetchActive = async () => {
      if (cancelled || stoppedRef.current) return;
      try {
        const result = await ridesApi.getActiveRide();
        if (cancelled) return;
        setRide(result);
        setError(null);
        if (result.status !== RideStatus.PENDING) {
          stoppedRef.current = true;
          stopPolling();
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 404) {
          setRide(null);
          stoppedRef.current = true;
          stopPolling();
        } else {
          setError(getErrorMessage(err, "Failed to check ride status"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Poll only while the app is foregrounded — Android timers keep running
    // (and hitting the API) in the background otherwise.
    let active = AppState.currentState === "active";
    const onAppStateChange = (next: AppStateStatus) => {
      active = next === "active";
      if (active) void fetchActive();
    };
    const sub = AppState.addEventListener("change", onAppStateChange);

    void fetchActive();
    timerRef.current = setInterval(() => {
      if (active) void fetchActive();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      stopPolling();
      sub.remove();
    };
  }, [stopPolling]);

  const cancel = useCallback(
    async (rideId: string) => {
      try {
        const cancelledRide = await ridesApi.cancelRide(rideId);
        stoppedRef.current = true;
        stopPolling();
        setRide(cancelledRide);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to cancel the ride"));
      }
    },
    [stopPolling],
  );

  return { ride, loading, error, cancel };
}
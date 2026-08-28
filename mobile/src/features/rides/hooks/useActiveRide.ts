import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as ridesApi from "@/api/rides/rides.api";
import { TERMINAL_RIDE_STATUSES } from "@/features/rides/enums/RideStatus";
import { toLiveRide } from "@/features/rides/utils/ridePhase";
import { ApiError, getErrorMessage } from "@/errors";
import type { Ride } from "../types/ride.types";

const POLL_INTERVAL_MS = 5_000;

/**
 * Polls the rider's active ride every 5s for the full-screen status view.
 * Polling continues through the whole trip lifecycle (PENDING → ACCEPTED →
 * ARRIVED → IN_PROGRESS) and stops only on terminal states: a 404 means the
 * ride expired or was cancelled, and COMPLETED/CANCELLED/EXPIRED end the flow.
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

  const clearRide = useCallback(() => {
    setRide(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    stoppedRef.current = false;

    const fetchActive = async () => {
      if (cancelled || stoppedRef.current) return;
      try {
        const result = await ridesApi.getActiveRide();
        if (cancelled) return;
        const live = toLiveRide(result);
        setRide(live);
        setError(null);
        if (!live) {
          stoppedRef.current = true;
          stopPolling();
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 404) {
          setRide(null);
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
        await ridesApi.cancelRide(rideId);
        // Clear locally but keep polling — the rider may request again soon.
        setRide(null);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to cancel the ride"));
      }
    },
    [],
  );

  const restartPolling = useCallback(() => {
    stoppedRef.current = false;
  }, []);

  return { ride, loading, error, cancel, clearRide, restartPolling };
}

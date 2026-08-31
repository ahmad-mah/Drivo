import { useCallback, useEffect, useRef, useState } from "react";
import {
  arriveAtPickup,
  arrivedAtDestination,
  cancelTripAsDriver,
  completeTrip,
  fetchDriverActiveTrip,
  markRiderNoShow,
  startTrip,
} from "@/api/rides/driver-trips.api";
import type { Ride } from "@/features/rides/types/ride.types";
import { RideStatus } from "@/features/rides/enums/RideStatus";
import { getErrorMessage } from "@/errors";
import { setRideUpdateListener } from "../services/driver-socket";

/**
 * Owns the driver's active trip: restores it after restarts/reconnects,
 * follows `ride:updated` broadcasts (rider cancel, server-side changes), and
 * performs the lifecycle actions. The trip panel renders from this state —
 * when it is null the driver is free and the availability footer shows.
 */
export function useDriverTrip() {
  const [trip, setTrip] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Single-flight guard: rapid ride:updated bursts collapse into one fetch
  // instead of stacking parallel requests (same pattern as ConnectivityProvider).
  const refreshingRef = useRef(false);
  // ID of a completed trip the driver already dismissed: refresh events that
  // re-fetch it must not re-surface the summary dialog.
  const dismissedCompletedIdRef = useRef<string | null>(null);
  // Ref so refresh() can check the latest trip status without capturing a
  // stale closure (avoids the race where ride:updated fires before the
  // listener re-subscribes with the new refresh).
  const tripRef = useRef<Ride | null>(null);
  tripRef.current = trip;

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const fetched = await fetchDriverActiveTrip();
      // A dismissed completed trip is treated as gone, even if the server
      // still lists it briefly as active.
      if (
        fetched &&
        fetched.status === RideStatus.COMPLETED &&
        dismissedCompletedIdRef.current === fetched.id
      ) {
        setTrip(null);
      } else if (!fetched && tripRef.current?.status === RideStatus.COMPLETED) {
        // The backend returns null for completed trips, but we must keep the
        // trip alive so the driver can see and dismiss the summary dialog.
      } else {
        setTrip(fetched);
      }
    } catch {
      // Network hiccup: keep showing whatever we had; the next event or
      // reconnect listener retries.
    } finally {
      refreshingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Deferred initial fetch so the state write lands outside the effect
    // body (same pattern as ConnectivityProvider's first probe).
    const first = setTimeout(() => void refresh(), 0);
    // Server broadcasts every transition (and rider cancellations) to the
    // driver's room — refetching reconciles without trusting local guesses.
    const unsubscribe = setRideUpdateListener(() => void refresh());
    return () => {
      clearTimeout(first);
      unsubscribe();
    };
  }, [refresh]);

  /** Runs a transition action, adopting the returned ride on success. */
  const act = useCallback(
    async (
      action: (rideId: string) => Promise<Ride>,
      fallbackError: string,
    ) => {
      if (!trip || acting) return;
      setActing(true);
      setError(null);
      try {
        setTrip(await action(trip.id));
      } catch (err) {
        // A conflict means the state moved elsewhere (rider cancelled,
        // already completed) — reconcile instead of dead-ending.
        setError(getErrorMessage(err, fallbackError));
        void refresh();
      } finally {
        setActing(false);
      }
    },
    [trip, acting, refresh],
  );

  return {
    trip,
    loading,
    acting,
    error,
    refresh,
    arrive: useCallback(
      () => act(arriveAtPickup, "Could not mark arrival"),
      [act],
    ),
    start: useCallback(() => act(startTrip, "Could not start the trip"), [act]),
    arrivedAtDestination: useCallback(
      () => act(arrivedAtDestination, "Could not mark arrival at destination"),
      [act],
    ),
    complete: useCallback(
      () => act(completeTrip, "Could not complete the trip"),
      [act],
    ),
    // Dismissal after the driver acknowledges the completed-trip summary:
    // clears the trip and remembers its id so a late refresh can't re-show it.
    dismiss: useCallback(() => {
      dismissedCompletedIdRef.current = trip?.id ?? null;
      setTrip(null);
    }, [trip]),
    // Cancel ends the flow — clear the trip instead of adopting the returned
    // cancelled ride, so the availability footer comes straight back.
    cancel: useCallback(async () => {
        if (!trip || acting) return;
        setActing(true);
        setError(null);
        try {
          await cancelTripAsDriver(trip.id);
          setTrip(null);
        } catch (err) {
          setError(getErrorMessage(err, "Could not cancel the ride"));
          void refresh();
        } finally {
          setActing(false);
        }
      },
      [trip, acting, refresh],
    ),
    // No-show ends the flow — clear the trip so the footer comes back.
    noShow: useCallback(async () => {
      if (!trip || acting) return;
      setActing(true);
      setError(null);
      try {
        await markRiderNoShow(trip.id);
        setTrip(null);
      } catch (err) {
        setError(getErrorMessage(err, "Could not mark the rider as a no-show"));
        void refresh();
      } finally {
        setActing(false);
      }
    }, [trip, acting, refresh]),
  };
}

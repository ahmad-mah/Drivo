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
import { RideStatus, ACTIVE_RIDE_STATUSES } from "@/features/rides/enums/RideStatus";
import { getErrorMessage } from "@/errors";
import { playNotification } from "@/shared/utils/sounds";
import { useSnackbar } from "@/shared/contexts/SnackbarContext";
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

  const { show } = useSnackbar();

  // Single-flight guard: if a refresh is already running, mark a pending
  // request instead of dropping it — the second event still needs to run
  // once the first fetch completes, otherwise a cancellation arriving during
  // a concurrent fetch would be silently lost.
  const refreshingRef = useRef(false);
  const refreshPendingRef = useRef(false);

  // ID of a completed trip the driver already dismissed: refresh events that
  // re-fetch it must not re-surface the summary dialog.
  const dismissedCompletedIdRef = useRef<string | null>(null);

  // Deduplication: track the last ride ID for which we showed the cancel
  // snackbar so duplicate ride:updated bursts don't stack notifications.
  const notifiedCancellationIdRef = useRef<string | null>(null);

  // Ref so refresh() can check the latest trip without capturing a stale
  // closure (avoids races where ride:updated fires before the listener
  // re-subscribes with the updated refresh callback).
  const tripRef = useRef<Ride | null>(null);
  useEffect(() => {
    tripRef.current = trip;
  });

  // Play a notification when the trip reaches TRIP_ENDED (payment ready).
  useEffect(() => {
    if (trip?.status === RideStatus.TRIP_ENDED) playNotification();
  }, [trip?.status]);

  const refresh = useCallback(async () => {
    // If a fetch is already in flight, mark it as pending rather than
    // discarding it — this guarantees the most recent event always results
    // in a fetch completing, even during concurrent socket bursts.
    if (refreshingRef.current) {
      refreshPendingRef.current = true;
      return;
    }
    refreshingRef.current = true;
    try {
      const fetched = await fetchDriverActiveTrip();

      // A dismissed completed trip is treated as gone, even if the server
      // still returns it briefly.
      if (
        fetched &&
        fetched.status === RideStatus.COMPLETED &&
        dismissedCompletedIdRef.current === fetched.id
      ) {
        setTrip(null);
        return;
      }

      // The backend excludes COMPLETED from the active endpoint (returns null),
      // but we must keep the local trip state alive so the driver can see and
      // dismiss the summary dialog before the screen resets.
      if (!fetched && tripRef.current?.status === RideStatus.COMPLETED) {
        return;
      }

      // null returned while we had an active (non-completed) trip means the
      // rider cancelled (or the ride reached a terminal state). We use the
      // explicit ACTIVE_RIDE_STATUSES guard — the same set the backend's
      // active endpoint serves — so future statuses (EXPIRED, SUSPENDED, etc.)
      // never accidentally become "Rider cancelled the trip".
      const prevStatus = tripRef.current?.status;
      if (
        !fetched &&
        tripRef.current !== null &&
        prevStatus !== undefined &&
        ACTIVE_RIDE_STATUSES.includes(prevStatus)
      ) {
        const cancelledId = tripRef.current.id;
        setTrip(null);
        // Show the snackbar exactly once per cancelled ride ID.
        // Duplicate ride:updated events for the same cancellation must not
        // stack multiple notifications.
        if (notifiedCancellationIdRef.current !== cancelledId) {
          notifiedCancellationIdRef.current = cancelledId;
          show("Rider cancelled the trip");
        }
        return;
      }

      // Normal active-trip update (ACCEPTED / ARRIVED / IN_PROGRESS / TRIP_ENDED).
      if (fetched) {
        // A different ride ID means a new trip started: clear stale
        // deduplication state so future cancellations fire correctly.
        if (fetched.id !== tripRef.current?.id) {
          notifiedCancellationIdRef.current = null;
        }
        setTrip(fetched);
      }
    } catch {
      // Network hiccup: keep showing whatever we had; the next event or
      // reconnect listener retries.
    } finally {
      refreshingRef.current = false;
      setLoading(false);
      // Drain any event that arrived while this fetch was in flight.
      if (refreshPendingRef.current) {
        refreshPendingRef.current = false;
        void refresh();
      }
    }
  }, [show]);

  useEffect(() => {
    // Deferred initial fetch so the state write lands outside the effect body.
    const first = setTimeout(() => void refresh(), 0);

    // ride:updated is a pure invalidation signal — it means "something about
    // this ride changed; go read the authoritative state". We do NOT infer
    // *what* changed from the socket event itself (doing so caused spurious
    // "Rider cancelled" snackbars on the driver's own arrive/start actions).
    // We also only respond to events for the ride we're currently showing:
    // new assignments arrive through a separate incoming-ride flow.
    const unsubscribe = setRideUpdateListener((rideId) => {
      const current = tripRef.current;
      // If we already have an active trip and this event is for a different ride, ignore it.
      // If we don't have an active trip (current is null), we MUST refresh, because the backend
      // relies on ride:updated to nudge the driver to load their newly accepted trip.
      if (current && current.id !== rideId) return;
      void refresh();
    });

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

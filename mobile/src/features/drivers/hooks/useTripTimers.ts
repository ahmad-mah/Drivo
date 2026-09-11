import { useEffect, useMemo, useState } from "react";
import type { Ride } from "@/features/rides/types/ride.types";
import { RideStatus } from "@/features/rides/enums/RideStatus";

interface ElapsedAnchor {
  base: number;
  wallMs: number;
}

/**
 * Owns the two countdown timers displayed by TripPanel:
 * - **No-show countdown**: anchored from the server `arrivedAt` timestamp +
 *   `noShowInSeconds` so driver and rider stay in sync. The remaining seconds
 *   are *derived* each render from a `now` tick — never stored via `setState`
 *   in an effect body — so the timer ticks without cascading re-renders.
 * - **Elapsed trip counter**: counts UP from `trip.tripElapsedSeconds` while
 *   the trip is `IN_PROGRESS`, derived from the same `now` tick.
 */
export function useTripTimers(trip: Ride) {
  const arrived = trip.status === RideStatus.ARRIVED;
  const inProgress = trip.status === RideStatus.IN_PROGRESS;

  // ── Shared clock ─────────────────────────────────────────────────────
  const [now, setNow] = useState(() => Date.now());
  const active = arrived || inProgress;

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  // ── No-show countdown ────────────────────────────────────────────────
  const noShowDeadline = useMemo(() => {
    if (!arrived || trip.arrivedAt == null || trip.noShowInSeconds == null)
      return null;
    return new Date(trip.arrivedAt).getTime() + trip.noShowInSeconds * 1000;
  }, [arrived, trip.arrivedAt, trip.noShowInSeconds]);

  const noShowLeft =
    noShowDeadline != null ? Math.max(0, (noShowDeadline - now) / 1000) : null;
  const noShowReady = arrived && noShowLeft != null && noShowLeft <= 0;

  // ── Elapsed trip counter ─────────────────────────────────────────────
  // React-recommended "adjust state during render" pattern:
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [elapsedAnchor, setElapsedAnchor] = useState<ElapsedAnchor | null>(
    null,
  );
  if (inProgress && elapsedAnchor == null) {
    setElapsedAnchor({ base: trip.tripElapsedSeconds ?? 0, wallMs: now });
  }
  if (!inProgress && elapsedAnchor != null) {
    setElapsedAnchor(null);
  }

  const elapsedSeconds =
    inProgress && elapsedAnchor != null
      ? elapsedAnchor.base +
        Math.max(0, Math.floor((now - elapsedAnchor.wallMs) / 1000))
      : 0;

  return { elapsedSeconds, noShowLeft, noShowReady };
}

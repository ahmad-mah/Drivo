import { useCallback, useMemo, useReducer, useState } from "react";
import * as ridesApi from "@/api/rides/rides.api";
import { RideStatus, TRIP_RIDE_STATUSES } from "../enums/RideStatus";
import { RidePhase, deriveRidePhase, getEndedMessage } from "../utils/ridePhase";
import { useActiveRide } from "./useActiveRide";
import { useRideSocket, type RideExpiredReason } from "./useRideSocket";
import type { Ride } from "../types/ride.types";

interface LifecycleState {
  wasInTrip: boolean;
  forceEnded: boolean;
  riderCancelled: boolean;
  forceEndedReason: RideExpiredReason;
  forceEndedLastRide: Ride | null;
}

type LifecycleAction =
  | { type: "MATCH_FOUND" }
  | { type: "REDISPATCH" }
  | { type: "EXPIRED"; reason: RideExpiredReason; lastRide?: Ride | null }
  | { type: "RIDER_CANCEL" }
  | { type: "NEW_RIDE" };

function lifecycleReducer(state: LifecycleState, action: LifecycleAction): LifecycleState {
  switch (action.type) {
    case "MATCH_FOUND":
      return { ...state, wasInTrip: true };
    case "REDISPATCH":
      return { ...state, forceEnded: true, forceEndedReason: "cancelled" };
    case "EXPIRED":
      return { ...state, forceEnded: true, forceEndedReason: action.reason, forceEndedLastRide: action.lastRide ?? null };
    case "RIDER_CANCEL":
      return { ...state, riderCancelled: true, forceEnded: true, forceEndedReason: "cancelled" };
    case "NEW_RIDE":
      return { ...state, wasInTrip: false, forceEnded: false, riderCancelled: false };
  }
}

export function useRideLifecycle() {
  const { ride: activeRide, loading: activeRideLoading, cancel } = useActiveRide();
  const [cancelling, setCancelling] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratedLocally, setRatedLocally] = useState(false);
  const [navigatingAway, setNavigatingAway] = useState(false);
  const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);

  const [lifecycle, dispatch] = useReducer(lifecycleReducer, {
    wasInTrip: false,
    forceEnded: false,
    riderCancelled: false,
    forceEndedReason: "expired" as RideExpiredReason,
    forceEndedLastRide: null,
  });

  const handleExpired = useCallback(
    (reason: RideExpiredReason, lastRide?: Ride | null) => {
      dispatch({ type: "EXPIRED", reason, lastRide });
    },
    [],
  );

  const { socketRide, connected: socketConnected } = useRideSocket(handleExpired);

  const displayRide: Ride | null = (navigatingAway ? null : socketRide) ?? activeRide;

  const expired = lifecycle.forceEnded && lifecycle.forceEndedReason === "expired";

  const [prevSocketRide, setPrevSocketRide] = useState<Ride | null>(null);
  if (socketRide !== prevSocketRide) {
    setPrevSocketRide(socketRide);
    if (!prevSocketRide && socketRide) {
      dispatch({ type: "NEW_RIDE" });
      if (TRIP_RIDE_STATUSES.includes(socketRide.status)) {
        dispatch({ type: "MATCH_FOUND" });
      }
    } else if (prevSocketRide && socketRide && prevSocketRide.status !== socketRide.status) {
      if (socketRide.status === RideStatus.PENDING && lifecycle.wasInTrip) {
        dispatch({ type: "REDISPATCH" });
      } else if (TRIP_RIDE_STATUSES.includes(socketRide.status)) {
        dispatch({ type: "MATCH_FOUND" });
      }
    }
  }

  const { ridePhase, endedMessage } = useMemo(() => {
    let phase: RidePhase;
    if (lifecycle.forceEnded) {
      phase = RidePhase.ENDED;
    } else if (navigatingAway && !displayRide) {
      phase = lifecycle.wasInTrip ? RidePhase.ENDED : RidePhase.IDLE;
    } else {
      phase = deriveRidePhase(displayRide, lifecycle.wasInTrip);
    }

    let message: string | null = null;
    if (phase === RidePhase.ENDED && !lifecycle.riderCancelled) {
      const isRedispatch = displayRide?.status === RideStatus.PENDING && lifecycle.wasInTrip;
      if (isRedispatch) {
        message = "Driver cancelled \u2014 looking for another driver";
      } else if (lifecycle.forceEnded) {
        message = lifecycle.forceEndedReason === "cancelled"
          ? (getEndedMessage(lifecycle.forceEndedLastRide) ?? "Ride was cancelled")
          : "No drivers available right now";
      } else {
        message = getEndedMessage(displayRide);
      }
    }
    return { ridePhase: phase, endedMessage: message };
  }, [displayRide, navigatingAway, lifecycle]);

  const resetForNewRide = useCallback(() => {
    dispatch({ type: "NEW_RIDE" });
    setNavigatingAway(false);
  }, []);

  const cancelRide = useCallback(async () => {
    let rideToCancel = displayRide ?? activeRide;
    // After a previous cancel, activeRide polling is stopped so the second
    // ride may only exist on the socket (not yet delivered) or only on the
    // server. Fetch it as a fallback so the cancel always goes through.
    if (!rideToCancel) {
      try {
        rideToCancel = await ridesApi.getActiveRide();
      } catch {
        return;
      }
    }
    if (!rideToCancel) return;
    dispatch({ type: "RIDER_CANCEL" });
    setNavigatingAway(true);
    setCancelling(true);
    try {
      await cancel(rideToCancel.id);
    } finally {
      setCancelling(false);
    }
  }, [displayRide, activeRide, cancel]);

  const showCancelConfirm = useCallback(() => {
    setCancelConfirmVisible(true);
  }, []);

  const hideCancelConfirm = useCallback(() => {
    setCancelConfirmVisible(false);
  }, []);

  const confirmCancel = useCallback(async () => {
    hideCancelConfirm();
    await cancelRide();
  }, [hideCancelConfirm, cancelRide]);

  const handleRate = useCallback(async (stars: number, comment?: string) => {
    if (!displayRide) return;
    setRatingSubmitting(true);
    try {
      await ridesApi.rateRide(displayRide.id, { stars, comment });
      setRatedLocally(true);
    } catch {
      setRatedLocally(true);
    }
  }, [displayRide]);

  return {
    ridePhase,
    displayRide,
    activeRideLoading,
    cancelling,
    cancelRide,
    handleRate,
    ratingSubmitting,
    ratedLocally,
    endedMessage,
    socketConnected,
    expired,
    cancelConfirmVisible,
    showCancelConfirm,
    hideCancelConfirm,
    confirmCancel,
    resetForNewRide,
  };
}

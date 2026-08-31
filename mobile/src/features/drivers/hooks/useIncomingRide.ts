import { useCallback, useEffect, useRef, useState } from "react";
import {
  acceptRideRequest,
  rejectRideRequest,
} from "@/api/rides/driver-trips.api";
import type { IncomingRideRequest } from "@/api/drivers/drivers.api";
import { getErrorMessage } from "@/errors";
import { playNotification } from "@/shared/utils/sounds";
import {
  setIncomingRideListener,
  setRideUpdateListener,
} from "../services/driver-socket";

const COUNTDOWN_TICK_MS = 500;

/**
 * Owns the incoming-ride lifecycle for the driver-mode screen: receives
 * dispatched requests from the socket, runs the visible response countdown,
 * and performs accept/reject against the API.
 *
 * The server expires the underlying offer at `respondBy`; when the local
 * countdown reaches zero the card dismisses itself so the UI never shows a
 * stale request that would just 409.
 */
export function useIncomingRide(isOnline: boolean) {
  const [request, setRequest] = useState<IncomingRideRequest | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Local deadline built from the server's relative window at receipt —
  // an absolute epoch from the backend would drift with device clock skew.
  const [deadline, setDeadline] = useState(0);

  useEffect(() => {
    setIncomingRideListener((incoming) => {
      // A newer dispatch replaces whatever was on screen — the older offer
      // will time out server-side regardless.
      setError(null);
      setRequest(incoming);
      setDeadline(Date.now() + incoming.respondWithinSeconds * 1000);
      playNotification();
    });
    return () => setIncomingRideListener(null);
  }, []);

  // A rider cancel (or any lifecycle change on this ride) invalidates the
  // offer — dismiss the card instantly instead of letting a dead Accept sit.
  // The listener is registered once (`[]` deps) and reads rideId from a ref
  // so there is never a gap between unsubscribe and re-subscribe that could
  // drop the second cancel event.
  const rideIdRef = useRef<string | null>(null);
  useEffect(() => {
    rideIdRef.current = request?.rideId ?? null;
  });

  useEffect(() => {
    const unsubscribe = setRideUpdateListener((rideId) => {
      setRequest((current) =>
        current?.rideId === rideId ? null : current,
      );
      if (rideIdRef.current === rideId) {
        setDeadline(0);
      }
    });
    return unsubscribe;
  }, []);

  // Going offline invalidates any pending offer (the backend sweeps offline
  // drivers out of dispatch), so drop the card when connectivity toggles.
  const [prevIsOnline, setPrevIsOnline] = useState(isOnline);
  if (isOnline !== prevIsOnline) {
    setPrevIsOnline(isOnline);
    if (!isOnline) {
      setRequest(null);
      setDeadline(0);
      setSecondsLeft(0);
    }
  }

  useEffect(() => {
    if (!request || deadline === 0) return;

    const tick = () => {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) {
        setRequest(null);
        setDeadline(0);
        setSecondsLeft(0);
        return;
      }
      setSecondsLeft(Math.ceil(remainingMs / 1000));
    };

    tick();
    const id = setInterval(tick, COUNTDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [request, deadline]);

  const respond = useCallback(
    async (action: "accept" | "reject") => {
      if (!request || responding) return;
      setResponding(true);
      setError(null);
      try {
        if (action === "accept") await acceptRideRequest(request.rideId);
        else await rejectRideRequest(request.rideId);
        setRequest(null);
      } catch (err) {
        // A conflict means the offer/ride resolved elsewhere (timeout, rider
        // cancel, another driver accepted) — dismiss instead of dead-ending.
        setError(getErrorMessage(err, "Could not respond to the ride request"));
        setRequest(null);
      } finally {
        setResponding(false);
      }
    },
    [request, responding],
  );

  return {
    request,
    secondsLeft,
    responding,
    error,
    accept: useCallback(() => respond("accept"), [respond]),
    reject: useCallback(() => respond("reject"), [respond]),
  };
}

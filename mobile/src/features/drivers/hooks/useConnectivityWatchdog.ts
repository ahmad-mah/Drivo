import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { updateAvailability } from "@/api/drivers/drivers.api";
import type { ConnectivityStatus } from "@/providers/ConnectivityProvider";
import {
  emitGoOnline,
  isDriverSocketConnected,
} from "../services/driver-socket";
import {
  startDriverLocationTask,
  stopDriverLocationTracking,
} from "../services/driver-location-task";

// An online driver whose connectivity drops stays online for this grace window
// before auto-flipping offline — long enough to survive a blip, short enough
// to beat the backend's 15s stale sweep.
const AUTO_OFFLINE_GRACE_MS = 10_000;
const BACK_ONLINE_BANNER_MS = 3_000;

interface UseConnectivityWatchdogOptions {
  isOnline: boolean;
  connectivityStatus: ConnectivityStatus;
  connectivityBlocked: boolean;
  setOnline: (value: boolean) => void;
  setBusy: (value: boolean) => void;
  pendingAckRef: MutableRefObject<boolean>;
}

/**
 * The availability safety net for online drivers. When connectivity drops
 * past the grace window the driver flips offline locally (the server's stale
 * sweep confirms it on the admin map); when connectivity returns the online
 * state is re-asserted automatically — socket-first with a REST fallback —
 * and a transient "back online" banner flashes.
 */
export function useConnectivityWatchdog({
  isOnline,
  connectivityStatus,
  connectivityBlocked,
  setOnline,
  setBusy,
  pendingAckRef,
}: UseConnectivityWatchdogOptions) {
  // The driver was online but connectivity dropped (no-internet or server-down)
  // past the grace window — a local offline flip while the server still sweeps.
  const [autoOffline, setAutoOffline] = useState(false);
  // Transient "back online" banner shown right after auto-recovery kicks in.
  const [backOnline, setBackOnline] = useState(false);
  // Latest grace-window deadline for effects that re-run mid-wait.
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-offline: an online driver whose connectivity drops flips to offline
  // after the grace window. Connectivity returning within the window cancels
  // the timer and keeps the driver online.
  useEffect(() => {
    if (!isOnline || !connectivityBlocked) return;

    graceTimerRef.current = setTimeout(() => {
      // Clear a stuck toggle (ack may never arrive while offline) and any
      // lingering "back online" banner from a previous recovery.
      pendingAckRef.current = false;
      setBusy(false);
      setBackOnline(false);
      setAutoOffline(true);
      setOnline(false);
      void stopDriverLocationTracking();
    }, AUTO_OFFLINE_GRACE_MS);
    return () => {
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    };
  }, [isOnline, connectivityBlocked, setOnline, setBusy, pendingAckRef]);

  // Recovery: connectivity restored while auto-offline re-asserts online and
  // flashes a "back online" banner. Prefers the socket (server ack confirms via
  // driver:status); falls back to REST if the socket hasn't reconnected yet.
  // State writes are deferred into timers so the effect body stays clean.
  useEffect(() => {
    if (!autoOffline || connectivityStatus !== "online") return;

    const recoveryTimer = setTimeout(() => {
      setAutoOffline(false);
      setBackOnline(true);
      setTimeout(() => setBackOnline(false), BACK_ONLINE_BANNER_MS);

      if (isDriverSocketConnected()) {
        pendingAckRef.current = true;
        setBusy(true);
        emitGoOnline();
      } else {
        void (async () => {
          try {
            const result = await updateAvailability(true);
            if (result.isOnline) {
              setOnline(true);
              void startDriverLocationTask();
            }
          } catch {
            // Socket reconnect listener re-asserts once the connection is back.
          }
          setBusy(false);
        })();
      }
    }, 0);

    return () => clearTimeout(recoveryTimer);
  }, [autoOffline, connectivityStatus, setOnline, setBusy, pendingAckRef]);

  return { autoOffline, backOnline };
}

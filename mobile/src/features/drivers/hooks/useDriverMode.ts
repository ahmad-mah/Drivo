import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/errors";
import { useConnectivity } from "@/hooks/useConnectivity";
import {
  connectDriverSocket,
  disposeDriverSocket,
  emitGoOffline,
  emitGoOnline,
  isDriverSocketConnected,
  setConnectionListener,
} from "../services/driver-socket";
import {
  startDriverLocationTask,
  stopDriverLocationTracking,
} from "../services/driver-location-task";
import { useAvailabilityToggle } from "./useAvailabilityToggle";
import { useConnectivityWatchdog } from "./useConnectivityWatchdog";
import { useDriverHeartbeat } from "./useDriverHeartbeat";

/**
 * Owns the driver-mode lifecycle and composes its three concerns:
 * - socket connection + online/offline state (here)
 * - liveness heartbeat (useDriverHeartbeat)
 * - connectivity auto-offline/recovery (useConnectivityWatchdog)
 * - the Go Online/Offline action (useAvailabilityToggle)
 *
 * The background location task is the single source of location delivery
 * (foreground via socket, background via REST), so enabling it is coupled to
 * being online.
 */
export function useDriverMode() {
  const { status: connectivityStatus } = useConnectivity();
  const [isOnline, setIsOnline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [gpsAvailable, setGpsAvailable] = useState(true);

  // Marks a toggle awaiting the server ack: the driver:status callback is what
  // clears `busy`, so the button stays loading/disabled until the state change
  // is confirmed instead of flashing on and off around the emit.
  const pendingAckRef = useRef(false);
  // Local online state for closures (the socket status callback) that capture
  // the value at mount time instead of the latest render.
  const isOnlineRef = useRef(false);
  const setOnline = useCallback((value: boolean) => {
    isOnlineRef.current = value;
    setIsOnline(value);
  }, []);

  useEffect(() => {
    connectDriverSocket(
      (status) => {
        setOnline(status.isOnline);
        if (status.error) setError(status.error);
        if (status.isOnline) void startDriverLocationTask();
        else void stopDriverLocationTracking();
        if (pendingAckRef.current) {
          pendingAckRef.current = false;
          setBusy(false);
        }
      },
      // Socket (re)connected: a connectivity drop lets the server sweep an
      // online driver offline; re-assert availability so the app and the
      // map agree again without a manual re-toggle.
      () => {
        if (isOnlineRef.current) emitGoOnline();
      },
    );
    setConnectionListener(setSocketConnected);

    return () => {
      // Leaving the screen while online: stop streaming and drop offline so we
      // never leak a background task or a ghost marker on the admin map.
      if (isDriverSocketConnected()) emitGoOffline();
      void stopDriverLocationTracking();
      disposeDriverSocket();
    };
  }, [setOnline]);

  useDriverHeartbeat(isOnline, setGpsAvailable);

  const connectivityBlocked =
    connectivityStatus === "no-internet" || connectivityStatus === "server-down";

  const { autoOffline, backOnline } = useConnectivityWatchdog({
    isOnline,
    connectivityStatus,
    connectivityBlocked,
    setOnline,
    setBusy,
    pendingAckRef,
  });

  const toggle = useAvailabilityToggle({
    isOnline,
    busy,
    connectivityBlocked,
    connectivityStatus,
    setOnline,
    setBusy,
    setError,
    onGpsCheck: setGpsAvailable,
    pendingAckRef,
  });

  return {
    isOnline,
    busy,
    error,
    socketConnected,
    gpsAvailable,
    permissionDenied: toggle.permissionDenied,
    autoOffline,
    backOnline,
    closePermissionDialog: toggle.closePermissionDialog,
    toggleOnline: toggle.toggleOnline,
  };
}

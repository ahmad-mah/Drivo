import { useCallback, useEffect, useRef, useState } from "react";
import { updateAvailability } from "@/api/drivers/drivers.api";
import { getErrorMessage } from "@/errors";
import { useConnectivity } from "@/hooks/useConnectivity";
import {
  connectDriverSocket,
  disposeDriverSocket,
  emitGoOffline,
  emitGoOnline,
  emitHeartbeat,
  isDriverSocketConnected,
  setConnectionListener,
} from "../services/driver-socket";
import {
  requestDriverLocationPermissions,
  isGpsEnabled,
} from "../services/location-permissions";
import {
  startDriverLocationTask,
  stopDriverLocationTracking,
} from "../services/driver-location-task";

const HEARTBEAT_MS = 10_000;
// An online driver whose connectivity drops stays online for this grace window
// before auto-flipping offline — long enough to survive a blip, short enough
// to beat the backend's 15s stale sweep.
const AUTO_OFFLINE_GRACE_MS = 10_000;
const BACK_ONLINE_BANNER_MS = 3_000;

/**
 * Owns the driver-mode lifecycle: socket connection, online/offline state, and
 * start/stop of the background location task. The task is the single source of
 * location delivery (foreground via socket, background via REST), so enabling
 * it is coupled to being online.
 */
export function useDriverMode() {
  const { status: connectivityStatus } = useConnectivity();
  const [isOnline, setIsOnline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [gpsAvailable, setGpsAvailable] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  // The driver was online but connectivity dropped (no-internet or server-down)
  // past the grace window — a local offline flip while the server still sweeps.
  const [autoOffline, setAutoOffline] = useState(false);
  // Transient "back online" banner shown right after auto-recovery kicks in.
  const [backOnline, setBackOnline] = useState(false);
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

  // Liveness ping decoupled from GPS motion: the location provider suppresses
  // callbacks when the device is stationary, which would otherwise trip the
  // server's stale sweep and drop an online, parked driver off the admin map.
  // Same tick also polls the GPS master switch — availability is only a health
  // signal (warn, never auto-drop), so an online driver stays online.
  useEffect(() => {
    if (!isOnline) return;
    const id = setInterval(async () => {
      if (isDriverSocketConnected()) {
        emitHeartbeat();
      } else {
        // REST fallback only useful while connectivity is back but the socket
        // hasn't reconnected yet — swallow its errors (it doubles as a resync
        // once the network is restored, so a failure just means keep waiting).
        try {
          await updateAvailability(true);
        } catch {
          // network still down
        }
      }
      setGpsAvailable(await isGpsEnabled());
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [isOnline]);

  const connectivityBlocked =
    connectivityStatus === "no-internet" || connectivityStatus === "server-down";

  // Auto-offline: an online driver whose connectivity drops (no-internet or
  // server-down) flips to offline after the grace window. Connectivity returning
  // within the window cancels the timer and keeps the driver online. The flip is
  // local only — the server's stale sweep is what clears the admin-map marker.
  useEffect(() => {
    if (!isOnline || !connectivityBlocked) return;
    const id = setTimeout(() => {
      // Clear a stuck toggle (ack may never arrive while offline) and any
      // lingering "back online" banner from a previous recovery.
      pendingAckRef.current = false;
      setBusy(false);
      setBackOnline(false);
      setAutoOffline(true);
      setOnline(false);
      void stopDriverLocationTracking();
    }, AUTO_OFFLINE_GRACE_MS);
    return () => clearTimeout(id);
  }, [isOnline, connectivityBlocked, setOnline]);

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
  }, [autoOffline, connectivityStatus, setOnline]);

  const toggleOnline = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    // Connectivity is blocked: any network call (socket emit or REST) would
    // hang until its timeout, so surface the reason immediately instead of
    // leaving the button spinning. Recovery is automatic once it returns.
    if (connectivityBlocked) {
      setError(
        connectivityStatus === "no-internet"
          ? "No internet connection"
          : "Can't reach Drivo right now",
      );
      setBusy(false);
      return;
    }

    try {
      if (!isOnline) {
        const permissions = await requestDriverLocationPermissions();
        if (!permissions.foreground) {
          if (!permissions.canAskAgain) {
            // The OS will not prompt again — point the user at system settings.
            setPermissionDenied(true);
          } else {
            setError("Location permission is required to drive");
          }
          setBusy(false);
          return;
        }

        setGpsAvailable(await isGpsEnabled());

        if (isDriverSocketConnected()) {
          pendingAckRef.current = true;
          emitGoOnline();
          return;
        }

        const result = await updateAvailability(true);
        if (!result.isOnline) {
          setError(result.error ?? "Could not go online");
          setBusy(false);
          return;
        }
        setOnline(true);
        await startDriverLocationTask();
        setBusy(false);
        return;
      }

      if (isDriverSocketConnected()) {
        pendingAckRef.current = true;
        emitGoOffline();
        return;
      }
      await updateAvailability(false);
      await stopDriverLocationTracking();
      setOnline(false);
      setBusy(false);
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not update availability"),
      );
      setBusy(false);
    }
  }, [busy, isOnline, connectivityBlocked, connectivityStatus, setOnline]);

  return {
    isOnline,
    busy,
    error,
    socketConnected,
    gpsAvailable,
    permissionDenied,
    autoOffline,
    backOnline,
    closePermissionDialog: () => setPermissionDenied(false),
    toggleOnline,
  };
}
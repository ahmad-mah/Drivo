import { useCallback, useState, type MutableRefObject } from "react";
import { updateAvailability } from "@/api/drivers/drivers.api";
import { getErrorMessage } from "@/errors";
import type { ConnectivityStatus } from "@/providers/ConnectivityProvider";
import {
  emitGoOffline,
  emitGoOnline,
  isDriverSocketConnected,
} from "../services/driver-socket";
import {
  requestDriverLocationPermissions,
  isGpsEnabled,
} from "../services/location-permissions";
import {
  startDriverLocationTask,
  stopDriverLocationTracking,
} from "../services/driver-location-task";

interface UseAvailabilityToggleOptions {
  isOnline: boolean;
  busy: boolean;
  connectivityBlocked: boolean;
  connectivityStatus: ConnectivityStatus;
  setOnline: (value: boolean) => void;
  setBusy: (value: boolean) => void;
  setError: (message: string | null) => void;
  onGpsCheck: (available: boolean) => void;
  pendingAckRef: MutableRefObject<boolean>;
}

/**
 * The Go Online / Go Offline action. Going online requires location
 * permission and GPS, prefers the socket ack path, and falls back to REST;
 * going offline is the mirror image. The button stays busy until the server
 * acknowledges via driver:status (`pendingAckRef`).
 */
export function useAvailabilityToggle({
  isOnline,
  busy,
  connectivityBlocked,
  connectivityStatus,
  setOnline,
  setBusy,
  setError,
  onGpsCheck,
  pendingAckRef,
}: UseAvailabilityToggleOptions) {
  const [permissionDenied, setPermissionDenied] = useState(false);

  const closePermissionDialog = useCallback(
    () => setPermissionDenied(false),
    [],
  );

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

        onGpsCheck(await isGpsEnabled());

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
      setError(getErrorMessage(err, "Could not update availability"));
      setBusy(false);
    }
  }, [
    busy,
    isOnline,
    connectivityBlocked,
    connectivityStatus,
    setOnline,
    setBusy,
    setError,
    onGpsCheck,
    pendingAckRef,
  ]);

  return { permissionDenied, closePermissionDialog, toggleOnline };
}

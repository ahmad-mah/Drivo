import { useEffect } from "react";
import { updateAvailability } from "@/api/drivers/drivers.api";
import { emitHeartbeat, isDriverSocketConnected } from "../services/driver-socket";
import { isGpsEnabled } from "../services/location-permissions";

const HEARTBEAT_MS = 10_000;

/**
 * Liveness ping decoupled from GPS motion: the location provider suppresses
 * callbacks when the device is stationary, which would otherwise trip the
 * server's stale sweep and drop an online, parked driver off the admin map.
 * Same tick polls the GPS master switch — availability is only a health
 * signal (warn, never auto-drop), so an online driver stays online.
 */
export function useDriverHeartbeat(
  isOnline: boolean,
  onGpsCheck: (available: boolean) => void,
) {
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
      onGpsCheck(await isGpsEnabled());
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [isOnline, onGpsCheck]);
}

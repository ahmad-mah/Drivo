import { useEffect, useRef, useState } from "react";
import * as ridesApi from "@/api/rides/rides.api";
import { connectSocket } from "@/shared/services/socket";
import type { Ride } from "../types/ride.types";

const RIDE_REQUESTED = "ride:requested";
const DRIVER_ASSIGNED = "driver:assigned";
const RIDE_EXPIRED = "ride:expired";

/**
 * Listens for ride events while the rider is connected.
 * `onExpired` fires the moment the server sweeps the active ride to EXPIRED —
 * the authoritative expiry signal, so the UI never depends on a device clock
 * or waits for the next poll to notice.
 */
export function useRideSocket(onExpired?: () => void) {
  const [socketRide, setSocketRide] = useState<Ride | null>(null);
  const [connected, setConnected] = useState(false);
  // Kept in a ref so re-renders never resubscribe the socket listeners.
  const expiredRef = useRef(onExpired);
  expiredRef.current = onExpired;

  useEffect(() => {
    let mounted = true;

    async function setup() {
      const s = await connectSocket();
      if (!mounted || !s) return;

      const onConnect = () => {
        if (mounted) setConnected(true);
      };
      const onDisconnect = () => {
        if (mounted) setConnected(false);
      };

      const onRideRequested = async () => {
        if (!mounted) return;
        try {
          const ride = await ridesApi.getActiveRide();
          if (mounted) setSocketRide(ride);
        } catch {
          if (mounted) setSocketRide(null);
        }
      };

      const onDriverAssigned = async () => {
        if (!mounted) return;
        try {
          const ride = await ridesApi.getActiveRide();
          if (mounted) setSocketRide(ride);
        } catch {
          if (mounted) setSocketRide(null);
        }
      };

      const onRideExpired = () => {
        if (!mounted) return;
        setSocketRide(null);
        expiredRef.current?.();
      };

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);
      s.on(RIDE_REQUESTED, onRideRequested);
      s.on(DRIVER_ASSIGNED, onDriverAssigned);
      s.on(RIDE_EXPIRED, onRideExpired);

      if (s.connected) setConnected(true);

      return () => {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.off(RIDE_REQUESTED, onRideRequested);
        s.off(DRIVER_ASSIGNED, onDriverAssigned);
        s.off(RIDE_EXPIRED, onRideExpired);
      };
    }

    const cleanupPromise = setup();

    return () => {
      mounted = false;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, []);

  return { socketRide, connected };
}

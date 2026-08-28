import { useCallback, useEffect, useRef, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import * as ridesApi from "@/api/rides/rides.api";
import { RideStatus } from "../enums/RideStatus";
import { connectSocket } from "@/shared/services/socket";
import { toLiveRide } from "../utils/ridePhase";
import { RIDE_COMPLETED_EVENT } from "@/features/home/hooks/useRides";
import type { Ride } from "../types/ride.types";

const RIDE_REQUESTED = "ride:requested";
const DRIVER_ASSIGNED = "driver:assigned";
const RIDE_EXPIRED = "ride:expired";
const RIDE_UPDATED = "ride:updated";

export type RideExpiredReason = "expired" | "cancelled";

/**
 * Listens for ride events while the rider is connected.
 * `onExpired` fires with the reason the ride ended:
 * - "expired": the server swept the active ride to EXPIRED
 * - "cancelled": the ride was cancelled (by driver, rider, or system) or
 *   otherwise disappeared — the last known ride data is passed so the
 *   caller can inspect `cancelReason`.
 */
export function useRideSocket(onExpired?: (reason: RideExpiredReason, lastRide?: Ride | null) => void) {
  const [socketRide, setSocketRide] = useState<Ride | null>(null);
  const [connected, setConnected] = useState(false);
  const expiredRef = useRef(onExpired);
  const lastRideRef = useRef<Ride | null>(null);
  useEffect(() => { expiredRef.current = onExpired; });

  const applyFetchedRide = useCallback((ride: Ride, mounted: boolean) => {
    if (!mounted) return;
    lastRideRef.current = ride;
    const live = toLiveRide(ride);
    // COMPLETED is a successful terminal state — keep the ride data alive
    // so the UI can show the rating card. The screen clears it after the
    // user taps Done.
    if (!live && ride.status === RideStatus.COMPLETED) {
      setSocketRide(ride);
      DeviceEventEmitter.emit(RIDE_COMPLETED_EVENT);
      return;
    }
    setSocketRide(live);
    if (!live) {
      if (ride.status === RideStatus.EXPIRED) {
        expiredRef.current?.("expired");
      } else if (ride.status === RideStatus.CANCELLED) {
        expiredRef.current?.("cancelled", ride);
      }
    }
  }, []);

  const clearSocketRide = useCallback(() => {
    setSocketRide(null);
    lastRideRef.current = null;
  }, []);

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

      const fetchAndApply = async () => {
        if (!mounted) return;
        try {
          const ride = await ridesApi.getActiveRide();
          applyFetchedRide(ride, mounted);
        } catch {
          if (mounted) setSocketRide(null);
        }
      };

      const onRideExpired = () => {
        if (!mounted) return;
        setSocketRide(null);
        expiredRef.current?.("expired");
      };

      const onRideUpdated = async () => {
        if (!mounted) return;
        try {
          const ride = await ridesApi.getActiveRide();
          applyFetchedRide(ride, mounted);
        } catch {
          if (mounted) {
            const last = lastRideRef.current;
            setSocketRide(null);
            expiredRef.current?.("cancelled", last);
          }
        }
      };

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);
      s.on(RIDE_REQUESTED, fetchAndApply);
      s.on(DRIVER_ASSIGNED, fetchAndApply);
      s.on(RIDE_EXPIRED, onRideExpired);
      s.on(RIDE_UPDATED, onRideUpdated);

      if (s.connected) setConnected(true);

      return () => {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.off(RIDE_REQUESTED, fetchAndApply);
        s.off(DRIVER_ASSIGNED, fetchAndApply);
        s.off(RIDE_EXPIRED, onRideExpired);
        s.off(RIDE_UPDATED, onRideUpdated);
      };
    }

    const cleanupPromise = setup();

    return () => {
      mounted = false;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [applyFetchedRide]);

  return { socketRide, connected, clearSocketRide };
}

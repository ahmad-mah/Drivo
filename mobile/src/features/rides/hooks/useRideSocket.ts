import { useEffect, useState } from "react";
import * as ridesApi from "@/api/rides/rides.api";
import { connectSocket } from "@/shared/services/socket";
import type { Ride } from "../types/ride.types";

const RIDE_REQUESTED = "ride:requested";
const DRIVER_ASSIGNED = "driver:assigned";

export function useRideSocket() {
  const [socketRide, setSocketRide] = useState<Ride | null>(null);
  const [connected, setConnected] = useState(false);

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

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);
      s.on(RIDE_REQUESTED, onRideRequested);
      s.on(DRIVER_ASSIGNED, onDriverAssigned);

      if (s.connected) setConnected(true);

      return () => {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.off(RIDE_REQUESTED, onRideRequested);
        s.off(DRIVER_ASSIGNED, onDriverAssigned);
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

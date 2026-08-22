import { useEffect, useState } from "react";
import type { LocationObject } from "expo-location";
import { Image } from "expo-image";
import * as driversApi from "@/api/drivers/drivers.api";
import { connectSocket } from "@/shared/services/socket";
import type { NearbyDriver } from "../types/ride.types";
import { haversineMeters } from "../utils/distance";

const NEARBY_RADIUS_KM = 1;
const NEARBY_RADIUS_METERS = NEARBY_RADIUS_KM * 1_000;
const MAX_NEARBY_DRIVERS = 4;
// Slow reconciliation only — the socket is the primary channel; this poll
// catches up clients that dropped events or never connected.
const REFRESH_MS = 15_000;
const DRIVERS_NEARBY_EVENT = "drivers:nearby";

export function useNearbyDrivers(location: LocationObject | null) {
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const latitude = location?.coords.latitude ?? null;
  const longitude = location?.coords.longitude ?? null;

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setDrivers([]);
      return;
    }

    const distanceFromUser = (driver: NearbyDriver) =>
      haversineMeters(latitude, longitude, driver.latitude, driver.longitude);

    const applyNearbyDrivers = (payload: NearbyDriver[]) => {
      const next = payload
        .filter((driver) => distanceFromUser(driver) <= NEARBY_RADIUS_METERS)
        .sort((a, b) => distanceFromUser(a) - distanceFromUser(b))
        .slice(0, MAX_NEARBY_DRIVERS);
      setDrivers(next);
    };

    let disposed = false;
    let socketUnsubscribe: (() => void) | null = null;

    const fetchDrivers = async () => {
      try {
        const result = await driversApi.fetchNearbyDrivers(
          latitude,
          longitude,
          NEARBY_RADIUS_KM,
        );
        applyNearbyDrivers(result ?? []);
      } catch {
        setDrivers([]);
      }
    };

    void fetchDrivers();
    const timer = setInterval(fetchDrivers, REFRESH_MS);

    connectSocket().then((s) => {
      if (!s || disposed) return;
      const handler = (payload: NearbyDriver[]) => {
        applyNearbyDrivers(payload);
      };
      s.on(DRIVERS_NEARBY_EVENT, handler);
      socketUnsubscribe = () => {
        s.off(DRIVERS_NEARBY_EVENT, handler);
      };
    });

    return () => {
      disposed = true;
      clearInterval(timer);
      socketUnsubscribe?.();
    };
  }, [latitude, longitude]);

  useEffect(() => {
    drivers.forEach((driver) => {
      if (driver.imageUrl) {
        void Image.prefetch(driver.imageUrl);
      }
    });
  }, [drivers]);

  return { drivers };
}

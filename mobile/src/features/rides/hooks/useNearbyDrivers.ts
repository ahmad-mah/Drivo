import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { LayoutAnimation, Platform, UIManager } from "react-native";
import type { LocationObject } from "expo-location";
import * as driversApi from "@/api/drivers/drivers.api";
import { connectSocket } from "@/shared/services/socket";
import type { NearbyDriver } from "../types/ride.types";
import { haversineMeters } from "../utils/distance";

const NEARBY_RADIUS_KM = 1;
const NEARBY_RADIUS_METERS = NEARBY_RADIUS_KM * 1_000;
const MAX_ONLINE_DRIVERS = 4;
const DRIVERS_NEARBY_EVENT = "drivers:nearby";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Socket-only nearby drivers. The list is stable: online drivers keep their
 * slot while their coordinates refresh and new arrivals are appended. When
 * the backend stops reporting a driver (offline / stale sweep) they are not
 * removed — they flip to `isOnline: false`, drop to the end of the list and
 * come back to their online slot automatically if they reappear.
 */
export function useNearbyDrivers(location: LocationObject | null) {
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const latitude = location?.coords.latitude ?? null;
  const longitude = location?.coords.longitude ?? null;
  const hasCoords = latitude != null && longitude != null;

  // Latest coords for the radius filter live in refs so the socket
  // subscription stays mounted for the whole screen — resubscribing on every
  // GPS jitter tick was causing constant teardown/refetch churn.
  const coordsRef = useRef({ latitude, longitude });
  useEffect(() => {
    coordsRef.current = { latitude, longitude };
  }, [latitude, longitude]);

  const driversRef = useRef<NearbyDriver[]>([]);

  useEffect(() => {
    if (!hasCoords) return;

    let disposed = false;
    let unsubscribe: (() => void) | null = null;

    const withinRadius = (driver: NearbyDriver) => {
      const { latitude: lat, longitude: lng } = coordsRef.current;
      if (lat == null || lng == null) return false;
      return (
        haversineMeters(lat, lng, driver.latitude, driver.longitude) <=
        NEARBY_RADIUS_METERS
      );
    };

    const applyPayload = (payload: NearbyDriver[]) => {
      const incomingIds = new Set(
        payload.filter(withinRadius).map((driver) => driver.id),
      );
      const byId = new Map(payload.map((driver) => [driver.id, driver]));

      let listChanged = false;
      const online: NearbyDriver[] = [];
      const offline: NearbyDriver[] = [];

      // Existing drivers keep their relative order; a driver missing from the
      // broadcast flips to offline and drops to the end of the list.
      for (const driver of driversRef.current) {
        if (incomingIds.has(driver.id)) {
          if (driver.isOnline === false) listChanged = true;
          online.push({ ...byId.get(driver.id)!, isOnline: true });
        } else if (driver.isOnline === false) {
          offline.push(driver);
        } else {
          offline.push({ ...driver, isOnline: false });
          listChanged = true;
        }
      }

      // New arrivals are appended after the last online driver — the online
      // block never reorders under the user.
      for (const driver of payload) {
        if (!withinRadius(driver)) continue;
        const known =
          online.some((existing) => existing.id === driver.id) ||
          offline.some((existing) => existing.id === driver.id);
        if (!known) {
          online.push({ ...driver, isOnline: true });
          listChanged = true;
        }
      }

      if (listChanged) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      driversRef.current = [
        ...online.slice(0, MAX_ONLINE_DRIVERS),
        ...offline,
      ];
      setDrivers(driversRef.current);
      setLoading(false);
    };

    // One-time REST paint so cars show instantly even before the first
    // broadcast lands; everything after this is socket-only.
    void driversApi
      .fetchNearbyDrivers(
        coordsRef.current.latitude!,
        coordsRef.current.longitude!,
        NEARBY_RADIUS_KM,
      )
      .then((result) => {
        if (!disposed) applyPayload(result ?? []);
      })
      .catch(() => {
        if (!disposed) setLoading(false);
      });

    connectSocket().then((s) => {
      if (!s || disposed) return;
      const handler = (payload: NearbyDriver[]) => {
        applyPayload(payload);
      };
      s.on(DRIVERS_NEARBY_EVENT, handler);
      unsubscribe = () => {
        s.off(DRIVERS_NEARBY_EVENT, handler);
      };
    });

    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, [hasCoords]);

  useEffect(() => {
    drivers.forEach((driver) => {
      if (driver.imageUrl) {
        void Image.prefetch(driver.imageUrl);
      }
    });
  }, [drivers]);

  return { drivers: hasCoords ? drivers : [], loading: hasCoords ? loading : true };
}

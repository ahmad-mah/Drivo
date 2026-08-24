import { useEffect, useRef } from "react";
import type MapView from "react-native-maps";
import type { LocationObject } from "expo-location";
import type {
  NearbyDriver,
  RidePoint,
} from "../types/ride.types";
import {
  liftedRegionForPoint,
  regionFor,
  regionForRoute,
  regionFromCoords,
} from "../utils/mapRegion";

interface UseMapCameraOptions {
  location: LocationObject | null;
  focusedDriver: NearbyDriver | null;
  origin: RidePoint | null;
  destination: RidePoint | null;
}

/**
 * Camera choreography for the ride-request map: centers on the rider once
 * the first GPS fix lands, follows the picked route points as they resolve,
 * pans to a driver picked from the sheet list, and exposes a recenter
 * handler. The map itself never moves on marker presses.
 */
export function useMapCamera({
  location,
  focusedDriver,
  origin,
  destination,
}: UseMapCameraOptions) {
  const mapRef = useRef<MapView>(null);

  // Skip the centering animation when a fix is already available at mount
  const didCenter = useRef(location !== null);

  useEffect(() => {
    if (!location || didCenter.current) return;
    didCenter.current = true;
    mapRef.current?.animateToRegion(regionFor(location), 500);
  }, [location]);

  // Follow the ride points as they resolve: both ends frame the route, a
  // lone origin gets a lifted view, a lone destination centers on it.
  useEffect(() => {
    const region =
      origin && destination
        ? regionForRoute(origin, destination)
        : origin
          ? liftedRegionForPoint(origin.latitude, origin.longitude)
          : destination
            ? regionFromCoords(destination.latitude, destination.longitude)
            : null;
    if (region) mapRef.current?.animateToRegion(region, 500);
  }, [origin, destination]);

  // Picking a driver from the sheet list pans the map to their marker so the
  // rider sees which car they are choosing; the ref guard keeps position
  // updates from re-triggering the animation for the same pick.
  const lastFocusedDriverId = useRef<string | null>(null);

  useEffect(() => {
    if (!focusedDriver || lastFocusedDriverId.current === focusedDriver.id) return;
    lastFocusedDriverId.current = focusedDriver.id;
    mapRef.current?.animateToRegion(
      liftedRegionForPoint(focusedDriver.latitude, focusedDriver.longitude),
      500,
    );
  }, [focusedDriver]);

  const recenterToUser = () => {
    if (!location) return;
    mapRef.current?.animateToRegion(regionFor(location), 500);
  };

  return { mapRef, recenterToUser };
}

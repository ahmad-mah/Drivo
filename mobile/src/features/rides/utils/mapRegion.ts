import type { LocationObject } from "expo-location";
import type { Region } from "react-native-maps";
import { CAIRO_REGION, regionFromCoords } from "@/shared/utils/mapRegion";

export { CAIRO_REGION, regionFromCoords };

const RIDE_MAP_DELTA = 0.01;
// Lift the rider to 10% from the top; the camera centers `delta * factor`
// south so the rider renders above the middle. Used for the recenter button
// press and the initial position.
const RIDE_MAP_LIFT_FACTOR = 0.4;

/**
 * Centers a coordinate with the center biased south (the point renders above
 * the vertical middle). Used to keep the rider clear of the form sheet while
 * they pick a destination.
 */
export function liftedRegionFromCoords(
  latitude: number,
  longitude: number,
  delta = RIDE_MAP_DELTA,
  liftFactor = 0.3,
): Region {
  return {
    latitude: latitude - delta * liftFactor,
    longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

/** The ride-flow center used for the rider's live position. */
export function liftedRegionForPoint(latitude: number, longitude: number): Region {
  return liftedRegionFromCoords(
    latitude,
    longitude,
    RIDE_MAP_DELTA,
    RIDE_MAP_LIFT_FACTOR,
  );
}

export function regionFor(location: LocationObject | null): Region {
  if (!location) return CAIRO_REGION;
  return liftedRegionForPoint(
    location.coords.latitude,
    location.coords.longitude,
  );
}

/**
 * Region that fits both route ends into the visible map band above the bottom
 * sheet, centered vertically there. The sheet overlays the bottom ~60% of the
 * screen, so the route is fit into the top ~40% and the camera pans up when the
 * route sits low or down when it sits high.
 */
export function regionForRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
): Region {
  const minLat = Math.min(origin.latitude, destination.latitude);
  const maxLat = Math.max(origin.latitude, destination.latitude);
  const minLng = Math.min(origin.longitude, destination.longitude);
  const maxLng = Math.max(origin.longitude, destination.longitude);

  // Delta scales with the widest span so nearby picks stay tight and far apart
  // ones zoom out; the floor prevents a degenerate zoom for close pairs.
  const span = Math.max(maxLat - minLat, maxLng - minLng, 0.008);

  // Fit the route into the visible band (top ~40% of the screen) instead of the
  // whole viewport, half of which is hidden behind the sheet.
  const delta = (span / 0.4) * 1.4;

  // Center the route vertically in the visible band: its midpoint renders at
  // 20% from the top (screen center is 50%, so shift the camera south by 30%).
  return {
    latitude: (minLat + maxLat) / 2 - delta * 0.3,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}
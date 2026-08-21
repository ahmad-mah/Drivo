import type { Region } from "react-native-maps";

export const CAIRO_REGION: Region = {
  latitude: 30.0444,
  longitude: 31.2357,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function regionFromCoords(
  latitude: number,
  longitude: number,
  delta = 0.01,
): Region {
  return {
    latitude,
    longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}
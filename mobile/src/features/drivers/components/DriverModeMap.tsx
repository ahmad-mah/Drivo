import { useState } from "react";
import { View } from "react-native";
import type { LocationObject } from "expo-location";
import type { Region } from "react-native-maps";
import { AppMapView } from "@/shared/components";
import { DEFAULT_MAP_STYLE } from "@/shared/constants/map-style";

interface DriverModeMapProps {
  location: LocationObject | null;
  autoOffline: boolean;
}

/**
 * Full-screen map for driver mode. Freezes the last online region so the map
 * stays put during auto-offline instead of following the GPS watch (a driver
 * offline has no live location). Snapshot happens on the offline transition
 * while rendering (React's "adjust state during render" pattern) — not in an
 * effect.
 */
export function DriverModeMap({ location, autoOffline }: DriverModeMapProps) {
  const [frozenRegion, setFrozenRegion] = useState<Region | null>(null);
  const [wasOffline, setWasOffline] = useState(autoOffline);
  if (wasOffline !== autoOffline) {
    setWasOffline(autoOffline);
    if (autoOffline && location) {
      setFrozenRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }

  const liveRegion: Region = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 30.0444,
        longitude: 31.2357,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
  const region = autoOffline && frozenRegion ? frozenRegion : liveRegion;

  return (
    <View className="flex-1">
      <AppMapView
        className="flex-1"
        showsBuildings={false}
        showsTraffic={false}
        showsIndoorLevelPicker={false}
        toolbarEnabled={false}
        showsUserLocation={!autoOffline}
        showsMyLocationButton
        showsCompass
        pitchEnabled
        rotateEnabled
        region={region}
        customMapStyle={DEFAULT_MAP_STYLE}
      />
      {autoOffline && (
        <View className="absolute inset-0 bg-black/20" pointerEvents="none" />
      )}
    </View>
  );
}

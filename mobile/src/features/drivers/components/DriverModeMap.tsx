import { useRef, useState } from "react";
import { View } from "react-native";
import type { LocationObject } from "expo-location";
import MapView, { type Region } from "react-native-maps";
import { AppMapView, RecenterButton } from "@/shared/components";
import { CAIRO_REGION, regionFromCoords } from "@/shared/utils/mapRegion";

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
 *
 * The map follows the live GPS fix until the driver pans manually; the
 * recenter button hands control back to the GPS.
 */
export function DriverModeMap({ location, autoOffline }: DriverModeMapProps) {
  const mapRef = useRef<MapView>(null);
  const [frozenRegion, setFrozenRegion] = useState<Region | null>(null);
  const [wasOffline, setWasOffline] = useState(autoOffline);
  // After a manual pan the controlled `region` prop would snap the camera
  // back on every GPS fix — stop feeding it until the driver recenters.
  const [userPanned, setUserPanned] = useState(false);
  if (wasOffline !== autoOffline) {
    setWasOffline(autoOffline);
    if (autoOffline && location) {
      setFrozenRegion(
        regionFromCoords(location.coords.latitude, location.coords.longitude),
      );
    }
  }

  const liveRegion: Region = location
    ? regionFromCoords(location.coords.latitude, location.coords.longitude)
    : CAIRO_REGION;
  const followRegion = userPanned ? undefined : liveRegion;
  const region =
    autoOffline && frozenRegion ? frozenRegion : (followRegion as Region | undefined);

  const recenterToUser = () => {
    if (!location) return;
    setUserPanned(false);
    mapRef.current?.animateToRegion(liveRegion, 500);
  };

  return (
    <View className="flex-1">
      <AppMapView
        ref={mapRef}
        className="flex-1"
        showsUserLocation={!autoOffline}
        showsMyLocationButton={false}
        showsCompass
        pitchEnabled
        rotateEnabled
        region={region}
        onPanDrag={() => setUserPanned(true)}
      />
      {!autoOffline && (
        <View className="absolute inset-e-4 bottom-56">
          <RecenterButton onPress={recenterToUser} />
        </View>
      )}
      {autoOffline && (
        <View className="absolute inset-0 bg-black/20" pointerEvents="none" />
      )}
    </View>
  );
}

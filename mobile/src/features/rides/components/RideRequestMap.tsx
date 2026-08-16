import { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import type { LocationObject } from "expo-location";
import MapView, { type Region } from "react-native-maps";
import { AppImage, AppMapView } from "@/shared/components";
import { DEFAULT_MAP_STYLE } from "@/shared/constants/map-style";

interface RideRequestMapProps {
  location: LocationObject | null;
}

const CAIRO_REGION: Region = {
  latitude: 30.0444,
  longitude: 31.2357,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function regionFor(location: LocationObject | null): Region {
  if (!location) return CAIRO_REGION;
  const latitudeDelta = 0.01;
  // Shift the map center south of the rider so the location marker sits above
  // the vertical middle, leaving the route ahead visible.
  return {
    latitude: location.coords.latitude - latitudeDelta * 0.3,
    longitude: location.coords.longitude,
    latitudeDelta,
    longitudeDelta: 0.01,
  };
}

/**
 * Full-screen map for the ride request flow. Centers on the rider once the
 * first GPS fix lands, then stays pannable (it's a destination picker). The
 * vertically-centered button at the map's horizontal end re-centers on the
 * user via `animateToRegion` when they pan away.
 */
export function RideRequestMap({ location }: RideRequestMapProps) {
  const mapRef = useRef<MapView>(null);
  const didCenter = useRef(false);

  useEffect(() => {
    if (!location || didCenter.current) return;
    didCenter.current = true;
    mapRef.current?.animateToRegion(regionFor(location), 500);
  }, [location]);

  const recenterToUser = () => {
    if (!location) return;
    mapRef.current?.animateToRegion(regionFor(location), 500);
  };

  return (
    <View className="flex-1">
      <AppMapView
        ref={mapRef}
        className="flex-1"
        showsBuildings={false}
        showsTraffic={false}
        showsIndoorLevelPicker={false}
        toolbarEnabled={false}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        pitchEnabled
        rotateEnabled
        initialRegion={regionFor(location)}
        customMapStyle={DEFAULT_MAP_STYLE}
      />
      <View className="absolute inset-e-4 top-[30%] -translate-y-1/2">
        <Pressable
          onPress={recenterToUser}
          hitSlop={8}
          className="rounded-full bg-green-500 p-3"
          style={{
            shadowColor: "#101010",
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
            shadowOpacity: 0.2,
            elevation: 3,
          }}
        >
          <AppImage
            source={require("@/assets/icons/target.png")}
            className="size-6"
            tintColor="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}
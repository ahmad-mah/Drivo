import { Text, View } from "react-native";
import { AppMapView } from "@/shared/components";
import { DEFAULT_MAP_STYLE } from "@/shared/constants/map-style";
import { useCurrentLocation } from "../hooks/useCurrentLocation";

export function HomeMap() {
  const location = useCurrentLocation();
  if (!location) return null;

  return (
    <View className="gap-2">
      <Text className="font-Jakarta-Bold text-secondary-900 text-xl">
        Your current location
      </Text>
      <AppMapView
        className="h-60 rounded-2xl"
        showsCompass={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoorLevelPicker={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        showsUserLocation
        region={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        customMapStyle={DEFAULT_MAP_STYLE}
      />
    </View>
  );
}

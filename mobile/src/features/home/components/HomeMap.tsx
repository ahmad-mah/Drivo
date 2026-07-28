import { Text, View } from "react-native";
import { AppMapView } from "@/shared/components";
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
        customMapStyle={customMapStyle}
      />
    </View>
  );
}

const customMapStyle = [
  {
    featureType: "all",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative",
    stylers: [{ visibility: "off" }],
  }, 
  // Show road names
  {
    featureType: "road",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#E5E5E5" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#E5E5E5" }],
  },
];

import type { Ride } from "@/features/rides/types/ride.types";
import { AppMapView } from "@/shared/components/AppMapView";
import { Marker } from "react-native-maps";
import { View } from "react-native";

export function RideMapThumbnail({ item }: { item: Ride }) {
  const origin = {
    latitude: item.originLatitude,
    longitude: item.originLongitude,
  };
  const destination = {
    latitude: item.destinationLatitude,
    longitude: item.destinationLongitude,
  };

  const minLat = Math.min(origin.latitude, destination.latitude);
  const maxLat = Math.max(origin.latitude, destination.latitude);
  const minLng = Math.min(origin.longitude, destination.longitude);
  const maxLng = Math.max(origin.longitude, destination.longitude);
  const span = Math.max(maxLat - minLat, maxLng - minLng, 0.005);
  const padding = span * 1.2;

  const region = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: span + padding * 2,
    longitudeDelta: span + padding * 2,
  };

  return (
    <AppMapView
      className="size-20 overflow-hidden rounded-xl"
      style={{ width: 80, height: 80, borderRadius: 12 }}
      region={region}
      scrollEnabled={false}
      zoomEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
      liteMode
    >
      <Marker
        coordinate={origin}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
      >
        <View className="size-3 rounded-full border-2 border-white bg-primary-500" />
      </Marker>
      <Marker
        coordinate={destination}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
      >
        <View className="size-3 rounded-full border-2 border-white bg-green-500" />
      </Marker>
    </AppMapView>
  );
}

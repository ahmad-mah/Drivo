import { Text, View } from "react-native";
import { useMemo } from "react";
import { AppMapView, Shimmer, UserLocationMarker } from "@/shared/components";
import { CarMarker } from "@/features/rides/components/CarMarker";
import { useNearbyDrivers } from "@/features/rides/hooks/useNearbyDrivers";
import { regionFromCoords } from "@/shared/utils/mapRegion";
import { useCurrentLocation } from "../hooks/useCurrentLocation";

const HOME_MAP_DELTA = 0.006;

export function HomeMap() {
  const location = useCurrentLocation();
  const { drivers } = useNearbyDrivers(location);

  const driverMarkers = useMemo(() => drivers.slice(0, 4).map((driver) => (
    <CarMarker key={driver.id} driver={driver} />
  )), [drivers]);

  return (
    <View className="gap-2">
      <Text className="font-Jakarta-Bold text-secondary-900 text-xl">
        Your current location
      </Text>
      {location ? (
        <AppMapView
          className="h-60 rounded-2xl"
          showsCompass={false}
          showsMyLocationButton={false}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          region={regionFromCoords(
            location.coords.latitude,
            location.coords.longitude,
            HOME_MAP_DELTA,
          )}
        >
          <UserLocationMarker
            interactive={false}
            latitude={location.coords.latitude}
            longitude={location.coords.longitude}
          />
          {driverMarkers}
        </AppMapView>
      ) : (
        <Shimmer height={240} borderRadius={16} />
      )}
    </View>
  );
}
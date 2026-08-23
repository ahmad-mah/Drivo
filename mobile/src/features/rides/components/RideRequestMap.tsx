import type MapView from "react-native-maps";
import type { LocationObject } from "expo-location";
import { Circle, Polyline } from "react-native-maps";
import { Text, View } from "react-native";
import { AppMapView, RecenterButton } from "@/shared/components";
import type {
  NearbyDriver,
  PickField,
  RidePoint,
  RouteCoordinate,
} from "../types/ride.types";
import { DriverMarker } from "./DriverMarker";
import { RidePointMarkers } from "./RidePointMarkers";
import { SelfMarker } from "./SelfMarker";
import { useMapCamera } from "../hooks/useMapCamera";
import { useRideMapSelection } from "../hooks/useRideMapSelection";
import { regionFor } from "../utils/mapRegion";

interface RideRequestMapProps {
  location: LocationObject | null;
  origin?: RidePoint | null;
  destination?: RidePoint | null;
  route?: RouteCoordinate[];
  drivers?: NearbyDriver[];
  originIsCurrentLocation?: boolean;
  selectedDriverId?: string | null;
  focusedDriver?: NearbyDriver | null;
  onSelectDriver?: (driver: NearbyDriver | null) => void;
  userImageUrl?: string | null;
  userName?: string | null;
  /** When set, the next map tap drops a pin for that field instead of
   *  selecting a driver. */
  pickingField?: PickField | null;
  onMapPick?: (latitude: number, longitude: number) => void;
}

/**
 * Full-screen map for the ride request flow. Pure presentation over three
 * hooks: camera choreography (useMapCamera), marker selection
 * (useRideMapSelection) and — while a pick is active — map-tap-to-fill for
 * the From/To fields.
 */
export function RideRequestMap({
  location,
  origin,
  destination,
  route = [],
  drivers = [],
  originIsCurrentLocation = false,
  selectedDriverId: controlledSelectedDriverId,
  focusedDriver,
  onSelectDriver,
  userImageUrl,
  userName,
  pickingField = null,
  onMapPick,
}: RideRequestMapProps) {
  const { mapRef, recenterToUser } = useMapCamera({
    location,
    focusedDriver: focusedDriver ?? null,
    origin: origin ?? null,
    destination: destination ?? null,
  });

  const {
    selectedDriverId,
    isSelfSelected,
    handleMapPress: handleDriverMapPress,
    handleDriverPress,
    handleSelfPress,
  } = useRideMapSelection({
    controlledSelectedDriverId,
    onSelectDriver,
  });

  const handleMapPress = (
    event: Parameters<NonNullable<React.ComponentProps<typeof MapView>["onPress"]>>[0],
  ) => {
    if (pickingField && onMapPick) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onMapPick(latitude, longitude);
      return;
    }
    handleDriverMapPress();
  };

  return (
    <View className="flex-1">
      <AppMapView
        ref={mapRef}
        className="flex-1"
        showsMyLocationButton={false}
        showsCompass
        pitchEnabled
        rotateEnabled
        initialRegion={regionFor(location)}
        onPress={handleMapPress}
      >
        {location && (
          <SelfMarker
            location={location}
            isSelfSelected={isSelfSelected}
            userImageUrl={userImageUrl}
            userName={userName}
            onPress={handleSelfPress}
          />
        )}

        {isSelfSelected && location && (
          <Circle
            center={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            radius={500}
            strokeColor="#0286FF"
            fillColor="rgba(2,134,255,0.15)"
            strokeWidth={1.5}
          />
        )}

        <RidePointMarkers
          origin={origin}
          destination={destination}
          originIsCurrentLocation={originIsCurrentLocation}
        />

        {drivers.slice(0, 4).map((driver) => (
          <DriverMarker
            key={driver.id}
            driver={driver}
            selected={selectedDriverId === driver.id}
            onPress={handleDriverPress}
          />
        ))}

        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor="#34C759"
            strokeWidth={3}
          />
        )}
      </AppMapView>

      <View className="absolute inset-e-4 top-[30%] -translate-y-1/2">
        <RecenterButton onPress={recenterToUser} />
      </View>

      {pickingField && (
        <View
          pointerEvents="none"
          className="absolute inset-x-12 top-4 items-center rounded-full bg-secondary-900/90 px-4 py-2"
        >
          <Text className="text-center font-Jakarta-SemiBold text-xs text-white">
            Tap the map to set your {pickingField === "from" ? "pickup" : "destination"}
          </Text>
        </View>
      )}
    </View>
  );
}

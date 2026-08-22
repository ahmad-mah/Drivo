import { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import type { LocationObject } from "expo-location";
import { Image } from "expo-image";
import MapView, { Circle, Polyline } from "react-native-maps";
import { AppImage, AppMapView } from "@/shared/components";
import type { NearbyDriver, RidePoint, RouteCoordinate } from "../types/ride.types";
import { DriverMarker } from "./DriverMarker";
import { RidePointMarkers } from "./RidePointMarkers";
import { SelfMarker } from "./SelfMarker";
import { useRideMapSelection } from "../hooks/useRideMapSelection";
import {
  liftedRegionForPoint,
  regionFor,
  regionForRoute,
  regionFromCoords,
} from "../utils/mapRegion";

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
}

/**
 * Full-screen map for the ride request flow. Centers on the rider once the
 * first GPS fix lands, then stays pannable. Supports tapping drivers to see
 * their green-bordered avatar and tapping the rider to see their blue-bordered
 * avatar; the map itself never moves on marker presses.
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
}: RideRequestMapProps) {
  const mapRef = useRef<MapView>(null);

  const { selectedDriverId, isSelfSelected, handleMapPress, handleDriverPress, handleSelfPress } =
    useRideMapSelection({
      controlledSelectedDriverId,
      onSelectDriver,
    });

  // Prefetch rider avatar image immediately
  useEffect(() => {
    if (userImageUrl) {
      void Image.prefetch(userImageUrl);
    }
  }, [userImageUrl]);

  // Skip the centering animation when a fix is already available at mount
  const didCenter = useRef(location !== null);

  useEffect(() => {
    if (!location || didCenter.current) return;
    didCenter.current = true;
    mapRef.current?.animateToRegion(regionFor(location), 500);
  }, [location]);

  useEffect(() => {
    const region =
      origin && destination
        ? regionForRoute(origin, destination)
        : origin
          ? liftedRegionForPoint(origin.latitude, origin.longitude)
          : destination
            ? regionFromCoords(destination.latitude, destination.longitude)
            : null;
    if (region) mapRef.current?.animateToRegion(region, 500);
  }, [origin, destination]);

  // Picking a driver from the sheet list pans the map to their marker so the
  // rider sees which car they are choosing; the ref guard keeps the polling
  // updates to `drivers` from re-triggering the animation for the same pick.
  const lastFocusedDriverId = useRef<string | null>(null);

  useEffect(() => {
    if (!focusedDriver || lastFocusedDriverId.current === focusedDriver.id) return;
    lastFocusedDriverId.current = focusedDriver.id;
    mapRef.current?.animateToRegion(
      liftedRegionForPoint(focusedDriver.latitude, focusedDriver.longitude),
      500,
    );
  }, [focusedDriver]);

  const recenterToUser = () => {
    if (!location) return;
    mapRef.current?.animateToRegion(regionFor(location), 500);
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
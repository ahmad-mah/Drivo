import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import type { NearbyDriver } from "../types/ride.types";
import { AvatarCircle } from "./AvatarCircle";
import { CarIcon } from "./CarIcon";

interface DriverMarkerProps {
  driver: NearbyDriver;
  selected: boolean;
  onPress: (driver: NearbyDriver) => void;
}

/**
 * One marker per nearby driver, kept mounted so selection only swaps the child
 * view instead of recreating the native marker (which flashes the default pin).
 * Position updates use animateMarkerToCoordinate so old coordinates never ghost
 * on the map when tracksViewChanges is frozen.
 */
export function DriverMarker({ driver, selected, onPress }: DriverMarkerProps) {
  const markerRef = useRef<React.ElementRef<typeof Marker>>(null);
  const hasAvatarImage = !!driver.imageUrl;
  const isOffline = driver.isOnline === false;
  const [avatarReady, setAvatarReady] = useState(!hasAvatarImage);
  const prevCoord = useRef({
    latitude: driver.latitude,
    longitude: driver.longitude,
  });

  useEffect(() => {
    if (!selected || avatarReady || !hasAvatarImage) return;
    let cancelled = false;
    void Image.prefetch(driver.imageUrl!).then(() => {
      if (!cancelled) setAvatarReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [selected, avatarReady, hasAvatarImage, driver.imageUrl]);

  const showAvatar = selected && avatarReady;

  const handleImageLoad = useCallback(() => {
    markerRef.current?.redraw();
  }, []);

  const isStaticAvatar = showAvatar && !hasAvatarImage;
  useEffect(() => {
    if (!isStaticAvatar) return;
    const timer = setTimeout(() => {
      markerRef.current?.redraw();
    }, 0);
    return () => clearTimeout(timer);
  }, [isStaticAvatar]);

  useEffect(() => {
    if (showAvatar) return;
    markerRef.current?.redraw();
  }, [driver.heading, showAvatar]);

  useEffect(() => {
    const prev = prevCoord.current;
    if (
      prev.latitude === driver.latitude &&
      prev.longitude === driver.longitude
    ) {
      return;
    }
    prevCoord.current = {
      latitude: driver.latitude,
      longitude: driver.longitude,
    };
    markerRef.current?.animateMarkerToCoordinate(
      { latitude: driver.latitude, longitude: driver.longitude },
      500,
    );
  }, [driver.latitude, driver.longitude]);

  return (
    <Marker
      ref={markerRef}
      coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={showAvatar ? 999 : 50}
      tracksViewChanges={false}
      flat
      onPress={(e) => {
        e?.stopPropagation?.();
        if (isOffline) return;
        onPress(driver);
      }}
    >
      <View style={{ opacity: isOffline ? 0.35 : 1 }}>
        {showAvatar ? (
          <AvatarCircle
            imageUrl={driver.imageUrl}
            fallbackLabel={driver.firstName.charAt(0)}
            size={44}
            borderColor="#34C759"
            borderWidth={1}
            fallbackClassName="bg-general-200"
            fallbackTextClassName="text-secondary-400"
            onImageLoad={handleImageLoad}
          />
        ) : (
          <CarIcon heading={driver.heading} onLoad={handleImageLoad} />
        )}
      </View>
    </Marker>
  );
}

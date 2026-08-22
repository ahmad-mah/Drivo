import { useCallback, useEffect, useRef, memo } from "react";
import { Marker } from "react-native-maps";
import type { NearbyDriver } from "../types/ride.types";
import { CarIcon } from "./CarIcon";

interface CarMarkerProps {
  driver: NearbyDriver;
  onPress?: (driver: NearbyDriver) => void;
}

/**
 * A nearby car on the map: the black car icon facing its heading. Used on the
 * home map; position updates animate in-place so stale markers never accumulate.
 */
const CarMarkerImpl = memo(function CarMarkerImpl({ driver, onPress }: CarMarkerProps) {
  const markerRef = useRef<React.ElementRef<typeof Marker>>(null);
  const prevCoord = useRef({
    latitude: driver.latitude,
    longitude: driver.longitude,
  });

  const handleImageLoad = useCallback(() => {
    markerRef.current?.redraw();
  }, []);

  useEffect(() => {
    markerRef.current?.redraw();
  }, [driver.heading]);

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
      zIndex={50}
      tracksViewChanges={false}
      flat
      onPress={
        onPress
          ? (e) => {
              e?.stopPropagation?.();
              onPress(driver);
            }
          : undefined
      }
    >
      <CarIcon heading={driver.heading} onLoad={handleImageLoad} />
    </Marker>
  );
});

export const CarMarker = memo(CarMarkerImpl);

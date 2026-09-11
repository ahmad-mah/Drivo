import { AppImage } from "@/shared/components";
import { useEffect, useRef, useState } from "react";
import { Marker } from "react-native-maps";
import type { RidePoint } from "../types/ride.types";

interface RidePointMarkersProps {
  origin?: RidePoint | null;
  destination?: RidePoint | null;
  originIsCurrentLocation?: boolean;
}

export function RidePointMarkers({
  origin,
  destination,
  originIsCurrentLocation = false,
}: RidePointMarkersProps) {
  return (
    <>
      {origin && !originIsCurrentLocation && (
        <OriginMarker
          key={`${origin.latitude}:${origin.longitude}`}
          latitude={origin.latitude}
          longitude={origin.longitude}
        />
      )}
      {destination && (
        <Marker
          key="ride-destination"
          coordinate={{
            latitude: destination.latitude,
            longitude: destination.longitude,
          }}
          title="To"
          pinColor="#34C759"
        />
      )}
    </>
  );
}

interface OriginMarkerProps {
  latitude: number;
  longitude: number;
}

function OriginMarker({ latitude, longitude }: OriginMarkerProps) {
  const [tracking, setTracking] = useState(true);
  const markerRef = useRef<React.ElementRef<typeof Marker>>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTracking(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      ref={markerRef}
      key="ride-origin"
      coordinate={{ latitude, longitude }}
      title="From"
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={tracking}
    >
      <AppImage
        source={require("@/assets/icons/pin.png")}
        className="size-5"
        tintColor="#000000"
        onLoad={() => {
          markerRef.current?.redraw();
          setTracking(false);
        }}
      />
    </Marker>
  );
}

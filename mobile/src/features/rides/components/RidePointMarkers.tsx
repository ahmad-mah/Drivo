import { Marker } from "react-native-maps";
import { AppImage } from "@/shared/components";
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
        <Marker
          coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
          title="From"
          anchor={{ x: 0.5, y: 1 }}
          tracksViewChanges={false}
        >
          <AppImage
            source={require("@/assets/icons/pin.png")}
            className="size-5"
            tintColor="#000000"
          />
        </Marker>
      )}
      {destination && (
        <Marker
          coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
          title="To"
          pinColor="#34C759"
        />
      )}
    </>
  );
}
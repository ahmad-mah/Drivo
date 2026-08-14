import { useEffect, useState } from "react";
import * as Location from "expo-location";
import {
  requestLocationPermission,
  enableHighAccuracy,
  startWatchingLocation,
} from "../utils/location";

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const initializeLocation = async () => {
      const granted = await requestLocationPermission();

      if (!granted) return;

      try {
        await enableHighAccuracy();

        subscription = await startWatchingLocation(setLocation);
      } catch {
        // Location services disabled (GPS off) or provider unavailable: leave
        // `location` null and let screens render their fallback rather than
        // surfacing an unhandled rejection from the watch call.
      }
    };

    initializeLocation();

    return () => {
      subscription?.remove();
    };
  }, []);

  return location;
};

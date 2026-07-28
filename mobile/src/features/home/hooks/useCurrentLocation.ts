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

      await enableHighAccuracy();

      subscription = await startWatchingLocation(setLocation);
    };

    initializeLocation();

    return () => {
      subscription?.remove();
    };
  }, []);

  return location;
};

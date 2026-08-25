import { useCallback, useRef, useState } from "react";
import { useRideRequestForm } from "./useRideRequestForm";
import type { PlaceSuggestion, RidePoint } from "../types/ride.types";

/**
 * Owns the ride-request form field state plus the ride-point caching
 * that pins the map/route to the searched location while the user
 * keeps typing underneath.
 */
export function useRideFormState() {
  const [rideOrigin, setRideOrigin] = useState<RidePoint | null>(null);
  const [rideDestination, setRideDestination] = useState<RidePoint | null>(
    null,
  );
  const startFindNowRef = useRef<() => void>(() => {});

  const {
    location,
    origin: formOrigin,
    destination: formDestination,
    usingCurrentLocation,
    applyPickedPoint,
    ...formProps
  } = useRideRequestForm({
    onFindNowSuccess: (origin, destination) => {
      setRideOrigin(origin);
      setRideDestination(destination);
      startFindNowRef.current();
    },
  });

  const effectiveOrigin = rideOrigin ?? formOrigin;
  const effectiveDestination = rideDestination ?? formDestination;

  const resetRidePoints = useCallback(() => {
    setRideOrigin(null);
    setRideDestination(null);
  }, []);

  const formPropsWithReset = {
    ...formProps,
    onChangeFrom: (text: string) => {
      formProps.onChangeFrom(text);
      resetRidePoints();
    },
    onChangeTo: (text: string) => {
      formProps.onChangeTo(text);
      resetRidePoints();
    },
    onSelectFromSuggestion: (suggestion: PlaceSuggestion) => {
      formProps.onSelectFromSuggestion(suggestion);
      resetRidePoints();
    },
    onSelectSuggestion: (suggestion: PlaceSuggestion) => {
      formProps.onSelectSuggestion(suggestion);
      resetRidePoints();
    },
    onUseCurrentLocation: () => {
      void formProps.onUseCurrentLocation();
      resetRidePoints();
    },
  };

  return {
    location,
    effectiveOrigin,
    effectiveDestination,
    usingCurrentLocation,
    applyPickedPoint,
    formProps: formPropsWithReset,
    findNowLoading: formProps.findNowLoading,
    startFindNowRef,
  };
}

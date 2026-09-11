import { useCallback, useMemo, useRef, useState } from "react";
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
    onChangeFrom: formOnChangeFrom,
    onChangeTo: formOnChangeTo,
    onSelectFromSuggestion: formOnSelectFrom,
    onSelectSuggestion: formOnSelectTo,
    onUseCurrentLocation: formOnUseCurrentLocation,
    ...restFormProps
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

  const onChangeFrom = useCallback(
    (text: string) => {
      formOnChangeFrom(text);
      resetRidePoints();
    },
    [formOnChangeFrom, resetRidePoints],
  );

  const onChangeTo = useCallback(
    (text: string) => {
      formOnChangeTo(text);
      resetRidePoints();
    },
    [formOnChangeTo, resetRidePoints],
  );

  const onSelectFromSuggestion = useCallback(
    (suggestion: PlaceSuggestion) => {
      formOnSelectFrom(suggestion);
      resetRidePoints();
    },
    [formOnSelectFrom, resetRidePoints],
  );

  const onSelectSuggestion = useCallback(
    (suggestion: PlaceSuggestion) => {
      formOnSelectTo(suggestion);
      resetRidePoints();
    },
    [formOnSelectTo, resetRidePoints],
  );

  const onUseCurrentLocation = useCallback(() => {
    void formOnUseCurrentLocation();
    resetRidePoints();
  }, [formOnUseCurrentLocation, resetRidePoints]);

  const formPropsWithReset = useMemo(
    () => ({
      ...restFormProps,
      onChangeFrom,
      onChangeTo,
      onSelectFromSuggestion,
      onSelectSuggestion,
      onUseCurrentLocation,
    }),
    [
      restFormProps,
      onChangeFrom,
      onChangeTo,
      onSelectFromSuggestion,
      onSelectSuggestion,
      onUseCurrentLocation,
    ],
  );

  return {
    location,
    effectiveOrigin,
    effectiveDestination,
    usingCurrentLocation,
    applyPickedPoint,
    formProps: formPropsWithReset,
    findNowLoading: restFormProps.findNowLoading,
    startFindNowRef,
  };
}

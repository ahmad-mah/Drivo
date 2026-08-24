import { useMemo, useState } from "react";
import { useCurrentLocation } from "@/features/home/hooks/useCurrentLocation";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import type { PlaceSuggestion, RidePoint } from "../types/ride.types";
import { reverseGeocodeAddress } from "../utils/geocode";
import { usePickedRidePoints } from "./usePickedRidePoints";
import { useRidePlacesAutocomplete } from "./useRidePlacesAutocomplete";
import { useRideRequest } from "./useRideRequest";
import { useRideRequestSubmit } from "./useRideRequestSubmit";

interface UseRideRequestFormOptions {
  onFindNowSuccess?: (origin: RidePoint, destination: RidePoint) => void;
}

/**
 * Owns the ride-request field state: the From/To text, autocomplete wiring,
 * and the derived origin/destination points (current location, suggestion,
 * or map pin — pin wins as the user's explicit last action). Submission is
 * delegated to `useRideRequestSubmit`.
 */
export function useRideRequestForm(options?: UseRideRequestFormOptions) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const location = useCurrentLocation();
  const {
    pickedFrom,
    pickedTo,
    clearPickedFrom,
    clearPickedTo,
    applyPickedPoint,
  } = usePickedRidePoints();

  const {
    suggestions: fromSuggestions,
    loading: fromSuggestionsLoading,
    selected: selectedFrom,
    selectSuggestion: selectFrom,
  } = useRidePlacesAutocomplete(
    from,
    location?.coords.latitude,
    location?.coords.longitude,
  );
  const {
    suggestions,
    loading: suggestionsLoading,
    selected: selectedTo,
    selectSuggestion: selectTo,
  } = useRidePlacesAutocomplete(
    to,
    location?.coords.latitude,
    location?.coords.longitude,
  );
  const { submitting, error, submit } = useRideRequest();

  useErrorSnackbar(locationError);
  useErrorSnackbar(error);

  // Memoized on primitive fields — returning a fresh object each render made
  // consumers' effects (e.g. useDirections) refetch on every render and burn
  // the Google Routes quota with identical requests.
  const origin: RidePoint | null = useMemo(() => {
    if (pickedFrom) return pickedFrom;
    if (!location) return null;
    return usingCurrentLocation
      ? {
          address: from,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : selectedFrom ?? {
          address: from,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pickedFrom?.address,
    pickedFrom?.latitude,
    pickedFrom?.longitude,
    usingCurrentLocation,
    selectedFrom?.address,
    selectedFrom?.latitude,
    selectedFrom?.longitude,
    from,
    location?.coords.latitude,
    location?.coords.longitude,
  ]);

  const handleUseCurrentLocation = async () => {
    if (!location) return;
    clearPickedFrom();
    const address = await reverseGeocodeAddress(location);
    if (address) {
      setFrom(address);
      setUsingCurrentLocation(true);
    } else {
      setLocationError("Could not get your current location.");
    }
  };

  const handleChangeFrom = (text: string) => {
    setFrom(text);
    clearPickedFrom();
    setUsingCurrentLocation(false);
  };

  const handleSelectFromSuggestion = (suggestion: PlaceSuggestion) => {
    setFrom(suggestion.address);
    clearPickedFrom();
    setUsingCurrentLocation(false);
    selectFrom(suggestion);
  };

  const handleSelectToSuggestion = (suggestion: PlaceSuggestion) => {
    setTo(suggestion.address);
    clearPickedTo();
    selectTo(suggestion);
  };

  /** Commits a map-pin pick for one of the two fields and fills its text. */
  const applyPickAndFillText = (
    field: "from" | "to",
    point: RidePoint,
  ) => {
    applyPickedPoint(field, point);
    if (field === "from") {
      setFrom(point.address);
      setUsingCurrentLocation(false);
    } else {
      setTo(point.address);
    }
  };

  const { handleFindNow } = useRideRequestSubmit(
    { onFindNowSuccess: options?.onFindNowSuccess },
    {
      location,
      from,
      to,
      origin,
      selectedTo,
      pickedTo,
      suggestions,
      selectTo,
      setLocationError,
      submit,
    },
  );

  return {
    location,
    from,
    to,
    onChangeFrom: handleChangeFrom,
    onChangeTo: (text: string) => {
      clearPickedTo();
      setTo(text);
    },
    onUseCurrentLocation: handleUseCurrentLocation,
    fromSuggestions: usingCurrentLocation ? [] : fromSuggestions,
    fromSuggestionsLoading,
    onSelectFromSuggestion: handleSelectFromSuggestion,
    suggestions,
    suggestionsLoading,
    onSelectSuggestion: handleSelectToSuggestion,
    onFindNow: handleFindNow,
    findNowLoading: submitting,
    usingCurrentLocation,
    applyPickedPoint: applyPickAndFillText,
    origin,
    // A map pin beats autocomplete — it was the user's explicit last action.
    destination:
      pickedTo ??
      selectedTo ??
      (to.trim() && suggestions.length > 0 ? suggestions[0] : null),
  };
}

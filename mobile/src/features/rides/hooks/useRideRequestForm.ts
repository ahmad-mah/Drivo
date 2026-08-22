import { useState } from "react";
import { useCurrentLocation } from "@/features/home/hooks/useCurrentLocation";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import type { PlaceSuggestion, RidePoint } from "../types/ride.types";
import { reverseGeocodeAddress } from "../utils/geocode";
import { useRidePlacesAutocomplete } from "./useRidePlacesAutocomplete";
import { useRideRequest } from "./useRideRequest";

interface UseRideRequestFormOptions {
  onFindNowSuccess?: (origin: RidePoint, destination: RidePoint) => void;
}

export function useRideRequestForm(options?: UseRideRequestFormOptions) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const location = useCurrentLocation();

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

  const buildOrigin = (): RidePoint | null => {
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
  };

  const buildPoints = (
    fallbackDestination: PlaceSuggestion | null = null,
  ): { origin: RidePoint; destination: RidePoint } | null => {
    const destination = selectedTo ?? fallbackDestination;
    const origin = buildOrigin();
    if (!origin || !destination) return null;
    return {
      origin,
      destination: {
        address: destination.address,
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
    };
  };

  const completeRequest = async (points: {
    origin: RidePoint;
    destination: RidePoint;
  }) => {
    if (options?.onFindNowSuccess) {
      options.onFindNowSuccess(points.origin, points.destination);
      return;
    }
    await submit(points.origin, points.destination);
  };

  const handleUseCurrentLocation = async () => {
    if (!location) return;
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
    setUsingCurrentLocation(false);
  };

  const handleSelectFromSuggestion = (suggestion: PlaceSuggestion) => {
    setFrom(suggestion.address);
    setUsingCurrentLocation(false);
    selectFrom(suggestion);
  };

  const handleSelectToSuggestion = (suggestion: PlaceSuggestion) => {
    setTo(suggestion.address);
    selectTo(suggestion);
  };

  const handleFindNow = async () => {
    if (!location) {
      setLocationError("Could not get your current location.");
      return;
    }
    if (!from.trim()) {
      setLocationError("Enter your pickup location.");
      return;
    }
    if (!to.trim()) {
      setLocationError("Enter your destination.");
      return;
    }
    if (!selectedTo) {
      // If the user typed a destination and there's a matching suggestion, fallback to first suggestion
      if (suggestions.length === 0) {
        setLocationError("Choose a destination from the suggestions.");
        return;
      }
      selectTo(suggestions[0]);
      const points = buildPoints(suggestions[0]);
      if (points) await completeRequest(points);
      return;
    }

    const points = buildPoints();
    if (points) await completeRequest(points);
  };

  return {
    location,
    from,
    to,
    onChangeFrom: handleChangeFrom,
    onChangeTo: setTo,
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
    origin: buildOrigin(),
    // Preview the top suggestion while typing so the map follows the new
    // address before the user commits to a pick (selection still wins).
    destination:
      selectedTo ??
      (to.trim() && suggestions.length > 0 ? suggestions[0] : null),
  };
}
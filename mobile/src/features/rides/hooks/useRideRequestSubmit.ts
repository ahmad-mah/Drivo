import { useCallback } from "react";
import type { PlaceSuggestion, RidePoint } from "../types/ride.types";

interface UseRideRequestSubmitOptions {
  onFindNowSuccess?: (origin: RidePoint, destination: RidePoint) => void;
}

interface RideFormSnapshot {
  location: { coords: { latitude: number; longitude: number } } | null;
  from: string;
  to: string;
  origin: RidePoint | null;
  selectedTo: PlaceSuggestion | null;
  pickedTo: RidePoint | null;
  suggestions: PlaceSuggestion[];
  selectTo: (suggestion: PlaceSuggestion) => void;
  setLocationError: (message: string | null) => void;
  submit: (
    origin: RidePoint,
    destination: RidePoint,
    onSuccess?: () => void,
  ) => Promise<unknown>;
}

/**
 * The Find-now workflow: validates the form snapshot, resolves the
 * destination (map pin → committed suggestion → top-suggestion fallback),
 * and hands the resolved points to the success callback or direct submit.
 */
export function useRideRequestSubmit(
  options: UseRideRequestSubmitOptions,
  snapshot: RideFormSnapshot,
) {
  const buildPoints = (
    fallbackDestination: PlaceSuggestion | null = null,
  ): { origin: RidePoint; destination: RidePoint } | null => {
    const destination =
      snapshot.pickedTo ?? snapshot.selectedTo ?? fallbackDestination;
    if (!snapshot.origin || !destination) return null;
    return {
      origin: snapshot.origin,
      destination: {
        address: destination.address,
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
    };
  };

  const completeRequest = useCallback(
    async (points: { origin: RidePoint; destination: RidePoint }) => {
      if (options.onFindNowSuccess) {
        options.onFindNowSuccess(points.origin, points.destination);
        return;
      }
      await snapshot.submit(points.origin, points.destination);
    },
    [options, snapshot],
  );

  const handleFindNow = async () => {
    if (!snapshot.location) {
      snapshot.setLocationError("Could not get your current location.");
      return;
    }
    if (!snapshot.from.trim()) {
      snapshot.setLocationError("Enter your pickup location.");
      return;
    }
    if (!snapshot.to.trim()) {
      snapshot.setLocationError("Enter your destination.");
      return;
    }
    // A map pin is an explicit choice — it wins over typed-text fallbacks and
    // needs no suggestion match to be accepted.
    if (!snapshot.selectedTo && !snapshot.pickedTo) {
      // If the user typed a destination and there's a matching suggestion, fallback to first suggestion
      if (snapshot.suggestions.length === 0) {
        snapshot.setLocationError("Choose a destination from the suggestions.");
        return;
      }
      snapshot.selectTo(snapshot.suggestions[0]);
      const points = buildPoints(snapshot.suggestions[0]);
      if (points) await completeRequest(points);
      return;
    }

    const points = buildPoints();
    if (points) await completeRequest(points);
  };

  return { handleFindNow };
}

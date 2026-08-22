import { useCallback, useEffect, useState } from "react";
import * as placesApi from "@/api/places/places.api";
import type { PlaceSuggestion } from "../types/ride.types";

const DEBOUNCE_MS = 350;

/**
 * Debounced Google Places autocomplete for the destination field, biased to
 * the rider's current position. Returns the fetched suggestions plus the
 * suggestion the user picked (a ride cannot be requested without one).
 */
export function useRidePlacesAutocomplete(
  query: string,
  latitude?: number,
  longitude?: number,
) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PlaceSuggestion | null>(null);

  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;

  useEffect(() => {
    if (!hasQuery) {
      // A request cancelled mid-flight never reaches its `finally`, so force
      // loading off instead of leaving the spinner stuck on the next query.
      void Promise.resolve().then(() => setLoading(false));
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await placesApi.searchPlacesAutocomplete(
          trimmed,
          latitude,
          longitude,
        );
        if (cancelled) return;
        setSuggestions(result);
      } catch {
        if (cancelled) return;
        setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hasQuery, trimmed, latitude, longitude]);

  const selectSuggestion = useCallback((suggestion: PlaceSuggestion) => {
    setSelected(suggestion);
    setSuggestions([]);
  }, []);

  // Stale suggestions from a previous query stay hidden once the field clears,
  // and a picked suggestion only counts while its address still matches the
  // input — editing the text invalidates the pick without a state write.
  return {
    suggestions: hasQuery ? suggestions : [],
    loading,
    selected: hasQuery && selected?.address === trimmed ? selected : null,
    selectSuggestion,
  };
}
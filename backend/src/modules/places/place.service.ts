import { env } from "../../config/env";
import type { PlaceSuggestion } from "./place.types";

const PLACES_URL = "https://places.googleapis.com/v1/places:searchText";

/**
 * Proxies a text search to the Google Places API so the API key never ships in
 * the mobile bundle. `locationBias` is a 25km circle around the rider so
 * suggestions prefer their area. Field-masked to only what the app renders.
 */
export async function searchPlaces(
  query: string,
  latitude?: number,
  longitude?: number,
): Promise<PlaceSuggestion[]> {
  if (!env.GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }

  const body: Record<string, unknown> = {
    textQuery: query,
    pageSize: 5,
  };
  if (latitude !== undefined && longitude !== undefined) {
    body.locationBias = {
      circle: { center: { latitude, longitude }, radius: 25000 },
    };
  }

  const response = await fetch(PLACES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask":
        "places.displayName.text,places.formattedAddress,places.location",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Places API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    places?: Array<{
      formattedAddress?: string;
      displayName?: { text?: string };
      location?: { latitude?: number; longitude?: number };
    }>;
  };

  return (data.places ?? [])
    .map((place) => ({
      address: place.formattedAddress || place.displayName?.text || "",
      latitude: place.location?.latitude,
      longitude: place.location?.longitude,
    }))
    .filter(
      (s): s is PlaceSuggestion =>
        s.address.length > 0 &&
        s.latitude !== undefined &&
        s.longitude !== undefined,
    );
}
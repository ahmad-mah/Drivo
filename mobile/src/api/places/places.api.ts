import { apiClient } from "../client";
import type { ApiResponse } from "../types";
import type { PlaceSuggestion } from "@/features/rides/types/ride.types";

export async function searchPlacesAutocomplete(
  query: string,
  latitude?: number,
  longitude?: number,
) {
  const { data } = await apiClient.get<ApiResponse<PlaceSuggestion[]>>(
    "/api/places/autocomplete",
    {
      params: {
        q: query,
        ...(latitude !== undefined ? { lat: latitude } : {}),
        ...(longitude !== undefined ? { lng: longitude } : {}),
      },
    },
  );
  return data.data;
}

import { apiClient } from "../client";
import type { ApiResponse } from "../types";
import type { RidePoint, RouteCoordinate } from "@/features/rides/types/ride.types";

export async function fetchDirections(
  from: RidePoint,
  to: RidePoint,
): Promise<RouteCoordinate[]> {
  const { data } = await apiClient.get<ApiResponse<RouteCoordinate[]>>(
    "/api/directions",
    {
      params: {
        fromLat: from.latitude,
        fromLng: from.longitude,
        toLat: to.latitude,
        toLng: to.longitude,
      },
    },
  );
  return data.data;
}

/** Real-time driving ETA in minutes from `from` to `to`. */
export async function fetchRouteDuration(
  from: RidePoint,
  to: RidePoint,
): Promise<number> {
  const { data } = await apiClient.get<
    ApiResponse<{ durationMinutes: number }>
  >("/api/directions/eta", {
    params: {
      fromLat: from.latitude,
      fromLng: from.longitude,
      toLat: to.latitude,
      toLng: to.longitude,
    },
  });
  return data.data.durationMinutes;
}
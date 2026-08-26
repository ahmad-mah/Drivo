import { apiClient } from "../client";
import type { ApiResponse } from "../types";
import { RideStatus } from "@/features/rides/enums/RideStatus";
import type { Ride, RidePoint } from "@/features/rides/types/ride.types";

export { RideStatus };

export interface RequestRideDto {
  origin: RidePoint;
  destination: RidePoint;
}

export async function requestRide(dto: RequestRideDto) {
  const { data } = await apiClient.post<ApiResponse<Ride>>(
    "/api/rides/request",
    dto,
  );
  return data.data;
}

/** The poll target for the rider's searching screen. */
export async function getActiveRide() {
  const { data } = await apiClient.get<ApiResponse<Ride>>(
    "/api/rides/me/active",
  );
  return data.data;
}

export async function cancelRide(rideId: string) {
  const { data } = await apiClient.delete<ApiResponse<Ride>>(
    `/api/rides/${rideId}/cancel`,
  );
  return data.data;
}

/** Home preview — the few most recent rides. */
export async function getRecentRides(limit = 3) {
  const { data } = await apiClient.get<ApiResponse<Ride[]>>(
    "/api/rides/recent",
    { params: { limit } },
  );
  return data.data;
}

/** Full paginated history (completions + cancellations). */
export async function getRideHistory(limit = 20, offset = 0) {
  const { data } = await apiClient.get<ApiResponse<Ride[]>>(
    "/api/rides/history",
    { params: { limit, offset } },
  );
  return data.data;
}

/** Rider rates the driver on a completed ride (stars + optional comment). */
export async function rateRide(
  rideId: string,
  dto: { stars: number; comment?: string },
) {
  const { data } = await apiClient.post<ApiResponse<Ride>>(
    `/api/rides/${rideId}/rate`,
    dto,
  );
  return data.data;
}

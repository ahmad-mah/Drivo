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

export async function getRecentRides() {
  const { data } = await apiClient.get<ApiResponse<Ride[]>>(
    "/api/rides/recent",
  );
  return data.data;
}

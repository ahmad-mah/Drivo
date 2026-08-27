import { apiClient } from "../client";
import type { ApiResponse } from "../types";
import { ApiError } from "@/errors";
import type { Ride } from "@/features/rides/types/ride.types";

/**
 * Driver-perspective ride actions: dispatch responses and the trip
 * lifecycle. Kept separate from profile/availability concerns in
 * `drivers.api.ts` — these all target the rides domain.
 */

/** Claims the ride; 409 when the offer or ride already resolved. */
export async function acceptRideRequest(rideId: string) {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/api/rides/${rideId}/accept`,
  );
  return data.data;
}

/** Declines the offer; the dispatcher escalates to the next-nearest driver. */
export async function rejectRideRequest(rideId: string) {
  await apiClient.post(`/api/rides/${rideId}/reject`);
}

/** The driver's active trip (ACCEPTED/ARRIVED/IN_PROGRESS), null when free. */
export async function fetchDriverActiveTrip(): Promise<Ride | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<Ride>>(
      "/api/rides/driver/active",
    );
    return data.data;
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) return null;
    throw err;
  }
}

/** ACCEPTED → ARRIVED. */
export async function arriveAtPickup(rideId: string) {
  const { data } = await apiClient.post<ApiResponse<Ride>>(
    `/api/rides/${rideId}/arrive`,
  );
  return data.data;
}

/** ARRIVED → IN_PROGRESS. */
export async function startTrip(rideId: string) {
  const { data } = await apiClient.post<ApiResponse<Ride>>(
    `/api/rides/${rideId}/start`,
  );
  return data.data;
}

/** IN_PROGRESS → COMPLETED. */
export async function completeTrip(rideId: string) {
  const { data } = await apiClient.post<ApiResponse<Ride>>(
    `/api/rides/${rideId}/complete`,
  );
  return data.data;
}

/** Driver cancel: pre-trip re-dispatches, mid-trip aborts the ride. */
export async function cancelTripAsDriver(rideId: string) {
  const { data } = await apiClient.post<ApiResponse<Ride>>(
    `/api/rides/${rideId}/driver-cancel`,
  );
  return data.data;
}

/** No-show: the wait window elapsed with nobody at pickup (ARRIVED → CANCELLED). */
export async function markRiderNoShow(rideId: string) {
  const { data } = await apiClient.post<ApiResponse<Ride>>(
    `/api/rides/${rideId}/no-show`,
  );
  return data.data;
}

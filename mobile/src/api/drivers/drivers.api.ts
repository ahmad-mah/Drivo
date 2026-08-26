import { apiClient } from "../client";
import type { ApiResponse } from "../types";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";
import { VehicleType } from "@/features/drivers/enums/VehicleType";
import type { NearbyDriver } from "@/features/rides/types/ride.types";

export { DriverApprovalStatus, VehicleType };

export interface DriverProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehicleColor: string;
  seats: number;
  vehiclePlate: string;
  licenseNumber: string;
  approvalStatus: DriverApprovalStatus;
  rejectionReason: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyDriverDto {
  vehicleType: VehicleType;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  licenseNumber: string;
}

export async function getMyDriverApplication() {
  const { data } = await apiClient.get<ApiResponse<DriverProfile>>(
    "/api/drivers/my-application",
  );
  return data.data;
}

export async function applyDriver(dto: ApplyDriverDto) {
  const { data } = await apiClient.post<ApiResponse<DriverProfile>>(
    "/api/drivers/apply",
    dto,
  );
  return data.data;
}

export async function updateDriverApplication(dto: ApplyDriverDto) {
  const { data } = await apiClient.put<ApiResponse<DriverProfile>>(
    "/api/drivers/my-application",
    dto,
  );
  return data.data;
}

export interface DriverAvailabilityResult {
  isOnline: boolean;
  error?: string;
}

/** REST fallback for going online/offline (background tasks can't hold a socket). */
export async function updateAvailability(isOnline: boolean) {
  const { data } = await apiClient.put<ApiResponse<DriverAvailabilityResult>>(
    "/api/drivers/availability",
    { isOnline },
  );
  return data.data;
}

/** REST fallback for reporting a position while the app is backgrounded. */
export async function sendLocation(
  latitude: number,
  longitude: number,
  heading?: number,
) {
  await apiClient.post("/api/drivers/location", {
    latitude,
    longitude,
    ...(heading !== undefined && { heading }),
  });
}

export async function fetchNearbyDrivers(
  latitude: number,
  longitude: number,
  radiusKm = 1,
): Promise<NearbyDriver[]> {
  const { data } = await apiClient.get<ApiResponse<NearbyDriver[]>>(
    "/api/drivers/nearby",
    {
      params: { lat: latitude, lng: longitude, radiusKm },
    },
  );
  return data.data;
}

/** Ride request pushed to a driver over the socket (ride:new-request). */
export interface IncomingRideRequest {
  rideId: string;
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;
  tripDistanceKm: number;
  fare: number;
  currency: string;
  etaMinutes: number;
  /** Response window in seconds from receipt — derive the deadline locally
   *  instead of comparing an absolute epoch against the device clock. */
  respondWithinSeconds: number;
}

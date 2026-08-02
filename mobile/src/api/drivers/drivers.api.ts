import { apiClient } from "../client";
import type { ApiResponse } from "../types";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";
import { VehicleType } from "@/features/drivers/enums/VehicleType";

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
  vehiclePlate: string;
  licenseNumber: string;
  approvalStatus: DriverApprovalStatus;
  rejectionReason: string | null;
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

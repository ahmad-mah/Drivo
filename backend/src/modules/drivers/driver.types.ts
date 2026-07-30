import type { ApprovalStatus } from "@prisma/client";

export interface CreateDriverDto {
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  licenseNumber: string;
}

export interface DriverResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  licenseNumber: string;
  approvalStatus: ApprovalStatus;
  rejectionReason: string | null;
}

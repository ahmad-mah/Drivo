export const DriverApprovalStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type DriverApprovalStatus =
  (typeof DriverApprovalStatus)[keyof typeof DriverApprovalStatus];

export interface AdminDriver {
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
  approvalStatus: DriverApprovalStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
  };
}

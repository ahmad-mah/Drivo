export const DriverApprovalStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type DriverApprovalStatus =
  (typeof DriverApprovalStatus)[keyof typeof DriverApprovalStatus];

/** Shape of the admin `drivers:locations` socket snapshot / `GET /live` payload. */
export interface LiveDriver {
  id: string;
  firstName: string;
  lastName: string;
  latitude: number | null;
  longitude: number | null;
  lastSeenAt: string | null;
  vehicleType: string;
  email: string;
}

export interface AdminDriver {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleColor: string;
  seats: number;
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

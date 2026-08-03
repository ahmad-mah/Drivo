import {
  DriverApprovalStatus,
  type DriverApprovalStatus as Status,
} from "../types/driver";

export const DRIVER_STATUS_FILTERS: {
  label: string;
  value: Status | undefined;
}[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: DriverApprovalStatus.PENDING },
  { label: "Approved", value: DriverApprovalStatus.APPROVED },
  { label: "Rejected", value: DriverApprovalStatus.REJECTED },
  { label: "Suspended", value: DriverApprovalStatus.SUSPENDED },
];

import type { DriverProfile } from "@/api/drivers/drivers.api";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";

type StatusConfig = {
  label: string;
  description: string;
  color: string;
  bg: string;
  icon: string;
};

export const driverStatusConfig: Record<
  DriverProfile["approvalStatus"],
  StatusConfig
> = {
  [DriverApprovalStatus.PENDING]: {
    label: "Application Under Review",
    description: "We're reviewing your details — you'll hear back soon.",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    icon: "🕐",
  },
  [DriverApprovalStatus.APPROVED]: {
    label: "Driver Approved",
    description: "You're approved to drive with Drivo.",
    color: "text-green-700",
    bg: "bg-green-50",
    icon: "✅",
  },
  [DriverApprovalStatus.REJECTED]: {
    label: "Application Rejected",
    description: "Update your details and re-apply.",
    color: "text-red-700",
    bg: "bg-red-50",
    icon: "❌",
  },
  [DriverApprovalStatus.SUSPENDED]: {
    label: "Account Suspended",
    description: "Contact support for more information.",
    color: "text-orange-700",
    bg: "bg-orange-50",
    icon: "⚠️",
  },
};

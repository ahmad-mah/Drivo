import type { DriverApprovalStatus as Status } from "../types/driver";
import { DriverApprovalStatus } from "../types/driver";

const statusStyles: Record<Status, string> = {
  [DriverApprovalStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [DriverApprovalStatus.APPROVED]: "bg-green-100 text-green-800",
  [DriverApprovalStatus.REJECTED]: "bg-red-100 text-red-800",
  [DriverApprovalStatus.SUSPENDED]: "bg-orange-100 text-orange-800",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status.toLowerCase()}
    </span>
  );
}

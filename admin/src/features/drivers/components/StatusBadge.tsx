import type { DriverApprovalStatus as Status } from "../types/driver";
import { DriverApprovalStatus } from "../types/driver";

const statusStyles: Record<Status, string> = {
  [DriverApprovalStatus.PENDING]: "bg-status-warning/10 text-status-warning",
  [DriverApprovalStatus.APPROVED]: "bg-status-success/10 text-status-success",
  [DriverApprovalStatus.REJECTED]: "bg-status-danger/10 text-status-danger",
  [DriverApprovalStatus.SUSPENDED]: "bg-orange-500/10 text-orange-400",
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
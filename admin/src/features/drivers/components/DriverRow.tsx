import type { AdminDriver } from "../types/driver";
import { DriverApprovalStatus } from "../types/driver";
import { formatDate, getDriverName } from "../utils/driver";
import { ActionButton } from "./ActionButton";
import { StatusBadge } from "./StatusBadge";

export interface DriverRowProps {
  driver: AdminDriver;
  disabled: boolean;
  onView: (driver: AdminDriver) => void;
  onApprove: (id: string) => void;
  onReject: (driver: AdminDriver) => void;
  onSuspend: (id: string) => void;
  onReinstate: (id: string) => void;
}

export function DriverRow({
  driver,
  disabled,
  onView,
  onApprove,
  onReject,
  onSuspend,
  onReinstate,
}: DriverRowProps) {
  const status = driver.approvalStatus;

  return (
    <tr
      onClick={() => onView(driver)}
      className="group border-b border-border-subtle last:border-0 cursor-pointer"
    >
      <td className="py-4 ps-6 pe-4">
        <div className="font-medium text-gray-900 group-hover:text-blue-600">
          {getDriverName(driver)}
        </div>
        <div className="text-sm text-gray-500">{driver.user.email}</div>
      </td>
      <td className="py-4 pe-4 text-sm text-text-secondary">{driver.phone}</td>
      <td className="py-4 pe-4">
        <div className="text-sm text-text-primary">
          {driver.vehicleType} · {driver.vehicleModel}
        </div>
        <div className="text-sm text-text-secondary">
          {driver.vehicleColor} · {driver.vehiclePlate}
        </div>
      </td>
      <td className="py-4 pe-4 text-sm text-text-secondary">{driver.licenseNumber}</td>
      <td className="py-4 pe-4 text-sm text-text-muted">
        {formatDate(driver.createdAt)}
      </td>
      <td className="py-4 pe-4">
        <StatusBadge status={status} />
      </td>
      <td className="py-4 pe-6 text-end">
        <div
          className="flex justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {status === DriverApprovalStatus.PENDING && (
            <>
              <ActionButton
                label="Approve"
                variant="primary"
                disabled={disabled}
                onClick={() => onApprove(driver.id)}
              />
              <ActionButton
                label="Reject"
                variant="danger"
                disabled={disabled}
                onClick={() => onReject(driver)}
              />
            </>
          )}
          {status === DriverApprovalStatus.APPROVED && (
            <ActionButton
              label="Suspend"
              variant="warning"
              disabled={disabled}
              onClick={() => onSuspend(driver.id)}
            />
          )}
          {status === DriverApprovalStatus.SUSPENDED && (
            <ActionButton
              label="Reinstate"
              variant="outline"
              disabled={disabled}
              onClick={() => onReinstate(driver.id)}
            />
          )}
        </div>
        {driver.rejectionReason && status === DriverApprovalStatus.REJECTED && (
          <div className="mt-1 text-xs text-status-danger">
            Reason: {driver.rejectionReason}
          </div>
        )}
      </td>
    </tr>
  );
}

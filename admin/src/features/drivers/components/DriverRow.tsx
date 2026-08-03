import type { AdminDriver } from "../types/driver";
import { DriverApprovalStatus } from "../types/driver";
import { formatDate, getDriverName } from "../utils/driver";
import { ActionButton } from "./ActionButton";
import { StatusBadge } from "./StatusBadge";

export interface DriverRowProps {
  driver: AdminDriver;
  disabled: boolean;
  onApprove: (id: string) => void;
  onReject: (driver: AdminDriver) => void;
  onSuspend: (id: string) => void;
  onReinstate: (id: string) => void;
}

export function DriverRow({
  driver,
  disabled,
  onApprove,
  onReject,
  onSuspend,
  onReinstate,
}: DriverRowProps) {
  const status = driver.approvalStatus;

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-4 ps-6 pe-4">
        <div className="font-medium text-gray-900">{getDriverName(driver)}</div>
        <div className="text-sm text-gray-500">{driver.user.email}</div>
      </td>
      <td className="py-4 pe-4 text-sm text-gray-600">{driver.phone}</td>
      <td className="py-4 pe-4">
        <div className="text-sm text-gray-800">
          {driver.vehicleType} · {driver.vehicleModel}
        </div>
        <div className="text-sm text-gray-500">
          {driver.vehicleColor} · {driver.vehiclePlate}
        </div>
      </td>
      <td className="py-4 pe-4 text-sm text-gray-600">{driver.licenseNumber}</td>
      <td className="py-4 pe-4 text-sm text-gray-500">
        {formatDate(driver.createdAt)}
      </td>
      <td className="py-4 pe-4">
        <StatusBadge status={status} />
      </td>
      <td className="py-4 pe-6 text-right">
        <div className="flex justify-end gap-2">
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
          <div className="mt-1 text-xs text-red-600">
            Reason: {driver.rejectionReason}
          </div>
        )}
      </td>
    </tr>
  );
}

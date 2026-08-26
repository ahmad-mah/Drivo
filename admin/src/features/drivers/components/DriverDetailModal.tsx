import {
  DriverApprovalStatus,
  type AdminDriver,
} from "../types/driver";
import { formatDate, getDriverName } from "../utils/driver";
import { ActionButton, type ActionButtonVariant } from "./ActionButton";
import { DetailSection } from "./DetailSection";
import { StatusBadge } from "./StatusBadge";

interface DriverDetailModalProps {
  driver: AdminDriver;
  loading: boolean;
  busy: boolean;
  onClose: () => void;
  onApprove: (id: string) => void | Promise<void>;
  onReject: (driver: AdminDriver) => void;
  onSuspend: (id: string) => void | Promise<void>;
  onReinstate: (id: string) => void | Promise<void>;
  onStatusChanged: () => void;
}

interface StatusAction {
  label: string;
  variant: ActionButtonVariant;
  onClick: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 text-end">{value}</dd>
    </div>
  );
}

export function DriverDetailModal({
  driver,
  loading,
  busy,
  onClose,
  onApprove,
  onReject,
  onSuspend,
  onReinstate,
  onStatusChanged,
}: DriverDetailModalProps) {
  const status = driver.approvalStatus;
  const name = getDriverName(driver);

  // Direct actions refresh the modal detail after the action settles so the
  // displayed status/buttons match the persisted state. Reject is excluded:
  // it only opens the reason modal here — the refresh runs after its confirm.
  const runAction = async (action: () => void | Promise<void>) => {
    await action();
    onStatusChanged();
  };

  const statusActions: Record<DriverApprovalStatus, StatusAction[]> = {
    [DriverApprovalStatus.PENDING]: [
      {
        label: "Reject",
        variant: "danger",
        onClick: () => onReject(driver),
      },
      {
        label: "Approve",
        variant: "primary",
        onClick: () => runAction(() => onApprove(driver.id)),
      },
    ],
    [DriverApprovalStatus.APPROVED]: [
      {
        label: "Suspend",
        variant: "warning",
        onClick: () => runAction(() => onSuspend(driver.id)),
      },
    ],
    [DriverApprovalStatus.SUSPENDED]: [
      {
        label: "Reinstate",
        variant: "outline",
        onClick: () => runAction(() => onReinstate(driver.id)),
      },
    ],
    [DriverApprovalStatus.REJECTED]: [],
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${name}'s driver profile`}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{name}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{driver.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Loading driver details…
            </p>
          ) : (
            <>
              <DetailSection title="Vehicle">
                <dl>
                  <DetailRow label="Type" value={driver.vehicleType} />
                  <DetailRow label="Model" value={driver.vehicleModel} />
                  <DetailRow label="Color" value={driver.vehicleColor} />
                  <DetailRow label="Seats" value={String(driver.seats)} />
                  <DetailRow label="Plate" value={driver.vehiclePlate} />
                  <DetailRow label="License" value={driver.licenseNumber} />
                </dl>
              </DetailSection>

              <DetailSection title="Personal">
                <dl>
                  <DetailRow label="Phone" value={driver.phone} />
                  <DetailRow label="Submitted" value={formatDate(driver.createdAt)} />
                  <DetailRow label="Updated" value={formatDate(driver.updatedAt)} />
                </dl>
              </DetailSection>

              {driver.rejectionReason && (
                <DetailSection title="Rejection">
                  <p className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {driver.rejectionReason}
                  </p>
                </DetailSection>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 p-6 pt-4">
          {statusActions[status].map(({ label, variant, onClick }) => (
            <ActionButton
              key={label}
              label={label}
              variant={variant}
              disabled={busy || loading}
              onClick={onClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

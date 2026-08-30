import { useQuery } from "@tanstack/react-query";
import { X, Car } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDriver } from "../api/admin-drivers.api";

interface Props {
  driverId: string;
  onClose: () => void;
}

const approvalConfig: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-status-warning/10", text: "text-status-warning" },
  APPROVED: { bg: "bg-status-success/10", text: "text-status-success" },
  REJECTED: { bg: "bg-status-danger/10", text: "text-status-danger" },
  SUSPENDED: { bg: "bg-orange-500/10", text: "text-orange-400" },
};

export function DriverDetailModal({ driverId, onClose }: Props) {
  const { t } = useTranslation();
  const { data: driver, isLoading } = useQuery({
    queryKey: ["admin", "driver", driverId],
    queryFn: () => getDriver(driverId),
  });

  const ac =
    approvalConfig[driver?.approvalStatus ?? ""] ?? approvalConfig.PENDING;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-0 animate-scale-in">
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
              <Car className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                {driver?.firstName ?? t("drivers.title", "Driver")} {driver?.lastName ?? ""}
              </h3>
              <p className="font-mono text-xs text-text-muted">{driverId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors duration-200 hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : driver ? (
          <div className="space-y-4 px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ac.bg} ${ac.text}`}
              >
                {t(`driverStatus.${driver.approvalStatus}`, driver.approvalStatus)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.detail.phone", "Phone")}
                </p>
                <p className="mt-1 text-sm text-text-primary">{driver.phone}</p>
              </div>
              <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.detail.email", "Email")}
                </p>
                <p className="mt-1 text-sm text-text-primary">
                  {driver.user.email}
                </p>
              </div>
              <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.detail.vehicle", "Vehicle")}
                </p>
                <p className="mt-1 text-sm text-text-primary">
                  {driver.vehicleType} {driver.vehicleModel}
                </p>
              </div>
              <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.detail.color", "Color")}
                </p>
                <p className="mt-1 text-sm text-text-primary">
                  {driver.vehicleColor}
                </p>
              </div>
              <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.detail.plate", "Plate")}
                </p>
                <p className="mt-1 font-mono text-sm text-text-primary">
                  {driver.vehiclePlate}
                </p>
              </div>
              <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.detail.license", "License")}
                </p>
                <p className="mt-1 text-sm text-text-primary">
                  {driver.licenseNumber}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-bg-tertiary px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {t("drivers.detail.memberSince", "Member Since")}
              </p>
              <p className="mt-1 text-sm text-text-primary">
                {new Date(driver.createdAt).toLocaleDateString()}
              </p>
            </div>

            {driver.rejectionReason && (
              <div className="rounded-xl bg-status-danger/5 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-status-danger">
                  {t("drivers.detail.rejectionReason", "Rejection Reason")}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {driver.rejectionReason}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Car className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-2 text-sm text-text-muted">{t("drivers.notFound", "Driver not found")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

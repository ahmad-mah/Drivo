import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAdminDrivers } from "../hooks/useAdminDrivers";
import { DriverDetailModal } from "./DriverDetailModal";
import { Eye, UserCheck, UserX, Car } from "lucide-react";
import type { DriverApprovalStatus } from "../types/driver";

const approvalConfig: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-status-warning/10", text: "text-status-warning" },
  APPROVED: { bg: "bg-status-success/10", text: "text-status-success" },
  REJECTED: { bg: "bg-status-danger/10", text: "text-status-danger" },
  SUSPENDED: { bg: "bg-orange-500/10", text: "text-orange-400" },
};

const approvalValues: Array<"" | DriverApprovalStatus> = [
  "",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
];

export function DriversDashboardScreen() {
  const { t } = useTranslation();
  const { drivers, loading, status, setStatus, approve, reject } =
    useAdminDrivers();
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleApproval = async (driverId: string, approveAction: boolean) => {
    if (approveAction) {
      await approve(driverId);
    } else {
      await reject(driverId, t("drivers.rejectionViaPanel", "Rejected via admin panel"));
    }
    queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
  };

  return (
    <div className="space-y-5">
      <div className="animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
            <Car className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              {t("drivers.title", "Drivers")}
            </h2>
            <p className="text-xs text-text-muted">
              {drivers.length} {t("drivers.totalDrivers", "total drivers")}
            </p>
          </div>
        </div>
      </div>

      <div className="glass animate-slide-up stagger-1 flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <Car className="h-4 w-4 text-text-muted" />
        <select
          value={status ?? ""}
          onChange={(e) =>
            setStatus((e.target.value || undefined) as DriverApprovalStatus)
          }
          className="rounded-xl border border-border-default bg-bg-glass px-3 py-2 text-sm text-text-primary transition-colors duration-200 hover:border-border-strong focus:border-brand-500 focus:outline-none focus-ring"
        >
          {approvalValues.map((value) => (
            <option key={value} value={value} className="bg-bg-primary">
              {value === ""
                ? t("drivers.allApprovals", "All Approvals")
                : t(`driverStatus.${value}`, value)}
            </option>
          ))}
        </select>
      </div>

      <div className="glass animate-slide-up stagger-2 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.table.driver", "Driver")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.table.phone", "Phone")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.table.vehicle", "Vehicle")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.table.approval", "Approval")}
                </th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("drivers.table.actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <p className="text-sm text-text-muted">
                        {t("common.loading", "Loading...")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Car className="mx-auto h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-sm text-text-muted">
                      {t("drivers.empty", "No drivers found")}
                    </p>
                  </td>
                </tr>
              ) : (
                drivers.map((driver, i) => {
                  const ac =
                    approvalConfig[driver.approvalStatus] ??
                    approvalConfig.PENDING;
                  return (
                    <tr
                      key={driver.id}
                      className={`animate-fade-in transition-colors duration-150 hover:bg-bg-tertiary ${i < 10 ? `stagger-${i + 1}` : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-xs font-bold text-brand-400">
                            {(
                              driver.firstName?.[0] ?? "D"
                            ).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-text-primary">
                              {driver.firstName} {driver.lastName}
                            </span>
                            <p className="text-xs text-text-muted">
                              {driver.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {driver.phone}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {driver.vehicleType} — {driver.vehicleModel}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ac.bg} ${ac.text}`}
                        >
                          {t(`driverStatus.${driver.approvalStatus}`, driver.approvalStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="flex items-center justify-end gap-2">
                          {driver.approvalStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApproval(driver.id, true)
                                }
                                aria-label={t("drivers.actions.approve", "Approve")}
                                className="inline-flex items-center gap-1 rounded-lg bg-status-success/10 px-3 py-1.5 text-xs font-medium text-status-success transition-all duration-200 hover:bg-status-success/20"
                              >
                                <UserCheck className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() =>
                                  handleApproval(driver.id, false)
                                }
                                aria-label={t("drivers.actions.reject", "Reject")}
                                className="inline-flex items-center gap-1 rounded-lg bg-status-danger/10 px-3 py-1.5 text-xs font-medium text-status-danger transition-all duration-200 hover:bg-status-danger/20"
                              >
                                <UserX className="h-3 w-3" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedDriverId(driver.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-400 transition-all duration-200 hover:bg-brand-500/20"
                          >
                            <Eye className="h-3 w-3" /> {t("common.view", "View")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDriverId && (
        <DriverDetailModal
          driverId={selectedDriverId}
          onClose={() => setSelectedDriverId(null)}
        />
      )}
    </div>
  );
}

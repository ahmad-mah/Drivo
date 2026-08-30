import { AlertTriangle, Clock, ShieldAlert, WifiOff } from "lucide-react";
import type { AdminOverviewAlert } from "../../../types/admin";
import { useTranslation } from "react-i18next";

const severityConfig: Record<
  string,
  { icon: typeof AlertTriangle; color: string; bg: string; border: string }
> = {
  info: {
    icon: WifiOff,
    color: "text-status-info",
    bg: "bg-status-info/10",
    border: "border-status-info/20",
  },
  warning: {
    icon: Clock,
    color: "text-status-warning",
    bg: "bg-status-warning/10",
    border: "border-status-warning/20",
  },
  critical: {
    icon: AlertTriangle,
    color: "text-status-danger",
    bg: "bg-status-danger/10",
    border: "border-status-danger/20",
  },
};

export function AlertsPanel({ alerts }: { alerts: AdminOverviewAlert[] }) {
  const { t } = useTranslation();
  const active = alerts.filter((a) => a.count > 0);

  const typeLabels: Record<string, string> = {
    long_wait: t("overview.longWait", "Long Wait"),
    stuck_trip: t("overview.stuckTrip", "Stuck Trip"),
    pending_approval: t("overview.pendingApproval", "Pending Approval"),
    driver_offline: t("overview.driverOffline", "Driver Offline"),
  };

  return (
    <div className="glass animate-slide-up stagger-7 rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-text-muted" />
        <h3 className="text-sm font-semibold text-text-primary">{t("overview.alerts", "Alerts")}</h3>
        {active.length > 0 && (
          <span className="ms-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-status-danger/20 px-1.5 text-[10px] font-bold text-status-danger">
            {active.length}
          </span>
        )}
      </div>
      {active.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-brand-500/5 px-4 py-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
            <ShieldAlert className="h-4 w-4 text-brand-400" />
          </div>
          <p className="text-sm text-text-secondary">{t("overview.allClear", "All clear — no alerts")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {active.map((alert, i) => {
            const config = severityConfig[alert.severity] ?? severityConfig.info;
            const Icon = config.icon;
            return (
              <div
                key={alert.type}
                className={`animate-slide-up stagger-${i + 1} flex items-center gap-3 rounded-xl border px-4 py-3 ${config.bg} ${config.border} transition-all duration-200 hover:scale-[1.01]`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                >
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${config.color}`}>
                    {typeLabels[alert.type] ?? alert.type}
                  </p>
                </div>
                <span
                  className={`font-mono text-lg font-bold ${config.color}`}
                >
                  {alert.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
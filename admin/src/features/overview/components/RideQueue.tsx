import { MapPin, Clock, Users } from "lucide-react";
import type { AdminRideSummary } from "../../../types/admin";
import { useTranslation } from "react-i18next";

const statusConfig: Record<
  string,
  { key: string; defaultLabel: string; dot: string; bg: string; text: string }
> = {
  PENDING: {
    key: "tripStatus.PENDING",
    defaultLabel: "Pending",
    dot: "bg-status-warning",
    bg: "bg-status-warning/10",
    text: "text-status-warning",
  },
  ACCEPTED: {
    key: "tripStatus.ACCEPTED",
    defaultLabel: "Accepted",
    dot: "bg-status-success",
    bg: "bg-status-success/10",
    text: "text-status-success",
  },
  ARRIVED: {
    key: "tripStatus.ARRIVED",
    defaultLabel: "Arrived",
    dot: "bg-status-info",
    bg: "bg-status-info/10",
    text: "text-status-info",
  },
  IN_PROGRESS: {
    key: "tripStatus.IN_PROGRESS",
    defaultLabel: "In Progress",
    dot: "bg-indigo-400",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
  },
};

function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function RideQueue({ rides }: { rides: AdminRideSummary[] }) {
  const { t } = useTranslation();

  return (
    <div className="glass animate-slide-up stagger-8 rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
            <MapPin className="h-4 w-4 text-brand-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">{t("overview.rideQueue", "Ride Queue")}</h3>
        </div>
        <span className="rounded-full bg-bg-tertiary px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-muted">
          {rides.length}
        </span>
      </div>
      {rides.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-bg-tertiary px-4 py-8">
          <MapPin className="h-5 w-5 text-text-muted" />
          <p className="text-sm text-text-secondary">{t("common.noData", "No rides waiting")}</p>
        </div>
      ) : (
        <div className="custom-scrollbar max-h-72 space-y-2 overflow-y-auto">
          {rides.map((ride, i) => {
            const status = statusConfig[ride.status] ?? statusConfig.PENDING;
            return (
              <div
                key={ride.id}
                className={`animate-slide-up group flex items-center justify-between rounded-xl border border-border-subtle px-4 py-3 transition-all duration-200 hover:border-border-default hover:bg-bg-tertiary ${
                  i < 8 ? `stagger-${i + 1}` : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}
                    >
                      {t(status.key, status.defaultLabel)}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {ride.id.slice(0, 8)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-text-secondary">
                    <span className="font-medium text-text-primary">
                      {ride.riderName || "Unknown"}
                    </span>{" "}
                    — {ride.originAddress}
                  </p>
                </div>
                <div className="ms-4 flex items-center gap-3">
                  <div className="text-end">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-status-warning" />
                      <span className="font-mono text-xs font-semibold text-status-warning">
                        {formatWait(ride.waitTimeSeconds)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-text-muted" />
                      <span className="text-[10px] text-text-muted">
                        {ride.nearestDriverCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
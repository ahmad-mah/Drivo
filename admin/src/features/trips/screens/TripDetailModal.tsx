import { useQuery } from "@tanstack/react-query";
import { X, MapPin, Navigation, Clock, User, Car, DollarSign, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminTripsApi } from "../api/admin-trips.api";

interface Props {
  rideId: string;
  onClose: () => void;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-status-warning/10", text: "text-status-warning", dot: "bg-status-warning" },
  ACCEPTED: { bg: "bg-status-success/10", text: "text-status-success", dot: "bg-status-success" },
  ARRIVED: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
  IN_PROGRESS: { bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-400" },
  COMPLETED: { bg: "bg-status-success/10", text: "text-status-success", dot: "bg-status-success" },
  CANCELLED: { bg: "bg-status-danger/10", text: "text-status-danger", dot: "bg-status-danger" },
  EXPIRED: { bg: "bg-text-muted/10", text: "text-text-muted", dot: "bg-text-muted" },
};

export function TripDetailModal({ rideId, onClose }: Props) {
  const { t } = useTranslation();
  const { data: ride, isLoading } = useQuery({
    queryKey: ["admin", "ride", rideId],
    queryFn: () => adminTripsApi.getById(rideId),
  });

  const sc = statusConfig[ride?.status ?? ""] ?? statusConfig.PENDING;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-0 animate-scale-in">
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">{t("trips.detail.title", "Trip Details")}</h3>
            <p className="font-mono text-xs text-text-muted">{rideId}</p>
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
        ) : ride ? (
          <div className="space-y-4 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                {t(`tripStatus.${ride.status}`, ride.status.replace("_", " "))}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-xl bg-bg-tertiary px-4 py-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("trips.detail.pickup", "Pickup")}</p>
                  <p className="text-sm text-text-primary">{ride.originAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-bg-tertiary px-4 py-3">
                <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-status-danger" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("trips.detail.dropoff", "Dropoff")}</p>
                  <p className="text-sm text-text-primary">{ride.destinationAddress}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-bg-tertiary px-4 py-3">
                <User className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("trips.detail.rider", "Rider")}</p>
                  <p className="text-sm text-text-primary">{ride.riderName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-bg-tertiary px-4 py-3">
                <Car className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("trips.detail.driver", "Driver")}</p>
                  <p className="text-sm text-text-primary">{ride.driverName ?? t("common.noData", "Unassigned")}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-bg-tertiary px-4 py-3">
                <DollarSign className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("trips.detail.fare", "Fare")}</p>
                  <p className="mt-1 font-mono text-sm text-brand-400">${ride.fare.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-bg-tertiary px-4 py-3">
                <Clock className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("trips.detail.created", "Created")}</p>
                  <p className="text-sm text-text-primary">{new Date(ride.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {ride.cancelReason && (
              <div className="flex items-start gap-2 rounded-xl bg-status-danger/5 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-danger" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-status-danger">{t("trips.detail.cancelReason", "Cancel Reason")}</p>
                  <p className="text-sm text-text-secondary">{ride.cancelReason}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-2 text-sm text-text-muted">{t("trips.notFound", "Trip not found")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

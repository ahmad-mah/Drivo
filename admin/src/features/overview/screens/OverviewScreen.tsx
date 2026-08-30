import {
  Users,
  Car,
  Search,
  Navigation,
  MapPin,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
} from "lucide-react";
import { useAdminOverview } from "../hooks/useAdminOverview";
import { KpiCard } from "../components/KpiCard";
import { AlertsPanel } from "../components/AlertsPanel";
import { RideQueue } from "../components/RideQueue";
import type { AdminOverviewAlert } from "../../../types/admin";
import { useTranslation } from "react-i18next";

export function OverviewScreen() {
  const { overview, loading } = useAdminOverview();
  const { t } = useTranslation();

  if (loading || !overview) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm font-medium text-text-muted">
            {t("common.loading", "Loading...")}
          </p>
        </div>
      </div>
    );
  }

  const { counts, today, alerts } = overview;
  const longWaitAlert = alerts.find(
    (a: AdminOverviewAlert) => a.type === "long_wait",
  );
  const stuckAlert = alerts.find(
    (a: AdminOverviewAlert) => a.type === "stuck_trip",
  );

  const longWaitRides = longWaitAlert?.rides ?? [];
  const stuckRides = stuckAlert?.rides ?? [];
  const allWaitingRides = [...longWaitRides, ...stuckRides];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-slide-up">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">
          {t("overview.title", "Overview")}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {t("overview.subtitle", "Real-time operations dashboard")}
        </p>
      </div>

      {/* Live Status Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label={t("overview.onlineDrivers", "Online Drivers")}
          value={counts.onlineDrivers}
          color="text-brand-400"
          icon={<Users className="h-4 w-4" />}
          index={0}
        />
        <KpiCard
          label={t("overview.available", "Available")}
          value={counts.availableDrivers}
          sub={t("overview.readyForRides", "ready for rides")}
          color="text-emerald-400"
          icon={<Car className="h-4 w-4" />}
          index={1}
        />
        <KpiCard
          label={t("overview.searching", "Searching")}
          value={counts.searchingRides}
          color="text-amber-400"
          icon={<Search className="h-4 w-4" />}
          index={2}
        />
        <KpiCard
          label={t("overview.assigned", "Assigned")}
          value={counts.assignedRides}
          color="text-blue-400"
          icon={<Navigation className="h-4 w-4" />}
          index={3}
        />
        <KpiCard
          label={t("overview.inProgress", "In Progress")}
          value={counts.inProgressRides}
          color="text-indigo-400"
          icon={<MapPin className="h-4 w-4" />}
          index={4}
        />
        <KpiCard
          label={t("overview.pendingApprovals", "Pending Approvals")}
          value={counts.pendingApprovals}
          color="text-orange-400"
          icon={<ShieldCheck className="h-4 w-4" />}
          index={5}
        />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label={t("overview.todayCompleted", "Today Completed")}
          value={today.completedRides}
          icon={<TrendingUp className="h-4 w-4" />}
          index={0}
        />
        <KpiCard
          label={t("overview.todayCancelled", "Today Cancelled")}
          value={today.cancelledRides}
          icon={<TrendingDown className="h-4 w-4" />}
          index={1}
        />
        <KpiCard
          label={t("overview.todayRevenue", "Today Revenue")}
          value={`$${today.revenue.toFixed(2)}`}
          color="text-brand-400"
          icon={<DollarSign className="h-4 w-4" />}
          index={2}
        />
        <KpiCard
          label={t("overview.completionRate", "Completion Rate")}
          value={`${today.completionRate}%`}
          color="text-brand-400"
          icon={<Percent className="h-4 w-4" />}
          index={3}
        />
      </div>

      {/* Alerts + Ride Queue */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AlertsPanel alerts={alerts} />
        </div>
        <div className="lg:col-span-2">
          <RideQueue rides={allWaitingRides} />
        </div>
      </div>
    </div>
  );
}
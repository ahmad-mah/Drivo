import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { adminStatsApi } from "../api/admin-stats.api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PIE_COLORS = [
  "#22c55e",
  "#ef4444",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
];

export function StatisticsScreen() {
  const { t } = useTranslation();
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dateFrom, setDateFrom] = useState(
    thirtyDaysAgo.toISOString().split("T")[0],
  );
  const [dateTo, setDateTo] = useState(now.toISOString().split("T")[0]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats", dateFrom, dateTo],
    queryFn: () => adminStatsApi.get(dateFrom, dateTo),
  });

  if (isLoading || !stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-muted">{t("stats.loading", "Loading statistics...")}</p>
      </div>
    );
  }

  const { summary, daily, topDrivers, statusDistribution } = stats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">{t("stats.title", "Statistics")}</h2>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label={t("trips.dateFrom", "Date From")}
            className="rounded-md border border-border-default bg-bg-secondary px-3 py-1.5 text-sm text-text-primary"
          />
          <span className="text-text-muted">{t("stats.to", "to")}</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label={t("trips.dateTo", "Date To")}
            className="rounded-md border border-border-default bg-bg-secondary px-3 py-1.5 text-sm text-text-primary"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card label={t("stats.totalUsers", "Total Users")} value={summary.totalUsers} />
        <Card label={t("stats.totalDrivers", "Total Drivers")} value={summary.totalDrivers} />
        <Card label={t("stats.totalRides", "Total Rides")} value={summary.totalRides} />
        <Card
          label={t("stats.revenue", "Revenue")}
          value={`$${summary.totalRevenue.toFixed(0)}`}
          color="text-status-success"
        />
        <Card label={t("stats.completed", "Completed")} value={summary.completedRides} color="text-status-success" />
        <Card label={t("stats.cancelled", "Cancelled")} value={summary.cancelledRides} color="text-status-danger" />
        <Card
          label={t("stats.completionRate", "Completion Rate")}
          value={`${summary.completionRate}%`}
          color="text-status-info"
        />
        <Card label={t("stats.onlineDrivers", "Online Drivers")} value={summary.onlineDrivers} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Rides Chart */}
        <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-secondary">
            {t("stats.dailyRides", "Daily Rides")}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "8px",
                  color: "var(--color-text-primary)",
                }}
              />
              <Area
                type="monotone"
                dataKey="rides"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.15}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Revenue Chart */}
        <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-secondary">
            {t("stats.dailyRevenue", "Daily Revenue")}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <Tooltip
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, t("stats.revenueTooltip", "Revenue")]}
                contentStyle={{
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "8px",
                  color: "var(--color-text-primary)",
                }}
              />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-secondary">
            {t("stats.rideStatusDistribution", "Ride Status Distribution")}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution.filter((s) => s.count > 0)}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, count }: any) => `${name} (${count})`}
              >
                {statusDistribution
                  .filter((s) => s.count > 0)
                  .map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "8px",
                  color: "var(--color-text-primary)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Drivers */}
        <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-secondary">
            {t("stats.topDriversByTrips", "Top Drivers by Trips")}
          </h3>
          {topDrivers.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              {t("stats.noDriverData", "No driver data for this period")}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topDrivers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} ${t("stats.tripsTooltip", "trips")}`, t("stats.tripsTooltip", "Trips")]}
                  contentStyle={{
                    backgroundColor: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "8px",
                    color: "var(--color-text-primary)",
                  }}
                />
                <Bar dataKey="trips" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color ?? "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

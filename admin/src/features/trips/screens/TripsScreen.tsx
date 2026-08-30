import { useState } from "react";
import { Search, Filter, Eye, Car } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAdminTrips } from "../hooks/useAdminTrips";
import { TripDetailModal } from "./TripDetailModal";
import type { AdminTripListItem } from "../../../types/admin";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-status-warning/10", text: "text-status-warning", dot: "bg-status-warning" },
  ACCEPTED: { bg: "bg-status-success/10", text: "text-status-success", dot: "bg-status-success" },
  ARRIVED: { bg: "bg-status-info/10", text: "text-status-info", dot: "bg-status-info" },
  IN_PROGRESS: { bg: "bg-indigo-500/10", text: "text-indigo-400", dot: "bg-indigo-400" },
  COMPLETED: { bg: "bg-text-muted/10", text: "text-text-muted", dot: "bg-text-muted" },
  CANCELLED: { bg: "bg-status-danger/10", text: "text-status-danger", dot: "bg-status-danger" },
  EXPIRED: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
};

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TripsScreen() {
  const { t } = useTranslation();
  const { trips, total, page, totalPages, loading, filters, updateFilters } =
    useAdminTrips();
  const [selectedTrip, setSelectedTrip] = useState<AdminTripListItem | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  const handleSearch = () => {
    updateFilters({ search: searchInput || undefined });
  };

  const statusValues = ["", "PENDING", "ACCEPTED", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "EXPIRED"] as const;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
            <Car className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              {t("trips.title", "Trips")}
            </h2>
            <p className="text-xs text-text-muted">{total} {t("trips.totalTrips", "total trips")}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass animate-slide-up stagger-1 flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <Filter className="h-4 w-4 text-text-muted" />
        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            updateFilters({ status: e.target.value || undefined })
          }
          className="rounded-xl border border-border-default bg-bg-glass px-3 py-2 text-sm text-text-primary transition-colors duration-200 hover:border-border-strong focus:border-brand-500 focus:outline-none focus-ring"
        >
          {statusValues.map((value) => (
            <option key={value} value={value} className="bg-bg-primary">
              {value === ""
                ? t("trips.allStatus", "All Status")
                : t(`tripStatus.${value}`, value.replace("_", " "))}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e) => updateFilters({ dateFrom: e.target.value || undefined })}
          aria-label={t("trips.dateFrom", "Date From")}
          className="rounded-xl border border-border-default bg-bg-glass px-3 py-2 text-sm text-text-primary transition-colors duration-200 hover:border-border-strong focus:border-brand-500 focus:outline-none focus-ring"
        />
        <input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) => updateFilters({ dateTo: e.target.value || undefined })}
          aria-label={t("trips.dateTo", "Date To")}
          className="rounded-xl border border-border-default bg-bg-glass px-3 py-2 text-sm text-text-primary transition-colors duration-200 hover:border-border-strong focus:border-brand-500 focus:outline-none focus-ring"
        />

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("trips.searchPlaceholder", "Search rider, driver, ID...")}
              className="w-56 rounded-xl border border-border-default bg-bg-glass ps-9 pe-3 py-2 text-sm text-text-primary placeholder-text-muted transition-colors duration-200 hover:border-border-strong focus:border-brand-500 focus:outline-none focus-ring"
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-xl bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-400 transition-all duration-200 hover:bg-brand-500/20 hover:shadow-lg hover:shadow-brand-500/10"
          >
            {t("common.search", "Search")}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass animate-slide-up stagger-2 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("trips.table.id", "ID")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("trips.table.status", "Status")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("trips.table.rider", "Rider")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("trips.table.route", "Route")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("trips.table.driver", "Driver")}
                </th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("trips.table.fare", "Fare")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("trips.table.created", "Created")}
                </th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("trips.table.action", "Action")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <p className="text-sm text-text-muted">{t("common.loading", "Loading...")}</p>
                    </div>
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Car className="mx-auto h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-sm text-text-muted">{t("trips.empty", "No trips found")}</p>
                  </td>
                </tr>
              ) : (
                trips.map((trip, i) => {
                  const sc = statusConfig[trip.status] ?? statusConfig.COMPLETED;
                  return (
                    <tr
                      key={trip.id}
                      className={`animate-fade-in cursor-pointer transition-colors duration-150 hover:bg-bg-tertiary ${
                        i < 10 ? `stagger-${i + 1}` : ""
                      }`}
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">
                        {trip.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {t(`tripStatus.${trip.status}`, trip.status.replace("_", " "))}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {trip.riderName}
                      </td>
                      <td className="max-w-50 truncate px-4 py-3 text-text-secondary">
                        {trip.originAddress} → {trip.destinationAddress}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {trip.driverName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-end font-mono font-medium text-text-primary">
                        {formatCurrency(trip.fare)}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {formatTime(trip.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrip(trip);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-400 transition-all duration-200 hover:bg-brand-500/20"
                        >
                          <Eye className="h-3 w-3" />
                          {t("common.view", "View")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="animate-slide-up stagger-3 flex items-center justify-center gap-2">
          <button
            onClick={() => updateFilters({ page: Math.max(1, page - 1) })}
            disabled={page <= 1}
            className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-tertiary disabled:opacity-30"
          >
            {t("common.prev", "Prev")}
          </button>
          <span className="px-3 font-mono text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <button
            onClick={() =>
              updateFilters({ page: Math.min(totalPages, page + 1) })
            }
            disabled={page >= totalPages}
            className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-tertiary disabled:opacity-30"
          >
            {t("common.next", "Next")}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTrip && (
        <TripDetailModal
          rideId={selectedTrip.id}
          onClose={() => setSelectedTrip(null)}
        />
      )}
    </div>
  );
}

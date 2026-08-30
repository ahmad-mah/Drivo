import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminAuditApi } from "../api/admin-audit.api";

const actionConfig: Record<
  string,
  { bg: string; text: string }
> = {
  TRIP_CANCEL: { bg: "bg-status-danger/10", text: "text-status-danger" },
  RIDE_CREATE: { bg: "bg-status-info/10", text: "text-status-info" },
  RIDE_UPDATE_STATUS: { bg: "bg-status-warning/10", text: "text-status-warning" },
  RIDE_ASSIGN_DRIVER: {
    bg: "bg-status-success/10",
    text: "text-status-success",
  },
  SUPPORT_TICKET_UPDATE_STATUS: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
  },
  PROMO_TOGGLE_ACTIVE: {
    bg: "bg-brand-500/10",
    text: "text-brand-400",
  },
  PAYMENT_METHOD_CREATE: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
  },
};

export function AuditScreen() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit", page, actionFilter],
    queryFn: () =>
      adminAuditApi.list({ action: actionFilter || undefined, page, limit: 50 }),
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-5">
      <div className="animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
            <FileText className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              {t("audit.title", "Audit Logs")}
            </h2>
            <p className="text-xs text-text-muted">{total} {t("audit.totalEntries", "total entries")}</p>
          </div>
        </div>
      </div>

      <div className="glass animate-slide-up stagger-1 flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <FileText className="h-4 w-4 text-text-muted" />
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border-default bg-bg-glass px-3 py-2 text-sm text-text-primary transition-colors duration-200 hover:border-border-strong focus:border-brand-500 focus:outline-none focus-ring"
        >
          <option value="" className="bg-bg-primary">
            {t("audit.allActions", "All Actions")}
          </option>
          {Object.keys(actionConfig).map((a) => (
            <option key={a} value={a} className="bg-bg-primary">
              {t(`auditActions.${a}`, a)}
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
                  {t("audit.table.timestamp", "Timestamp")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("audit.table.admin", "Admin")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("audit.table.action", "Action")}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("audit.table.target", "Target")}
                </th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {t("audit.table.changes", "Changes")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
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
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <FileText className="mx-auto h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-sm text-text-muted">
                      {t("audit.empty", "No audit logs found")}
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => {
                  const ac = actionConfig[log.action] ?? {
                    bg: "bg-text-muted/10",
                    text: "text-text-muted",
                  };
                  const adminName = log.admin
                    ? [log.admin.firstName, log.admin.lastName]
                        .filter(Boolean)
                        .join(" ") || log.admin.email
                    : t("audit.system", "System");
                  return (
                    <tr
                      key={log.id}
                      className={`animate-fade-in transition-colors duration-150 hover:bg-bg-tertiary ${i < 10 ? `stagger-${i + 1}` : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {adminName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ac.bg} ${ac.text}`}
                        >
                          {t(`auditActions.${log.action}`, log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                        {log.targetType} {log.targetId.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-end text-xs text-text-muted">
                        {log.previousState
                          ? JSON.stringify(log.previousState).slice(0, 60)
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="animate-slide-up stagger-3 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-tertiary disabled:opacity-30"
          >
            {t("common.prev", "Prev")}
          </button>
          <span className="px-3 font-mono text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-tertiary disabled:opacity-30"
          >
            {t("common.next", "Next")}
          </button>
        </div>
      )}
    </div>
  );
}

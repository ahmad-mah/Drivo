import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminPaymentsApi } from "../api/admin-payments.api";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-status-warning/10", text: "text-status-warning", dot: "bg-status-warning" },
  PROCESSING: { bg: "bg-status-info/10", text: "text-status-info", dot: "bg-status-info" },
  PAID: { bg: "bg-status-success/10", text: "text-status-success", dot: "bg-status-success" },
  FAILED: { bg: "bg-status-danger/10", text: "text-status-danger", dot: "bg-status-danger" },
  HELD: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
};

const statusValues = ["", "PENDING", "PROCESSING", "PAID", "FAILED", "HELD"] as const;

export function PaymentsScreen() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "payments", statusFilter, page],
    queryFn: () => adminPaymentsApi.list({ status: statusFilter || undefined, page, limit: 25 }),
  });

  const payouts = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-5">
      <div className="animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
            <CreditCard className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">{t("payments.title", "Driver Payouts")}</h2>
            <p className="text-xs text-text-muted">{total} {t("payments.totalPayouts", "total payouts")}</p>
          </div>
        </div>
      </div>

      <div className="glass animate-slide-up stagger-1 flex items-center gap-3 rounded-2xl p-4">
        <Filter className="h-4 w-4 text-text-muted" />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-border-default bg-bg-glass px-3 py-2 text-sm text-text-primary transition-colors duration-200 hover:border-border-strong focus:border-brand-500 focus:outline-none focus-ring"
        >
          {statusValues.map((value) => (
            <option key={value} value={value} className="bg-bg-primary">
              {value === ""
                ? t("payments.allStatus", "All Status")
                : t(`payoutStatus.${value}`, value)}
            </option>
          ))}
        </select>
      </div>

      <div className="glass animate-slide-up stagger-2 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("payments.table.driver", "Driver")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("payments.table.period", "Period")}</th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("payments.table.gross", "Gross")}</th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("payments.table.commission", "Commission")}</th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("payments.table.net", "Net")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("payments.table.status", "Status")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("payments.table.paidAt", "Paid At")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <p className="text-sm text-text-muted">{t("common.loading", "Loading...")}</p>
                    </div>
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <CreditCard className="mx-auto h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-sm text-text-muted">{t("payments.empty", "No payouts found")}</p>
                  </td>
                </tr>
              ) : (
                payouts.map((p, i) => {
                  const sc = statusConfig[p.status] ?? statusConfig.PENDING;
                  return (
                    <tr key={p.id} className={`animate-fade-in transition-colors duration-150 hover:bg-bg-tertiary ${i < 10 ? `stagger-${i + 1}` : ""}`}>
                      <td className="px-4 py-3 font-medium text-text-primary">{p.driverName}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(p.periodStart).toLocaleDateString()} — {new Date(p.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-end font-mono text-text-primary">${p.grossEarnings.toFixed(2)}</td>
                      <td className="px-4 py-3 text-end font-mono text-status-danger">${p.commission.toFixed(2)}</td>
                      <td className="px-4 py-3 text-end font-mono font-semibold text-brand-400">${p.netAmount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {t(`payoutStatus.${p.status}`, p.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}
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
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-tertiary disabled:opacity-30">{t("common.prev", "Prev")}</button>
          <span className="px-3 font-mono text-sm text-text-muted">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-tertiary disabled:opacity-30">{t("common.next", "Next")}</button>
        </div>
      )}
    </div>
  );
}

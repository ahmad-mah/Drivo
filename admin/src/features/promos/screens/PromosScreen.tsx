import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminPromosApi, type AdminPromo } from "../api/admin-promos.api";

export function PromosScreen() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "promos", page],
    queryFn: () => adminPromosApi.list({ page, limit: 25 }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminPromosApi.toggleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promos"] });
    },
  });

  const promos = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-5">
      <div className="animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
            <Tag className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">{t("promos.title", "Promo Codes")}</h2>
            <p className="text-xs text-text-muted">{total} {t("promos.totalPromos", "total promos")}</p>
          </div>
        </div>
      </div>

      <div className="glass animate-slide-up stagger-1 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("promos.table.code", "Code")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("promos.table.discount", "Discount")}</th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("promos.table.used", "Used")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("promos.table.expires", "Expires")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("promos.table.createdBy", "Created By")}</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("promos.table.active", "Active")}</th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("promos.table.action", "Action")}</th>
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
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Tag className="mx-auto h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-sm text-text-muted">{t("promos.empty", "No promo codes found")}</p>
                  </td>
                </tr>
              ) : (
                promos.map((p: AdminPromo, i) => (
                  <tr
                    key={p.id}
                    className={`animate-fade-in transition-colors duration-150 hover:bg-bg-tertiary ${i < 10 ? `stagger-${i + 1}` : ""}`}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-brand-400">{p.code}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {p.discountType === "PERCENTAGE" ? `${p.discountValue}%` : `$${p.discountValue}`}
                    </td>
                    <td className="px-4 py-3 text-end font-mono text-text-primary">
                      {p.usageCount}/{p.usageLimit ?? "∞"}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {p.validUntil ? new Date(p.validUntil).toLocaleDateString() : t("promos.never", "Never")}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{p.createdByName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${p.isActive ? "bg-status-success/10 text-status-success" : "bg-text-muted/10 text-text-muted"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.isActive ? "bg-status-success" : "bg-text-muted"}`} />
                        {p.isActive ? t("promos.active", "Active") : t("promos.inactive", "Inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        onClick={() => toggleMutation.mutate({ id: p.id, active: !p.isActive })}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${p.isActive ? "bg-status-danger/10 text-status-danger hover:bg-status-danger/20" : "bg-status-success/10 text-status-success hover:bg-status-success/20"}`}
                      >
                        {p.isActive ? t("common.deactivate", "Deactivate") : t("common.activate", "Activate")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="animate-slide-up stagger-2 flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-tertiary disabled:opacity-30">{t("common.prev", "Prev")}</button>
          <span className="px-3 font-mono text-sm text-text-muted">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-tertiary disabled:opacity-30">{t("common.next", "Next")}</button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Headphones, Filter, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminSupportApi } from "../api/admin-support.api";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  OPEN: { bg: "bg-status-info/10", text: "text-status-info", dot: "bg-status-info" },
  IN_PROGRESS: { bg: "bg-status-warning/10", text: "text-status-warning", dot: "bg-status-warning" },
  RESOLVED: { bg: "bg-status-success/10", text: "text-status-success", dot: "bg-status-success" },
  CLOSED: { bg: "bg-text-muted/10", text: "text-text-muted", dot: "bg-text-muted" },
};

const priorityConfig: Record<string, { bg: string; text: string }> = {
  LOW: { bg: "bg-text-muted/10", text: "text-text-muted" },
  MEDIUM: { bg: "bg-status-warning/10", text: "text-status-warning" },
  HIGH: { bg: "bg-orange-500/10", text: "text-orange-400" },
  CRITICAL: { bg: "bg-status-danger/10", text: "text-status-danger" },
};

const statusValues = ["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const transitionValues = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export function SupportScreen() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "support", statusFilter, page],
    queryFn: () => adminSupportApi.list({ status: statusFilter || undefined, page, limit: 25 }),
  });

  const { data: ticketDetail } = useQuery({
    queryKey: ["admin", "ticket", selectedTicketId],
    queryFn: () => adminSupportApi.getById(selectedTicketId!),
    enabled: !!selectedTicketId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminSupportApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "ticket"] });
    },
  });

  const tickets = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-5">
      <div className="animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
            <Headphones className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">{t("support.title", "Support Tickets")}</h2>
            <p className="text-xs text-text-muted">{total} {t("support.totalTickets", "total tickets")}</p>
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
                ? t("support.allStatus", "All Status")
                : t(`ticketStatus.${value}`, value.replace("_", " "))}
            </option>
          ))}
        </select>
      </div>

      <div className="glass animate-slide-up stagger-2 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("support.table.subject", "Subject")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("support.table.user", "User")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("support.table.priority", "Priority")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("support.table.status", "Status")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("support.table.assigned", "Assigned")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("support.table.created", "Created")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <p className="text-sm text-text-muted">{t("common.loading", "Loading...")}</p>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Headphones className="mx-auto h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-sm text-text-muted">{t("support.empty", "No tickets found")}</p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket, i) => {
                  const sc = statusConfig[ticket.status] ?? statusConfig.OPEN;
                  const pc = priorityConfig[ticket.priority] ?? priorityConfig.LOW;
                  return (
                    <tr
                      key={ticket.id}
                      className={`animate-fade-in cursor-pointer transition-colors duration-150 hover:bg-bg-tertiary ${i < 10 ? `stagger-${i + 1}` : ""}`}
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">{ticket.subject}</td>
                      <td className="px-4 py-3 text-text-secondary">{ticket.userName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pc.bg} ${pc.text}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {t(`ticketStatus.${ticket.status}`, ticket.status.replace("_", " "))}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{ticket.assignedName ?? "—"}</td>
                      <td className="px-4 py-3 text-text-muted">{new Date(ticket.createdAt).toLocaleDateString()}</td>
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

      {/* Ticket Detail Modal */}
      {selectedTicketId && ticketDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-strong mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-0 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary">{ticketDetail.subject}</h3>
                <p className="font-mono text-xs text-text-muted">{ticketDetail.id}</p>
              </div>
              <button
                onClick={() => setSelectedTicketId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors duration-200 hover:bg-bg-tertiary hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusConfig[ticketDetail.status]?.bg} ${statusConfig[ticketDetail.status]?.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[ticketDetail.status]?.dot}`} />
                  {t(`ticketStatus.${ticketDetail.status}`, ticketDetail.status.replace("_", " "))}
                </span>
                <span className="text-sm text-text-muted">
                  {t("support.detail.priority", "Priority")}: {ticketDetail.priority}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">{ticketDetail.description}</p>
              <div className="rounded-xl bg-bg-tertiary px-4 py-3 text-sm text-text-secondary">
                <p>{t("support.detail.user", "User")}: <span className="text-text-primary">{ticketDetail.user?.email ?? t("common.noData", "Unknown")}</span></p>
                {ticketDetail.rideId && <p>{t("support.detail.ride", "Ride")}: <span className="font-mono text-text-primary">{ticketDetail.rideId}</span></p>}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {transitionValues.map((s) => (
                  <button
                    key={s}
                    onClick={() => statusMutation.mutate({ id: ticketDetail.id, status: s })}
                    disabled={ticketDetail.status === s}
                    className="rounded-xl border border-border-default px-3 py-1.5 text-xs font-medium text-text-muted transition-all duration-200 hover:border-border-strong hover:text-text-primary disabled:opacity-30"
                  >
                    {t(`ticketStatus.${s}`, s.replace("_", " "))}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

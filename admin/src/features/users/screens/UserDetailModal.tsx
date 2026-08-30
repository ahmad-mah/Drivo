import { useQuery } from "@tanstack/react-query";
import { X, User, Phone, Mail, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminUsersApi } from "../api/admin-users.api";

interface Props {
  userId: string;
  onClose: () => void;
}

export function UserDetailModal({ userId, onClose }: Props) {
  const { t } = useTranslation();
  const { data: user, isLoading } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => adminUsersApi.getById(userId),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-0 animate-scale-in">
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
              <User className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                {user?.firstName ?? ""} {user?.lastName ?? ""}
              </h3>
              <p className="font-mono text-xs text-text-muted">{userId}</p>
            </div>
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
        ) : user ? (
          <div className="space-y-4 px-6 py-4">
            <div className="flex items-center gap-3">
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="" className="h-14 w-14 rounded-2xl object-cover ring-2 ring-border-subtle" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-xl font-bold text-brand-400">
                  {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-text-primary">
                  {user.firstName ?? ""} {user.lastName ?? ""}
                </p>
                <p className="text-sm text-text-secondary">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-bg-tertiary px-4 py-3">
                <Phone className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.detail.phone", "Phone")}</p>
                  <p className="text-sm text-text-primary">{user.phone ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-bg-tertiary px-4 py-3">
                <Mail className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.detail.email", "Email")}</p>
                  <p className="text-sm text-text-primary">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.detail.trips", "Trips")}</p>
                <p className="mt-1 font-mono text-sm text-text-primary">{user.stats.totalTrips}</p>
              </div>
              <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.detail.tickets", "Tickets")}</p>
                <p className="mt-1 font-mono text-sm text-text-primary">{user.stats.ticketCount}</p>
              </div>
            </div>

            <div className="rounded-xl bg-bg-tertiary px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.detail.totalSpent", "Total Spent")}</p>
              <p className="mt-1 font-mono text-sm text-brand-400">${user.stats.totalSpent.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-bg-tertiary px-4 py-3">
              <Calendar className="h-4 w-4 text-text-muted" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.detail.joined", "Joined")}</p>
                <p className="text-sm text-text-primary">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <User className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-2 text-sm text-text-muted">{t("users.notFound", "User not found")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

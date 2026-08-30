import { useState } from "react";
import { Search, Filter, Eye, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { UserDetailModal } from "./UserDetailModal";
import type { AdminUserListItem } from "../api/admin-users.api";

const roleConfig: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: "bg-purple-500/10", text: "text-purple-400" },
  USER: { bg: "bg-text-muted/10", text: "text-text-muted" },
};

const roleValues = ["", "USER", "ADMIN"] as const;

export function UsersScreen() {
  const { t } = useTranslation();
  const { users, total, page, totalPages, loading, filters, updateFilters } =
    useAdminUsers();
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  const handleSearch = () => {
    updateFilters({ search: searchInput || undefined });
  };

  return (
    <div className="space-y-5">
      <div className="animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
            <Users className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              {t("users.title", "Users")}
            </h2>
            <p className="text-xs text-text-muted">{total} {t("users.totalUsers", "total users")}</p>
          </div>
        </div>
      </div>

      <div className="glass animate-slide-up stagger-1 flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <Filter className="h-4 w-4 text-text-muted" />
        <select
          value={filters.role ?? ""}
          onChange={(e) => updateFilters({ role: e.target.value || undefined })}
          className="rounded-xl border border-border-default bg-bg-glass px-3 py-2 text-sm text-text-primary transition-colors duration-200 hover:border-border-strong focus:border-brand-500 focus:outline-none focus-ring"
        >
          {roleValues.map((value) => (
            <option key={value} value={value} className="bg-bg-primary">
              {value === ""
                ? t("users.allRoles", "All Roles")
                : value === "USER"
                ? t("users.roleUser", "User")
                : t("users.roleAdmin", "Admin")}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("users.searchPlaceholder", "Search name, email, phone...")}
              className="w-64 rounded-xl border border-border-default bg-bg-glass ps-9 pe-3 py-2 text-sm text-text-primary placeholder-text-muted transition-colors duration-200 hover:border-border-strong focus:border-brand-500 focus:outline-none focus-ring"
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

      <div className="glass animate-slide-up stagger-2 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.table.user", "User")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.table.email", "Email")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.table.phone", "Phone")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.table.role", "Role")}</th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.table.trips", "Trips")}</th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.table.tickets", "Tickets")}</th>
                <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.table.joined", "Joined")}</th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("users.table.action", "Action")}</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Users className="mx-auto h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-sm text-text-muted">{t("users.empty", "No users found")}</p>
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const rc = roleConfig[user.role] ?? roleConfig.USER;
                  return (
                    <tr
                      key={user.id}
                      className={`animate-fade-in cursor-pointer transition-colors duration-150 hover:bg-bg-tertiary ${i < 10 ? `stagger-${i + 1}` : ""}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-xs font-bold text-brand-400">
                            {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                          </div>
                          <span className="font-medium text-text-primary">
                            {user.firstName ?? ""} {user.lastName ?? ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                      <td className="px-4 py-3 text-text-secondary">{user.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${rc.bg} ${rc.text}`}>
                          {user.role === "ADMIN" ? t("users.roleAdmin", "Admin") : t("users.roleUser", "User")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end font-mono text-text-primary">{user.tripCount}</td>
                      <td className="px-4 py-3 text-end font-mono text-text-primary">{user.ticketCount}</td>
                      <td className="px-4 py-3 text-text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-400 transition-all duration-200 hover:bg-brand-500/20"
                        >
                          <Eye className="h-3 w-3" /> {t("common.view", "View")}
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

      {totalPages > 1 && (
        <div className="animate-slide-up stagger-3 flex items-center justify-center gap-2">
          <button onClick={() => updateFilters({ page: Math.max(1, page - 1) })} disabled={page <= 1} className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-tertiary disabled:opacity-30">{t("common.prev", "Prev")}</button>
          <span className="px-3 font-mono text-sm text-text-muted">{page} / {totalPages}</span>
          <button onClick={() => updateFilters({ page: Math.min(totalPages, page + 1) })} disabled={page >= totalPages} className="glass rounded-xl px-4 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-bg-tertiary disabled:opacity-30">{t("common.next", "Next")}</button>
        </div>
      )}

      {selectedUser && (
        <UserDetailModal userId={selectedUser.id} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

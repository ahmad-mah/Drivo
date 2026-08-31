import { NavLink } from "react-router-dom";
import { useLocale } from "../../contexts/useLocale";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Car,
  Users,
  BarChart3,
  CreditCard,
  Headphones,
  Settings,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import type { ComponentType } from "react";

interface NavItem {
  to: string;
  labelKey: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}

const navItems: NavItem[] = [
  { to: "/admin", labelKey: "navigation.overview", icon: LayoutDashboard },
  { to: "/admin/trips", labelKey: "navigation.trips", icon: Car },
  { to: "/admin/drivers", labelKey: "navigation.drivers", icon: UserCheck },
  { to: "/admin/users", labelKey: "navigation.users", icon: Users },
  { to: "/admin/statistics", labelKey: "navigation.statistics", icon: BarChart3 },
  { to: "/admin/payments", labelKey: "navigation.payments", icon: CreditCard },
  { to: "/admin/support", labelKey: "navigation.support", icon: Headphones },
  { to: "/admin/audit", labelKey: "navigation.auditLogs", icon: ShieldCheck },
  { to: "/admin/settings", labelKey: "navigation.settings", icon: Settings },
];

export function AdminSidebar() {
  const { locale } = useLocale();
  const { t } = useTranslation();

  return (
    <aside className="glass-strong flex h-screen w-64 flex-col animate-slide-in-start border-e">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 shadow-lg shadow-brand-500/25">
            <span className="text-sm font-bold text-white">D</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-text-primary">
              {t("app.name", "Drivo")}
            </h1>
            <p className="text-[11px] font-medium text-text-muted">
              {t("app.adminPanel", "Admin Panel")}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={`/${locale}${item.to}`}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-y-0 start-0 w-0.75 rounded-full bg-brand-500 animate-slide-in-start" />
                  )}
                  <item.icon
                    className={`h-4.5 w-4.5 transition-colors duration-200 ${
                      isActive
                        ? "text-brand-400"
                        : "text-text-muted group-hover:text-text-secondary"
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border-subtle">
        <div className="rounded-xl bg-bg-tertiary px-4 py-3">
          <p className="text-[11px] font-medium text-text-muted">{t("app.version", "Version")}</p>
          <p className="font-mono text-xs text-text-secondary">1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
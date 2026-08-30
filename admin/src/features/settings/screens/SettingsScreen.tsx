import { useUser } from "@clerk/react";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SettingsScreen() {
  const { t } = useTranslation();
  const { user, isLoaded } = useUser();

  return (
    <div className="space-y-5">
      <div className="animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
            <Shield className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">{t("settings.title", "Admin Profile")}</h2>
            <p className="text-xs text-text-muted">{t("settings.subtitle", "Your account details")}</p>
          </div>
        </div>
      </div>

      <div className="glass animate-slide-up stagger-1 overflow-hidden rounded-2xl">
        <div className="border-b border-border-subtle px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">{t("settings.account", "Account")}</h3>
        </div>
        <div className="space-y-4 px-6 py-5">
          {isLoaded && user ? (
            <>
              <div className="flex items-center gap-4">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-border-subtle" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-2xl font-bold text-brand-400">
                    {(user.firstName?.[0] ?? user.emailAddresses[0]?.emailAddress[0] ?? "?").toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-text-primary">
                    {user.firstName ?? ""} {user.lastName ?? ""}
                  </p>
                  <p className="text-sm text-text-secondary">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("settings.userId", "User ID")}</p>
                  <p className="mt-1 font-mono text-xs text-text-secondary">{user.id}</p>
                </div>
                <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("settings.role", "Role")}</p>
                  <p className="mt-1 text-sm text-text-primary">{t("users.roleAdmin", "Admin")}</p>
                </div>
                <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("settings.created", "Created")}</p>
                  <p className="mt-1 text-sm text-text-primary">{user.createdAt != null ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
                </div>
                <div className="rounded-xl bg-bg-tertiary px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("settings.lastSignIn", "Last Sign In")}</p>
                  <p className="mt-1 text-sm text-text-primary">{user.lastSignInAt != null ? new Date(user.lastSignInAt).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      <div className="glass animate-slide-up stagger-2 overflow-hidden rounded-2xl">
        <div className="border-b border-border-subtle px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">{t("settings.system", "System")}</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
          <div className="rounded-xl bg-bg-tertiary px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("settings.version", "Admin Panel")}</p>
            <p className="mt-1 text-sm text-text-primary">v1.0.0</p>
          </div>
          <div className="rounded-xl bg-bg-tertiary px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("settings.environment", "Environment")}</p>
            <p className="mt-1 text-sm text-text-primary">{import.meta.env.MODE === "production" ? t("environments.production", "Production") : t("environments.development", "Development")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

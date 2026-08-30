import { UserButton, Show } from "@clerk/react";
import { ThemeToggle } from "../ThemeToggle";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";

export function AdminHeader() {
  const { t } = useTranslation();

  return (
    <header className="glass flex items-center justify-between px-6 py-3 animate-slide-down">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse-glow" />
        <span className="text-xs font-medium text-text-muted">
          {t("header.systemOnline", "System Online")}
        </span>
      </div>
      <Show when="signed-in">
        <div className="flex items-center gap-3">
          <div className="text-end me-4 hidden sm:block">
            <p className="text-xs font-medium text-text-secondary">{t("header.admin", "Admin")}</p>
          </div>
          <LanguageSwitcher />
          <ThemeToggle />
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-8 w-8 rounded-lg ring-2 ring-border-default hover:ring-brand-400 transition-all duration-200",
              },
            }}
          />
        </div>
      </Show>
    </header>
  );
}
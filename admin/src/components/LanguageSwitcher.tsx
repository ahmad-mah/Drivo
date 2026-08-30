import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "../contexts/useLocale";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const choose = (next: "en" | "ar") => {
    setLocale(next);
    setIsOpen(false);
  };

  const dropdown = isOpen && buttonRef.current ? (
    createPortal(
      <ul
        ref={dropdownRef}
        className="fixed z-50 min-w-40 overflow-hidden rounded-xl border border-border-default bg-bg-primary py-1 shadow-lg animate-scale-in"
        role="listbox"
        aria-label="Select language"
        style={{
          top: buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
          right: window.innerWidth - buttonRef.current.getBoundingClientRect().right,
        }}
      >
        <li role="option" aria-selected={locale === "en"} className="w-full">
          <button
            type="button"
            onClick={() => choose("en")}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
              locale === "en"
                ? "bg-brand-500/10 text-brand-400"
                : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
            }`}
          >
            <span className="text-base">🇺🇸</span>
            <span className="flex-1 text-start">English</span>
          </button>
        </li>
        <li role="option" aria-selected={locale === "ar"} className="w-full">
          <button
            type="button"
            onClick={() => choose("ar")}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
              locale === "ar"
                ? "bg-brand-500/10 text-brand-400"
                : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
            }`}
          >
            <span className="text-base">🇸🇦</span>
            <span className="flex-1 text-start">العربية</span>
          </button>
        </li>
      </ul>,
      document.body
    )
  ) : null;

  return (
    <div className="inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-200 focus-ring"
        aria-label={t("header.language.english", "Change language")}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{locale === "ar" ? "العربية" : "English"}</span>
      </button>
      {dropdown}
    </div>
  );
}

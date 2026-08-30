import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { LocaleContext, type Locale, type LocaleContextType } from "./LocaleContext";
import { getDirection, SUPPORTED_LOCALES, DEFAULT_LOCALE, getLocaleFromPath, getPathWithLocale, hasLocalePrefix } from "../i18n/utils/direction";

// Internal component that uses useTranslation to get the ready state
function LocaleProviderInner({ children, locale, direction, setLocale, ready }: LocaleContextType & { children: ReactNode }) {
  return (
    <LocaleContext.Provider value={{ locale, direction, setLocale, ready }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const fromPath = getLocaleFromPath(window.location.pathname);
      if (hasLocalePrefix(window.location.pathname)) {
        return fromPath;
      }
      const stored = localStorage.getItem("locale") as Locale | null;
      if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
      return fromPath;
    }
    return DEFAULT_LOCALE;
  });

  const direction = getDirection(locale);
  const { ready } = useTranslation();

  // Sync locale state with URL path. Triggers only when the URL changes
  // (browser back/forward, manual address-bar edit). Must NOT depend on
  // `locale`, otherwise the user's click is overwritten by a stale URL read
  // before `navigate(...)` commits.
  const localeRef = useRef(locale);
  localeRef.current = locale;
  useEffect(() => {
    const fromPath = getLocaleFromPath(location.pathname);
    if (hasLocalePrefix(location.pathname) && localeRef.current !== fromPath) {
      setLocaleState(fromPath);
    }
  }, [location.pathname]);

  useEffect(() => {
    i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    localStorage.setItem("locale", locale);
  }, [locale, direction]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "locale" && e.newValue && SUPPORTED_LOCALES.includes(e.newValue as Locale)) {
        setLocaleState(e.newValue as Locale);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    const currentPath = window.location.pathname;
    const newPath = getPathWithLocale(currentPath, newLocale);
    navigate(newPath, { replace: true });
  };

  return (
    <LocaleProviderInner locale={locale} direction={direction} setLocale={setLocale} ready={ready}>
      {children}
    </LocaleProviderInner>
  );
}
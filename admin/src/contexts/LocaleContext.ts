import { createContext } from "react";
import type { Locale } from "../i18n/utils/direction";

export type LocaleContextType = {
  locale: Locale;
  direction: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  ready: boolean;
};

export const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Re-export Locale type for convenience
export type { Locale };
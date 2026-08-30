import { useTranslation as useI18nTranslation } from "react-i18next";
import type { TFunction } from "i18next";

export type { TFunction };

export function useTranslation(ns?: string) {
  const { t, i18n, ready } = useI18nTranslation(ns);
  return { t, i18n, ready };
}
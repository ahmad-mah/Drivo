export type Locale = "en" | "ar";

export const SUPPORTED_LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getLanguageName(locale: Locale): string {
  return locale === "ar" ? "العربية" : "English";
}

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const potentialLocale = segments[0] as Locale;
  return SUPPORTED_LOCALES.includes(potentialLocale) ? potentialLocale : DEFAULT_LOCALE;
}

export function hasLocalePrefix(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return SUPPORTED_LOCALES.includes(segments[0] as Locale);
}

export function getPathWithLocale(pathname: string, locale: Locale): string {
  const currentLocale = getLocaleFromPath(pathname);
  if (currentLocale === locale && hasLocalePrefix(pathname)) return pathname;
  
  if (hasLocalePrefix(pathname)) {
    // Replace current locale
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }
  // Add locale prefix
  return `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function removeLocaleFromPath(pathname: string): { locale: Locale; pathWithoutLocale: string } {
  const locale = getLocaleFromPath(pathname);
  if (hasLocalePrefix(pathname)) {
    const segments = pathname.split("/").filter(Boolean);
    segments.shift(); // remove locale
    return {
      locale,
      pathWithoutLocale: `/${segments.join("/")}` || "/",
    };
  }
  return { locale: DEFAULT_LOCALE, pathWithoutLocale: pathname };
}
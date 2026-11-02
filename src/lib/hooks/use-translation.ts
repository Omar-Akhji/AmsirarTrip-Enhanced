import { inject, unref, type Ref } from "vue";
import { type TranslationFunction, useTranslations } from "../../i18n/utils";
import { DEFAULT_LOCALE as defaultLang, isLocale, type Locale } from "../../i18n/locales";

export function getResolvedLocale(explicitLocale?: string): Locale {
  if (explicitLocale && isLocale(explicitLocale)) {
    return explicitLocale;
  }

  // Check Vue injection context if available
  try {
    const injected = inject<string | Ref<string> | undefined>("app-locale", undefined);
    const resolvedInjected = unref(injected);
    if (resolvedInjected && isLocale(resolvedInjected)) {
      return resolvedInjected;
    }
  } catch {
    // Outside Vue setup context; ignore
  }

  // Client-side browser resolution based strictly on current URL pathname
  if (typeof window !== "undefined" && typeof location !== "undefined") {
    const segment = location.pathname.replace(/^\/+/, "").split("/", 1)[0];
    return segment && isLocale(segment) ? segment : defaultLang;
  }

  return defaultLang;
}

export interface UseTranslationReturn {
  t: TranslationFunction;
  i18n: { language: Locale };
}

export function useTranslation(explicitLocale?: string): UseTranslationReturn {
  const locale = getResolvedLocale(explicitLocale);
  return { t: useTranslations(locale), i18n: { language: locale } };
}

import { defaultLang } from "../../i18n/ui";
import { useTranslations as useAstroTranslations } from "../../i18n/utils";

let globalLocale = defaultLang;

const LOCALES = ["en", "fr", "de", "es"] as const;

export function setGlobalLocale(locale: string) {
  globalLocale = locale;
}

export function getGlobalLocale(): string {
  if (globalThis.window !== undefined) {
    const segment = globalThis.location.pathname.split("/").find(Boolean);
    if (segment && (LOCALES as readonly string[]).includes(segment)) {
      return segment;
    }
  }
  return globalLocale;
}

export function useTranslation() {
  const locale = getGlobalLocale();
  const t = useAstroTranslations(locale);

  return {
    t,
    i18n: {
      language: locale,
      changeLanguage: () => {
        console.warn("Language changes should be done via routing, not programmatically.");
      },
    },
  };
}

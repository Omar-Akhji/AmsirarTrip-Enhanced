import { defaultLang } from "../../i18n/ui";
import { useTranslations as useAstroTranslations } from "../../i18n/utils";

const LOCALES = ["en", "fr", "de", "es"] as const;

export function getGlobalLocale(): string {
  if (typeof location !== "undefined") {
    const segment = location.pathname.split("/").find(Boolean);
    if (segment && (LOCALES as readonly string[]).includes(segment)) {
      return segment;
    }
  }
  return defaultLang;
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

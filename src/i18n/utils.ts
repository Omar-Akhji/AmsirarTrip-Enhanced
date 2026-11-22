import { isLocale, type Locale } from "./locales";
import { defaultLang, ui } from "./ui";
import { createTranslationHelper, lookupKey, type TranslationFunction } from "./core";

export type { TranslationFunction } from "./core";
export type { MessageKey, Messages } from "./types";
export { getLocalizedPath, parseStringArray, stripLocaleFromPath } from "./core";

const translatorCache = new Map<Locale, TranslationFunction>();

export function useTranslations(locale: string): TranslationFunction {
  const currentLocale: Locale = isLocale(locale) ? locale : defaultLang;
  const cached = translatorCache.get(currentLocale);
  if (cached) return cached;

  const translations = ui[currentLocale];
  const defaultTranslations = ui[defaultLang];

  const fallbackLookup =
    currentLocale === defaultLang ? undefined : (
      (key: string) => lookupKey(defaultTranslations, key)
    );

  const helper = createTranslationHelper(
    (key) => lookupKey(translations, key),
    fallbackLookup,
    currentLocale,
  );
  translatorCache.set(currentLocale, helper);
  return helper;
}

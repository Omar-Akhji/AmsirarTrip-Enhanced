import languagesData from "@/data/languages.json";

export const LOCALES = ["en", "fr", "de", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE = "en";

export type Language = { readonly code: Locale; readonly name: string; readonly shortName: string };

export function isLocale(code: string): code is Locale {
  return (LOCALES as readonly string[]).includes(code);
}

export const LANGUAGES: readonly Language[] = languagesData.map((item) => {
  if (!isLocale(item.code)) {
    throw new Error(`Invalid locale code in languages.json: ${item.code}`);
  }
  return { code: item.code, name: item.name, shortName: item.shortName };
});

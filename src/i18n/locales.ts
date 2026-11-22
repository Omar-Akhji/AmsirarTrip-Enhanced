import languagesData from "../data/languages.json";

export const LOCALES = ["en", "fr", "de", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export type TextDirection = "ltr" | "rtl";

export const DEFAULT_LOCALE = "en";

export interface Language {
  readonly code: Locale;
  readonly dir: TextDirection;
  readonly name: string;
  readonly ogLocale: string;
  readonly shortName: string;
}

const RTL_LANGUAGE_CODES = new Set([
  "ar",
  "arc",
  "ckb",
  "dv",
  "fa",
  "ha",
  "he",
  "khw",
  "ks",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

export function isLocale(code: string): code is Locale {
  return (LOCALES as readonly string[]).includes(code);
}

export const NON_DEFAULT_LOCALES = ["fr", "de", "es"] as const;

export type NonDefaultLocale = (typeof NON_DEFAULT_LOCALES)[number];

export function isNonDefaultLocale(code: string): code is NonDefaultLocale {
  return (NON_DEFAULT_LOCALES as readonly string[]).includes(code);
}

export const LANGUAGES: readonly Language[] = languagesData.map((item) => {
  if (!isLocale(item.code)) {
    throw new Error(`Invalid locale code in languages.json: ${item.code}`);
  }
  const dir: TextDirection = item.dir === "rtl" ? "rtl" : "ltr";
  return {
    code: item.code,
    dir,
    name: item.name,
    ogLocale: item.ogLocale,
    shortName: item.shortName,
  };
});

export function getLocaleDirection(locale: string): TextDirection {
  const configured = LANGUAGES.find((l) => l.code === locale);
  if (configured) return configured.dir;
  const primarySubtag = locale.split(/[-_]/, 1)[0]?.toLowerCase() ?? "";
  return RTL_LANGUAGE_CODES.has(primarySubtag) ? "rtl" : "ltr";
}

export const OG_LOCALE_MAP: Readonly<Record<Locale, string>> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.ogLocale]),
) as Record<Locale, string>;

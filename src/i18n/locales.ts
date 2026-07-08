export const LOCALES = ["en", "fr", "de", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE = "en";

export type Language = { code: Locale; name: string; shortName: string };

export const LANGUAGES = [
  { code: "en", name: "English", shortName: "EN" },
  { code: "fr", name: "Français", shortName: "FR" },
  { code: "de", name: "Deutsch", shortName: "DE" },
  { code: "es", name: "Español", shortName: "ES" },
] as const satisfies readonly Language[];

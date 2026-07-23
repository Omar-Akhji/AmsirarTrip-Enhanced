import languagesData from "@/data/languages.json";

export const LOCALES = ["en", "fr", "de", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE = "en";

export type Language = { code: Locale; name: string; shortName: string };

export const LANGUAGES = languagesData as Language[];

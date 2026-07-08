import de from "../locales/de/common.json";
import en from "../locales/en/common.json";
import es from "../locales/es/common.json";
import fr from "../locales/fr/common.json";

import { type LocaleData, validateLocale } from "./schema";

export type { Locale } from "./locales";

/**
 * Locale objects cast to the schema type. Runtime `safeParse` validation in DEV/CI catches any
 * structural drift between the JSON files and the schema — the `as` cast bridges the small gap
 * between Astro's JSON-import type inference and Zod's inferred type.
 */
const _ui = {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- Astro JSON import inference and Zod's inferred type have no overlap; safeParse validates at runtime
  en: en as unknown as LocaleData,
  fr: fr,
  de: de,
  es: es,
} as const satisfies Record<string, LocaleData>;

// Run full schema validation in development/CI builds
if (import.meta.env.DEV || process.env["CI"]) {
  for (const [lang, data] of Object.entries(_ui)) {
    try {
      validateLocale(data, lang);
    } catch (error) {
      console.error(`[i18n] Locale "${lang}" failed validation:`, error);
    }
  }
}

export const ui = _ui;

export { DEFAULT_LOCALE as defaultLang } from "./locales";

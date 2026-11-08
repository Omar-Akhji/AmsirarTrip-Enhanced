import de from "../locales/de/common.json";
import en from "../locales/en/common.json";
import es from "../locales/es/common.json";
import fr from "../locales/fr/common.json";
import type { Locale } from "./locales";
import type { Messages } from "./types";

export type { MessageKey, Messages } from "./types";

/**
 * Locale dictionaries adhering strictly to the Messages shape inferred directly from
 * `en/common.json`. Compile-time static type verification ensures no structural drift between
 * languages.
 */
export const ui = { en, fr, de, es } as const satisfies Record<Locale, Messages>;

export { DEFAULT_LOCALE as defaultLang } from "./locales";

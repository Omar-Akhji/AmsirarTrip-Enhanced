import de from "../locales/de/common.json";
import en from "../locales/en/common.json";
import es from "../locales/es/common.json";
import fr from "../locales/fr/common.json";

export const defaultLang = "en";

export const ui = { en, fr, de, es } as const;

export type Locale = keyof typeof ui;

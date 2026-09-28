import { defaultLang, ui, type Locale } from "./ui";

const uiMap = new Map<string, unknown>(Object.entries(ui));

export interface TranslationFunction {
  (key: string, values?: string | Record<string, string | number>): string;
  raw: (key: string) => unknown;
  has: (key: string) => boolean;
}

function isLocale(key: string): key is Locale {
  return uiMap.has(key);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function useTranslations(locale: string): TranslationFunction {
  const currentLocale: Locale = isLocale(locale) ? locale : defaultLang;
  const translations = uiMap.get(currentLocale);

  function lookup(key: string): unknown {
    const keys = key.split(".");
    let result: unknown = translations;
    for (const k of keys) {
      if (isRecord(result) && Object.hasOwn(result, k)) {
        result = Reflect.get(result, k);
      } else {
        return undefined;
      }
    }
    return result;
  }

  function t(key: string, values?: string | Record<string, string | number>): string {
    const result = lookup(key);

    if (result === undefined) {
      return typeof values === "string" ? values : key;
    }

    if (typeof result !== "string" && typeof result !== "object" && !Array.isArray(result)) {
      return typeof values === "string" ? values : key;
    }

    if (typeof result === "string" && values && typeof values === "object") {
      let text: string = result;
      for (const [k, value] of Object.entries(values)) {
        text = text.replaceAll(`{${k}}`, () => String(value));
      }
      return text;
    }

    return typeof result === "string" ? result : key;
  }

  return Object.assign(t, {
    raw(key: string): unknown {
      return lookup(key);
    },
    has(key: string): boolean {
      return lookup(key) !== undefined;
    },
  });
}

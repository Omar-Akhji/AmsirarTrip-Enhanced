import { defaultLang, ui, type Locale } from "./ui";

const uiMap = new Map<string, unknown>(Object.entries(ui));

export function useTranslations(locale: string) {
  const currentLocale = (uiMap.has(locale) ? locale : defaultLang) as Locale;
  const translations = uiMap.get(currentLocale);

  function lookup(key: string): unknown {
    const keys = key.split(".");
    let result: unknown = translations;
    for (const k of keys) {
      if (result && typeof result === "object" && k in (result as Record<string, unknown>)) {
        result = Reflect.get(result as Record<string, unknown>, k);
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

    if (typeof result !== "string" && !Array.isArray(result) && typeof result !== "object") {
      return typeof values === "string" ? values : key;
    }

    if (typeof result === "string" && values && typeof values === "object") {
      let text: string = result;
      for (const [k, value] of Object.entries(values)) {
        text = text.replaceAll(`{${k}}`, String(value));
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

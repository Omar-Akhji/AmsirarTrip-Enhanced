import { DEFAULT_LOCALE as defaultLang, LOCALES } from "../../i18n/locales";

export function getGlobalLocale(): string {
  if (typeof window !== "undefined" && (window as any).__LOCALE__) {
    return (window as any).__LOCALE__;
  }
  if (typeof globalThis !== "undefined" && (globalThis as any).__LOCALE__) {
    return (globalThis as any).__LOCALE__;
  }
  if (typeof location !== "undefined") {
    const segment = location.pathname.split("/").find(Boolean);
    if (segment && (LOCALES as readonly string[]).includes(segment)) {
      return segment;
    }
  }
  return defaultLang;
}

export function useTranslation() {
  const locale = getGlobalLocale();

  function lookup(key: string): any {
    let translations: any = undefined;
    if (typeof window !== "undefined") {
      translations = (window as any).__TRANSLATIONS__;
    } else if (typeof globalThis !== "undefined") {
      translations = (globalThis as any).__TRANSLATIONS__;
    }

    if (!translations) return undefined;

    const keys = key.split(".");
    let result: any = translations;
    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
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
        text = text.replaceAll(`{${k}}`, () => String(value));
      }
      return text;
    }

    return typeof result === "string" ? result : key;
  }

  const tFunc = Object.assign(t, {
    raw(key: string): any {
      return lookup(key);
    },
    has(key: string): boolean {
      return lookup(key) !== undefined;
    },
  });

  return {
    t: tFunc,
    i18n: {
      language: locale,
      changeLanguage: () => {
        console.warn("Language changes should be done via routing, not programmatically.");
      },
    },
  };
}

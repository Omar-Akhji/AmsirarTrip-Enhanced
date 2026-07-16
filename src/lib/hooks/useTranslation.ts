import { DEFAULT_LOCALE as defaultLang, LOCALES } from "../../i18n/locales";

type TranslationMap = Record<string, unknown>;

interface AstroGlobals {
  __LOCALE__?: string;
  __TRANSLATIONS__?: TranslationMap;
}

function getAstroGlobals(): AstroGlobals {
  return globalThis as unknown as AstroGlobals;
}

export function getGlobalLocale(): string {
  if (typeof window !== "undefined") {
    const meta = document.querySelector('meta[name="app-locale"]');
    const content = meta?.getAttribute("content");
    if (content) return content;
  }
  const globals = getAstroGlobals();
  if (typeof window !== "undefined" && globals.__LOCALE__) {
    return globals.__LOCALE__;
  }
  if (typeof location !== "undefined") {
    const segment = location.pathname.split("/").find(Boolean);
    if (segment && (LOCALES as readonly string[]).includes(segment)) {
      return segment;
    }
  }
  return defaultLang;
}

let cachedTranslations: TranslationMap | undefined;

function lookup(key: string): unknown {
  let translations = cachedTranslations;

  if (!translations && typeof window !== "undefined") {
    const el = document.querySelector("#app-translations");
    const dataTranslations = (el as HTMLElement | null)?.dataset["translations"];
    if (dataTranslations) {
      try {
        translations = JSON.parse(dataTranslations) as TranslationMap;
        cachedTranslations = translations;
      } catch (error) {
        console.error("Failed to parse translations from data attribute:", error);
      }
    }
  }

  if (!translations) {
    translations = getAstroGlobals().__TRANSLATIONS__;
  }

  if (!translations) return undefined;

  const keys = key.split(".");
  let result: unknown = translations;
  for (const k of keys) {
    if (result && typeof result === "object" && k in (result as Record<string, unknown>)) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return result;
}

export function useTranslation() {
  const locale = getGlobalLocale();

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

  const tFunc = Object.assign(t, {
    raw(key: string): unknown {
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

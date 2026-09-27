import { DEFAULT_LOCALE as defaultLang, LOCALES } from "../../i18n/locales";

type TranslationMap = Record<string, unknown>;

declare global {
  var __LOCALE__: string | undefined;
  var __TRANSLATIONS__: TranslationMap | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getGlobalLocale(): string {
  if (typeof window !== "undefined") {
    const meta = document.querySelector('meta[name="app-locale"]');
    const content = meta?.getAttribute("content");
    if (content) return content;
  }
  if (typeof window !== "undefined" && globalThis.__LOCALE__) {
    return globalThis.__LOCALE__;
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

if (typeof document !== "undefined") {
  document.addEventListener("astro:before-swap", () => {
    cachedTranslations = undefined;
  });
}

function lookup(key: string): unknown {
  let translations = cachedTranslations;

  if (!translations && typeof window !== "undefined") {
    const el = document.querySelector("#app-translations");
    const jsonText = el?.textContent;
    if (jsonText) {
      try {
        const parsed: unknown = JSON.parse(jsonText);
        if (isRecord(parsed)) {
          translations = parsed;
          cachedTranslations = translations;
        }
      } catch (error) {
        console.error("Failed to parse translations from script tag:", error);
      }
    }
  }

  if (!translations) {
    translations = globalThis.__TRANSLATIONS__;
  }

  if (!translations) return undefined;

  const keys = key.split(".");
  let result: unknown = translations;
  for (const k of keys) {
    if (isRecord(result) && k in result) {
      result = result[k];
    } else {
      return undefined;
    }
  }
  return result;
}

export interface TranslationHelper {
  (key: string, values?: string | Record<string, string | number>): string;
  raw(key: string): unknown;
  has(key: string): boolean;
}

export interface UseTranslationReturn {
  t: TranslationHelper;
  i18n: { language: string; changeLanguage: () => void };
}

export function useTranslation(): UseTranslationReturn {
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

  const tFunc: TranslationHelper = Object.assign(t, {
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
      changeLanguage: (): void => {
        console.warn("Language changes should be done via routing, not programmatically.");
      },
    },
  };
}

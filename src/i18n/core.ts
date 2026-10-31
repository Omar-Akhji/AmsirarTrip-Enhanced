function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function lookupKey(tree: unknown, key: string): unknown {
  if (!tree) return undefined;
  const keys = key.split(".");
  let result: unknown = tree;
  for (const k of keys) {
    if (isRecord(result) && Object.hasOwn(result, k)) {
      result = Reflect.get(result, k);
    } else {
      return undefined;
    }
  }
  return result;
}

export interface TranslationFunction {
  (key: string, values?: string | Record<string, string | number>): string;
  raw: (key: string) => unknown;
  has: (key: string) => boolean;
}

export function createTranslationHelper(lookupFn: (key: string) => unknown): TranslationFunction {
  function t(key: string, values?: string | Record<string, string | number>): string {
    const result = lookupFn(key);

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
      return lookupFn(key);
    },
    has(key: string): boolean {
      return lookupFn(key) !== undefined;
    },
  });
}

export function parseStringArray(value: unknown): readonly string[] {
  return Array.isArray(value) && value.every((item): item is string => typeof item === "string") ?
      value
    : [];
}

import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";

/**
 * Strips the leading locale prefix (e.g. "/fr/tours" -> "/tours", "/de" -> "/"). Returns a
 * normalized path starting with "/" and without a trailing slash (unless root "/").
 */
export function stripLocaleFromPath(pathname: string): string {
  const segments = pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  if (segments[0] && isLocale(segments[0])) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

/**
 * Builds a localized path for a target locale from an arbitrary pathname. If targetLocale is
 * DEFAULT_LOCALE ("en"), returns the un-prefixed base path.
 */
export function getLocalizedPath(pathname: string, targetLocale: Locale): string {
  const clean = stripLocaleFromPath(pathname);
  if (targetLocale === DEFAULT_LOCALE) {
    return clean;
  }
  return clean === "/" ? `/${targetLocale}` : `/${targetLocale}${clean}`;
}

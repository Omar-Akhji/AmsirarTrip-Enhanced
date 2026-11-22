import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";
import type { MessageKey } from "./types";

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
  (key: MessageKey | (string & {}), values?: string | Record<string, string | number>): string;
  has: (key: string) => boolean;
  raw: (key: string) => unknown;
}

function createPluralRules(locale: string): Intl.PluralRules | null {
  try {
    return new Intl.PluralRules(locale);
  } catch {
    return null;
  }
}

function createNumberFormat(locale: string): Intl.NumberFormat | null {
  try {
    return new Intl.NumberFormat(locale);
  } catch {
    return null;
  }
}

export function createTranslationHelper(
  lookupFn: (key: string) => unknown,
  fallbackLookupFn?: (key: string) => unknown,
  currentLocale: string = DEFAULT_LOCALE,
): TranslationFunction {
  const pluralRules = createPluralRules(currentLocale);
  const numberFormat = createNumberFormat(currentLocale);

  function resolvePluralValue(key: string, count: number): unknown {
    if (!pluralRules) return undefined;
    const pluralForm = pluralRules.select(count);
    return (
      lookupFn(`${key}_${pluralForm}`)
      ?? lookupFn(`${key}_other`)
      ?? fallbackLookupFn?.(`${key}_${pluralForm}`)
      ?? fallbackLookupFn?.(`${key}_other`)
    );
  }

  function t(
    key: MessageKey | (string & {}),
    values?: string | Record<string, string | number>,
  ): string {
    let result: unknown;

    // Pluralization support: if values is an object with a numeric "count"
    if (values && typeof values === "object" && typeof values["count"] === "number") {
      result = resolvePluralValue(key, values["count"]);
    }

    result ??= lookupFn(key) ?? fallbackLookupFn?.(key);

    if (result === undefined) {
      return typeof values === "string" ? values : key;
    }

    if (typeof result !== "string" && typeof result !== "object" && !Array.isArray(result)) {
      return typeof values === "string" ? values : key;
    }

    if (typeof result === "string" && values && typeof values === "object") {
      let text: string = result;
      for (const [k, value] of Object.entries(values)) {
        const formatted =
          typeof value === "number" && numberFormat ? numberFormat.format(value) : String(value);
        text = text.replaceAll(`{${k}}`, () => formatted);
      }
      return text;
    }

    return typeof result === "string" ? result : key;
  }

  return Object.assign(t, {
    raw(key: string): unknown {
      return lookupFn(key) ?? fallbackLookupFn?.(key);
    },
    has(key: string): boolean {
      return (
        lookupFn(key) !== undefined
        || fallbackLookupFn?.(key) !== undefined
        || lookupFn(`${key}_other`) !== undefined
        || fallbackLookupFn?.(`${key}_other`) !== undefined
      );
    },
  });
}

export function parseStringArray(value: unknown): readonly string[] {
  return Array.isArray(value) && value.every((item): item is string => typeof item === "string") ?
      value
    : [];
}

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

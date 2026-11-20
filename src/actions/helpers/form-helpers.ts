import type { FormState } from "@/lib/form-types";
import { logger } from "@/services/logger";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};

export function getLanguageName(code = ""): string {
  return Object.hasOwn(LANGUAGE_NAMES, code) ? (LANGUAGE_NAMES[code] ?? code) : code;
}

export function cleanReservationType(type = ""): string {
  return type
    .replace(/^Tour\d+\s*/i, "")
    .replace(/\s*-\s*Duration:\s*\d+\s*Days?/i, "")
    .trim();
}

export function escapeHtml(string_ = ""): string {
  return string_
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function sanitizeHeaderValue(value = "", maxLength = 120): string {
  return value
    .replaceAll(/[\r\n\0\v\f]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function getOptionalFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function extractZodErrors(
  issues: readonly {
    readonly path: readonly (string | number | symbol)[];
    readonly message: string;
  }[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const error of issues) {
    const [firstSegment] = error.path;
    if (typeof firstSegment === "string") {
      errors[firstSegment] = error.message;
    }
  }
  return errors;
}

export function createErrorResponse(
  error: unknown,
  context: string,
  genericMessage = "An unexpected error occurred. Please try again.",
): FormState {
  logger.error(`${context} error`, error);
  return { success: false, message: genericMessage };
}

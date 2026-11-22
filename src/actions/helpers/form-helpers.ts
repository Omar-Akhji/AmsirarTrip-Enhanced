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

export function resolveSubmittedPhone(formData: FormData): string {
  const full = getFormString(formData, "phone").trim();
  if (full.length > 0) return full;

  const countryCode = getFormString(formData, "phoneCountryCode").trim();
  const national = getFormString(formData, "phoneNational").trim();
  if (national.length === 0) return "";
  return countryCode.length > 0 ? `${countryCode}${national}` : national;
}

export function resolveTurnstileToken(formData: FormData): string {
  const token = getFormString(formData, "recaptchaToken").trim();
  return token.length > 0 ? token : getFormString(formData, "cf-turnstile-response").trim();
}

export function resolveContactTopic(formData: FormData): string | undefined {
  return getOptionalFormString(formData, "topicCustom") ?? getOptionalFormString(formData, "topic");
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

export function toInitialFormState(
  result:
    | {
        readonly data?: FormState | undefined;
        readonly error?: { readonly message?: string | undefined } | undefined;
      }
    | undefined,
  fallbackError: string,
): FormState | null {
  if (!result) return null;
  if (result.data) return result.data;
  const msg = result.error?.message;
  return { success: false, message: msg && msg.length > 0 ? msg : fallbackError };
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};

export function getLanguageName(code = ""): string {
  return LANGUAGE_NAMES[code] ?? code;
}

export function cleanReservationType(type = ""): string {
  return type
    .replace(/^Tour\d+\s*/i, "")
    .replace(/\s*-\s*Duration:\s*\d+\s*Days?/i, "")
    .trim();
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
  return typeof value === "string" && value.length > 0 ? value : undefined;
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

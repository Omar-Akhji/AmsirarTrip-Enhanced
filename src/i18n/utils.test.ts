import { describe, expect, it } from "vitest";
import { useTranslations } from "./utils";

describe("useTranslations", () => {
  it("returns a translation function for a valid locale", () => {
    const t = useTranslations("en");
    expect(typeof t).toBe("function");
  });

  it("falls back to default locale for unknown locale", () => {
    const t = useTranslations("xx");
    const en = useTranslations("en");
    expect(t("home.title")).toBe(en("home.title"));
  });

  it("resolves nested keys", () => {
    const t = useTranslations("en");
    expect(typeof t("home.title")).toBe("string");
  });

  it("returns fallback string for missing keys", () => {
    const t = useTranslations("en");
    expect(t("nonexistent.key", "fallback")).toBe("fallback");
  });

  it("returns the key itself when no fallback provided", () => {
    const t = useTranslations("en");
    expect(t("nonexistent.key")).toBe("nonexistent.key");
  });

  it("supports raw() method", () => {
    const t = useTranslations("en");
    expect(t.raw("home.title")).toBeDefined();
  });

  it("supports has() method", () => {
    const t = useTranslations("en");
    expect(t.has("home.title")).toBe(true);
    expect(t.has("nonexistent.key")).toBe(false);
  });

  it("supports string interpolation", () => {
    const t = useTranslations("en");
    const result = t("nonexistent", { name: "test" });
    expect(result).toBe("nonexistent");
  });
});

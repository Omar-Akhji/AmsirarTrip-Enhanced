import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLocalizedPath, parseStringArray, stripLocaleFromPath } from "@/i18n/core";
import { isLocale } from "@/i18n/locales";
import { useTranslations } from "@/i18n/utils";

void describe("i18n locales and routing", () => {
  void it("validates supported locales strictly", () => {
    assert.equal(isLocale("en"), true);
    assert.equal(isLocale("fr"), true);
    assert.equal(isLocale("de"), true);
    assert.equal(isLocale("es"), true);
    assert.equal(isLocale("it"), false);
    assert.equal(isLocale("toString"), false);
  });

  void it("strips and builds localized URLs symmetrically", () => {
    assert.equal(stripLocaleFromPath("/fr/tours"), "/tours");
    assert.equal(stripLocaleFromPath("/de"), "/");
    assert.equal(getLocalizedPath("/fr/tours", "en"), "/tours");
    assert.equal(getLocalizedPath("/tours", "es"), "/es/tours");
    assert.equal(getLocalizedPath("/", "de"), "/de");
  });
});

void describe("useTranslations", () => {
  void it("resolves keys, interpolates placeholders, and falls back to English for missing keys", () => {
    const tFr = useTranslations("fr");
    assert.ok(tFr("nav.tours").length > 0);
    assert.equal(tFr.has("nav.tours"), true);
    assert.equal(tFr.has("nonexistent.key"), false);
    assert.equal(tFr("nonexistent.key", "Custom Fallback"), "Custom Fallback");
    assert.equal(tFr("__proto__.polluted"), "__proto__.polluted");
    assert.equal(tFr("excursion.common.distance", { value: "130 km" }).includes("130 km"), true);
  });

  void it("reads string arrays safely with parseStringArray", () => {
    const tEn = useTranslations("en");
    const items = parseStringArray(tEn.raw("tours.sidebar.items"));
    assert.ok(items.length > 0);
    assert.deepEqual(parseStringArray(["ok", 42]), []);
    assert.deepEqual(parseStringArray(null), []);
  });
});

import { expect, test } from "@playwright/test";

const LOCALES = ["en", "fr", "de", "es"] as const;

test.describe("i18n routing & document standards", () => {
  for (const locale of LOCALES) {
    const path = locale === "en" ? "/" : `/${locale}`;

    test(`renders root page for locale [${locale}] with correct html lang and hreflang links`, async ({
      page,
    }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);

      const htmlLang = await page.locator("html").getAttribute("lang");
      expect(htmlLang).toBe(locale);

      // Verify hreflang tags
      const hreflangs = page.locator('link[rel="alternate"][hreflang]');
      const count = await hreflangs.count();
      // Expect 4 locales + 1 x-default
      expect(count).toBe(5);
    });
  }

  test("unknown locale returns 404", async ({ page }) => {
    const response = await page.goto("/xx/about", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);
  });

  test("default locale prefix (/en/about) redirects to canonical (/about)", async ({ page }) => {
    await page.goto("/en/about", { waitUntil: "domcontentloaded" });
    // Either redirected response or landed on /about
    expect(page.url()).not.toContain("/en/about");
    expect(new URL(page.url()).pathname).toBe("/about");
  });

  test("localized contact page (/fr/contact) renders localized strings and no English sentinels", async ({
    page,
  }) => {
    const response = await page.goto("/fr/contact", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);

    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBe("fr");

    const content = await page.content();
    // French translation of "Visit" is "Visite" or "Rendez-nous visite"
    expect(content).toContain("Visite");
    // English sentinels should not appear
    expect(content).not.toContain("Alternative Morocco Circuits");
  });

  test("localized missing tour slug preserves locale on 404 rewrite", async ({ page }) => {
    const response = await page.goto("/fr/tours/non-existent-slug", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(404);
    expect(await page.locator("html").getAttribute("lang")).toBe("fr");
  });

  test("localized tour detail (/fr/tours/merzouga-desert-adventure-3-days) renders French content without English UI sentinels", async ({
    page,
  }) => {
    const response = await page.goto("/fr/tours/merzouga-desert-adventure-3-days", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);
    expect(await page.locator("html").getAttribute("lang")).toBe("fr");

    const content = await page.content();
    const bodyText = await page.locator("body").innerText();
    expect(content).toContain("Aventure dans le désert de Merzouga");
    expect(content).toContain("JOUR 1");

    for (const sentinel of [
      "1ST DAY",
      "Trip Highlights",
      "Included Services",
      "Out-of-Pocket Costs",
      "Practical Travel Advice",
      "Rates & Reservations",
      "Personal Driver & 4x4",
      "Inquire via WhatsApp",
      "Google Maps Route",
      "Common Questions",
    ]) {
      expect(bodyText).not.toContain(sentinel);
    }
  });

  test("localized excursion detail (/fr/excursions/agafay-desert-sunset) renders French content without English UI sentinels", async ({
    page,
  }) => {
    const response = await page.goto("/fr/excursions/agafay-desert-sunset", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);
    expect(await page.locator("html").getAttribute("lang")).toBe("fr");

    const content = await page.content();
    const bodyText = await page.locator("body").innerText();
    expect(content).toContain("Coucher de soleil à Agafay");

    for (const sentinel of [
      "Pickup Window",
      "Elevation / Setting",
      "Trip Highlights",
      "Included Services",
      "Out-of-Pocket Costs",
      "Practical Travel Advice",
      "Rates & Reservations",
      "Google Maps Route",
      "Common Questions",
    ]) {
      expect(bodyText).not.toContain(sentinel);
    }
  });
});

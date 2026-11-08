import { expect, test } from "@playwright/test";

const LOCALES = ["en", "fr", "de", "es"] as const;

test.describe("i18n routing & document standards", () => {
  for (const locale of LOCALES) {
    const path = locale === "en" ? "/" : `/${locale}`;

    test(`renders root page for locale [${locale}] with correct html lang and hreflang links`, async ({
      page,
    }) => {
      const response = await page.goto(path);
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
    const response = await page.goto("/xx/about");
    expect(response?.status()).toBe(404);
  });

  test("default locale prefix (/en/about) redirects to canonical (/about)", async ({ page }) => {
    await page.goto("/en/about");
    // Either redirected response or landed on /about
    expect(page.url()).not.toContain("/en/about");
    expect(new URL(page.url()).pathname).toBe("/about");
  });
});

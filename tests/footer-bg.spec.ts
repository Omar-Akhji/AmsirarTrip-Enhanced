import { expect, test } from "@playwright/test";

test.describe("Footer styling", () => {
  test("footer should have slate-950 background", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toHaveClass(/bg-slate-950/);
  });
});

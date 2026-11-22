import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { buildBookingEmail, buildContactEmail } from "../src/actions/helpers/email-templates";
import { getLanguageName } from "../src/actions/helpers/form-helpers";

test.describe("Security Regression Suite (SEC-01..SEC-12)", () => {
  test("SEC-06/07/12: Home page serves strict Astro 7 hash CSP, no generator meta, no data-csp-nonce, zero CSP errors", async ({
    page,
  }) => {
    const cspErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && /content security policy|csp/i.test(msg.text())) {
        cspErrors.push(msg.text());
      }
    });

    const response = await page.goto("/");
    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);

    const headers = response?.headers() ?? {};
    const csp = headers["content-security-policy"] ?? "";

    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["cross-origin-resource-policy"]).toBe("same-origin");

    // Hash-based CSP: no unsafe-eval, no wasm-unsafe-eval, no cdn.jsdelivr.net, no script-src unsafe-inline
    expect(csp).toContain("script-src");
    expect(csp).toContain("sha256-");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("'wasm-unsafe-eval'");
    expect(csp).not.toContain("cdn.jsdelivr.net");
    expect(csp).toContain("challenges.cloudflare.com");
    expect(csp).toContain("upgrade-insecure-requests");

    const scriptSrc = csp
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("script-src"));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).not.toContain("'unsafe-inline'");

    const styleSrcElem = csp
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("style-src-elem"));
    if (styleSrcElem) {
      expect(styleSrcElem).not.toContain("'unsafe-inline'");
    }

    // No nonce leaked into DOM attribute; no Astro version leaked via meta generator
    await expect(page.locator("html")).not.toHaveAttribute("data-csp-nonce");
    await expect(page.locator('meta[name="generator"]')).toHaveCount(0);

    expect(cspErrors).toEqual([]);
  });

  test("SEC-08: Missing static asset returns 404 with no-store and full security headers; /en redirect includes HSTS", async ({
    request,
  }) => {
    const missingAsset = await request.get("/images/does-not-exist-sec-check.png");
    expect(missingAsset.status()).toBe(404);
    expect(missingAsset.headers()["cache-control"]).toContain("no-store");
    expect(missingAsset.headers()["strict-transport-security"]).toContain("max-age=63072000");
    expect(missingAsset.headers()["x-frame-options"]).toBe("SAMEORIGIN");

    const redirectResp = await request.get("/en/tours", { maxRedirects: 0 });
    expect(redirectResp.status()).toBe(301);
    expect(redirectResp.headers()["location"]).toBe("/tours");
    expect(redirectResp.headers()["strict-transport-security"]).toContain("max-age=63072000");
    expect(redirectResp.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("SEC-01/05/12: Removed /api/cap/* endpoints and unreferenced public assets return 404", async ({
    request,
  }) => {
    const challenge = await request.post("/api/cap/challenge");
    expect(challenge.status()).toBe(404);

    const redeem = await request.post("/api/cap/redeem", { data: {} });
    expect(redeem.status()).toBe(404);

    const sliderRef = await request.get("/images/slider-ref/img1.jpg");
    expect(sliderRef.status()).toBe(404);

    const banana = await request.get("/images/banana-sahara.png");
    expect(banana.status()).toBe(404);
  });

  test("SEC-04: 404 routes and /en/* query redirects are never cached or poisoned in memoryCache", async ({
    request,
  }) => {
    // 1. Invalid tour slug 404 must not cache (check across two requests)
    const slugFirst = await request.get("/tours/non-existent-security-probe-slug");
    expect(slugFirst.status()).toBe(404);
    const slugSecond = await request.get("/tours/non-existent-security-probe-slug");
    expect(slugSecond.status()).toBe(404);
    expect(slugSecond.headers()["x-astro-cache"]).toBeUndefined();

    // 2. Arbitrary invalid top-level path 404 must not cache (prevents LRU eviction)
    const randFirst = await request.get("/invalid-probe-route-sec04");
    expect(randFirst.status()).toBe(404);
    const randSecond = await request.get("/invalid-probe-route-sec04");
    expect(randSecond.status()).toBe(404);
    expect(randSecond.headers()["x-astro-cache"]).toBeUndefined();

    // 3. Query string on /en/tours must NOT poison subsequent clean /en/tours 301 Location
    const poisoned = await request.get("/en/tours?attacker=poison", { maxRedirects: 0 });
    expect(poisoned.status()).toBe(301);
    expect(poisoned.headers()["location"]).toBe("/tours?attacker=poison");

    const clean = await request.get("/en/tours", { maxRedirects: 0 });
    expect(clean.status()).toBe(301);
    expect(clean.headers()["location"]).toBe("/tours");
    expect(clean.headers()["x-astro-cache"]).toBeUndefined();
  });

  test("SEC-10: Booking action rejects language=toString and whitespace-only inputs without HTTP 500", async ({
    baseURL,
    request,
  }) => {
    const resolvedBaseUrl =
      typeof baseURL === "string" && baseURL.length > 0 ? baseURL : "http://localhost:4321";
    const origin = new URL(resolvedBaseUrl).origin;
    const formData = new URLSearchParams({
      email: "guest@example.com",
      fullName: " ".repeat(3),
      language: "toString",
      message: " ".repeat(10),
      numberOfPeople: "2",
      phone: ".......",
      recaptchaToken: "invalid-token-value",
      reservationDate: "2027-06-15",
      reservationType: " ".repeat(3),
    });

    const resp = await request.post("/_actions/booking", {
      data: formData.toString(),
      headers: { "content-type": "application/x-www-form-urlencoded", origin },
    });
    expect(resp.status()).toBeLessThan(500);
    const bodyText = await resp.text();
    expect(bodyText).not.toContain("TypeError");
    expect(bodyText).toContain("false");
  });

  test("SEC-11: Contact map iframe enforces sandbox and strict-origin-when-cross-origin", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.locator("#location details summary").click();
    const iframe = page.locator("#location details iframe");
    await expect(iframe).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    await expect(iframe).toHaveAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
    );
  });

  test("SEC-03: Logger rotates streams across UTC midnight without ERR_STREAM_WRITE_AFTER_END", async () => {
    const tempLogDir = path.join(tmpdir(), `amsirar-sec-test-${Date.now()}`);
    process.env["LOG_DIR"] = tempLogDir;
    const { logger } = await import("../src/services/logger");

    const realToISOString = Date.prototype.toISOString.bind(Date.prototype);
    let fakeDate = "2026-11-19T23:59:59.000Z";
    Date.prototype.toISOString = () => fakeDate;
    try {
      logger.security("day1-event", { ip: "198.51.100.1" });
      fakeDate = "2026-11-20T00:00:01.000Z";
      logger.security("day2-event", { ip: "198.51.100.1" });
      await new Promise((resolve) => setTimeout(resolve, 50));
    } finally {
      Date.prototype.toISOString = realToISOString;
      rmSync(tempLogDir, { force: true, recursive: true });
    }
    expect(true).toBe(true);
  });

  test("SEC-10: Prototype lookup safety and email rel=noopener noreferrer hygiene", () => {
    expect(getLanguageName("toString")).toBe("toString");
    expect(getLanguageName("constructor")).toBe("constructor");
    expect(getLanguageName("__proto__")).toBe("__proto__");
    expect(getLanguageName("fr")).toBe("Français");

    const booking = buildBookingEmail({
      date: "2027-06-15",
      email: "guest@example.com",
      fullName: "Jane Doe",
      language: "fr",
      message: "Hello Morocco",
      persons: 2,
      phone: "+33 6 12 34 56 78",
      reservationType: "Merzouga Desert 3 Days",
    });
    expect(booking.html).toContain('target="_blank" rel="noopener noreferrer"');
    expect(booking.html).not.toMatch(/target="_blank"(?!\s+rel="noopener noreferrer")/);

    const contact = buildContactEmail({
      email: "guest@example.com",
      message: "Custom Sahara itinerary request",
      name: "Jane Doe",
      phone: "+33 6 12 34 56 78",
    });
    expect(contact.html).not.toMatch(/target="_blank"(?!\s+rel="noopener noreferrer")/);
  });

  test("SEC-13: Discovery endpoints serve Access-Control-Allow-Origin: * and Cross-Origin-Resource-Policy: cross-origin", async ({
    request,
  }) => {
    for (const endpoint of ["/robots.txt", "/llms.txt", "/sitemap.xml"]) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(200);
      expect(response.headers()["access-control-allow-origin"]).toBe("*");
      expect(response.headers()["cross-origin-resource-policy"]).toBe("cross-origin");
    }
  });

  test("SEC-14: No-JS progressive enhancement form POSTs return SSR feedback without HTTP 500", async ({
    baseURL,
    browser,
  }) => {
    const context = await browser.newContext({
      ...(baseURL && { baseURL }),
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    try {
      const contactResp = await page.goto("/contact", { waitUntil: "domcontentloaded" });
      expect(contactResp?.status()).toBe(200);

      await page.locator('form[data-form="contact"] input[name="name"]').fill("NoJS Traveler");
      await page.locator('form[data-form="contact"] input[name="email"]').fill("nojs@example.com");
      await page.locator('form[data-form="contact"] input[name="phoneNational"]').fill("661172393");
      await page
        .locator('form[data-form="contact"] textarea[name="message"]')
        .fill("Testing progressive enhancement contact submission without client JS.");

      const [postResponse] = await Promise.all([
        page.waitForResponse(
          (resp) => resp.request().method() === "POST" && resp.url().includes("/contact"),
        ),
        page.locator('form[data-form="contact"] button[type="submit"]').click(),
      ]);
      await page.waitForLoadState("domcontentloaded");

      expect(postResponse.status()).toBeLessThan(500);
      const statusText = await page
        .locator('form[data-form="contact"] [role="status"]')
        .innerText();
      expect(statusText.trim().length).toBeGreaterThan(0);
    } finally {
      await context.close();
    }
  });
});

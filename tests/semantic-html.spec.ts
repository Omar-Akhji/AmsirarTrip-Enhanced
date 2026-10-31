import { test, expect } from "@playwright/test";

test.describe("Semantic HTML 2026 Modernization", () => {
  test("Task 1: document head contains modern 2026 boilerplate requirements", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const colorScheme = page.locator('meta[name="color-scheme"]');
    await expect(colorScheme).toHaveAttribute("content", "light dark");

    const heroPreload = page.locator('link[rel="preload"][as="image"]');
    await expect(heroPreload).toHaveAttribute("fetchpriority", "high");
  });

  test("Task 2: landmarks are valid - single main and no nested/duplicated nav landmarks", async ({
    page,
  }) => {
    // 1. Home page navbar structure
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const mainNavbars = page.locator("nav#main-navbar");
    await expect(mainNavbars).toHaveCount(0); // #main-navbar should be a div inside header, not a nav
    const desktopNav = page.locator("nav#desktop-nav");
    await expect(desktopNav).toHaveCount(1);
    await expect(desktopNav).toHaveAttribute("aria-label", /Main Navigation/);

    // No <nav> should be nested inside another <nav>
    const nestedNavs = page.locator("nav nav");
    await expect(nestedNavs).toHaveCount(0);

    // 2. Legal pages have exactly one main landmark
    await page.goto("/en/privacy-policy", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveCount(1);

    await page.goto("/en/terms", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("Task 3: testimonials use figure, blockquote, and figcaption, avoiding cite for author names", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // WHATWG forbids <cite> for author names; check that no <cite> tag is used
    const citeTags = page.locator("cite");
    await expect(citeTags).toHaveCount(0);

    // Testimonials should use <figure> containing <blockquote> and <figcaption>
    const testimonialFigures = page.locator("section#testimonials figure");
    const count = await testimonialFigures.count();
    expect(count).toBeGreaterThan(0);

    const firstFigure = testimonialFigures.first();
    await expect(firstFigure.locator("blockquote")).toHaveCount(1);
    await expect(firstFigure.locator("figcaption")).toHaveCount(1);
  });

  test("Task 4: itineraries use ordered lists, metadata uses dl/dt/dd, and FAQs use exclusive details name", async ({
    page,
  }) => {
    // 1. Check TripCard on /tours page
    await page.goto("/tours", { waitUntil: "domcontentloaded" });
    const tripCardDls = page.locator("article dl");
    const dlCount = await tripCardDls.count();
    expect(dlCount).toBeGreaterThan(0);

    // 2. Check Tour page
    await page.goto("/tours/merzouga-desert-adventure-3-days", { waitUntil: "domcontentloaded" });

    // Top specs DL
    const tourSpecsDl = page.locator("dl dt");
    expect(await tourSpecsDl.count()).toBeGreaterThan(0);

    // Itinerary OL and LI
    const itineraryOl = page.locator("ol.itinerary-stages-list");
    await expect(itineraryOl).toHaveCount(1);
    const stages = itineraryOl.locator("li");
    expect(await stages.count()).toBeGreaterThan(0);

    // FAQ details name attribute for native exclusive accordion
    const faqDetails = page.locator("details[name='tour-faq']");
    expect(await faqDetails.count()).toBeGreaterThan(0);
  });

  test("Task 5: section structures and heading hierarchy are semantic and accessible", async ({
    page,
  }) => {
    // 1. Services section headings
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const servicesH2 = page.locator("section#services h2");
    await expect(servicesH2).toHaveCount(1);
    const servicesH4 = page.locator("section#services h4");
    await expect(servicesH4).toHaveCount(0); // Pillars should be h3, not h4
    const servicesH3 = page.locator("section#services h3");
    expect(await servicesH3.count()).toBe(3); // 3 service cards

    // 2. TourInfo sections on tour page
    await page.goto("/tours/merzouga-desert-adventure-3-days", { waitUntil: "domcontentloaded" });
    const includedSection = page.locator("section[aria-labelledby='tour-included-heading']");
    await expect(includedSection).toHaveCount(1);
  });

  test("Task 6: dates use semantic time tag with datetime attribute and tables have caption and scope", async ({
    page,
  }) => {
    // 1. Privacy policy dates and table
    await page.goto("/privacy-policy", { waitUntil: "domcontentloaded" });
    const timeTag = page.locator("time[datetime]");
    expect(await timeTag.count()).toBeGreaterThan(0);

    const tableCaption = page.locator("table caption");
    await expect(tableCaption).toHaveCount(1);

    const colHeaders = page.locator("table th[scope='col']");
    expect(await colHeaders.count()).toBeGreaterThan(0);

    // 2. Terms of service dates
    await page.goto("/terms-of-service", { waitUntil: "domcontentloaded" });
    const termsTime = page.locator("time[datetime]");
    expect(await termsTime.count()).toBeGreaterThan(0);
  });

  test("Task 7: forms use semantic fieldsets, legends, and outputs for status updates", async ({
    page,
  }) => {
    // 1. Contact page form fieldsets
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    const contactFieldsets = page.locator("form[data-form='contact'] fieldset");
    expect(await contactFieldsets.count()).toBeGreaterThan(0);
    const contactLegends = page.locator("form[data-form='contact'] fieldset legend");
    expect(await contactLegends.count()).toBeGreaterThan(0);

    // 2. Booking form fieldsets on tour page
    await page.goto("/tours/merzouga-desert-adventure-3-days", { waitUntil: "domcontentloaded" });
    const bookingFieldsets = page.locator("form[data-form='booking'] fieldset");
    expect(await bookingFieldsets.count()).toBeGreaterThan(0);
    const bookingLegends = page.locator("form[data-form='booking'] fieldset legend");
    expect(await bookingLegends.count()).toBeGreaterThan(0);
  });

  test("Task 8: video preserves native semantics and cookie notification uses semantic aside", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Video should not override its ARIA role with button
    const videoWithButtonRole = page.locator("video[role='button']");
    await expect(videoWithButtonRole).toHaveCount(0);

    // Cookie banner should be an aside element
    const cookieAside = page.locator("aside#cookie-banner");
    await expect(cookieAside).toHaveCount(1);
  });
});

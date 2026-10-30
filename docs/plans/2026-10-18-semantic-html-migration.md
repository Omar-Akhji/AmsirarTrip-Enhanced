# Semantic HTML 2026 Modernization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task.

**Goal:** Transform the AmsirarTrip codebase into fully semantic, accessible HTML conforming to the
June 2026 HTML Living Standard specifications detailed in `semantic Html.md`.

**Architecture:** Audit and systematically upgrade Document Boilerplate (`<head>`,
`<meta color-scheme>`, preloads), Landmark Hierarchy (eliminate nested `<main>` and duplicated
`<nav>` labels), Content Semantics (convert key-value metadata to `<dl>`, chronological itineraries
to `<ol>`, citations to `<figure>/<blockquote>/<figcaption>`, dates to `<time>`), Form Controls
(group with `<fieldset>/<legend>`, `<output>`, cleanup redundant ARIA), and Declarative 2026 UI
(`<details name="...">` exclusive accordions, `<dialog>` modals).

**Tech Stack:** Astro 7.4 (SSR & Content Collections), Vue 3.5, TypeScript 6.0, Tailwind CSS v4,
Playwright.

---

### Task 1: Document Head & Global Boilerplate Modernization

**Files:**

- Modify: `src/layouts/Layout.astro:48-230`
- Modify: `src/shared/layout/PageHeader.astro:37-47`
- Test: `tests/semantic-html.spec.ts`

**Step 1: Write the failing test** In `tests/semantic-html.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("document head contains modern 2026 boilerplate requirements", async ({ page }) => {
  await page.goto("/");
  const colorScheme = page.locator('meta[name="color-scheme"]');
  await expect(colorScheme).toHaveAttribute("content", "light dark");

  const heroPreload = page.locator('link[rel="preload"][as="image"]');
  await expect(heroPreload).toHaveAttribute("fetchpriority", "high");
});
```

**Step 2: Run test to verify it fails** Run: `bun run test:e2e tests/semantic-html.spec.ts`
Expected: FAIL (missing `meta[name="color-scheme"]` and `fetchpriority="high"`).

**Step 3: Implement minimal changes in `Layout.astro` and `PageHeader.astro`** In
`src/layouts/Layout.astro`:

```astro
<!-- Add color-scheme meta tag right after viewport -->
<meta
  content="light dark"
  name="color-scheme"
/>

<!-- Add fetchpriority="high" to hero image preload -->
<link
  as="image"
  fetchpriority="high"
  href="/images/Header/header-1.webp"
  rel="preload"
  type="image/webp"
/>
```

In `src/shared/layout/PageHeader.astro`:

```astro
{bgImage ?
  <Image
    alt=""
    class="absolute inset-0 -z-30 size-full object-cover"
    decoding="async"
    fetchpriority="high"
    height={1280}
    loading="eager"
    src={bgImage as string}
    width={1920}
  />
: null}
```

**Step 4: Run test and typecheck to verify it passes** Run:
`bun run test:e2e tests/semantic-html.spec.ts && bun run check` Expected: PASS with 0 errors.

**Step 5: Commit**

```bash
git add src/layouts/Layout.astro src/shared/layout/PageHeader.astro tests/semantic-html.spec.ts
git commit -m "feat(seo): add color-scheme meta tag and fetchpriority to LCP image preloads"
```

---

### Task 2: Eliminate Landmark Violations (Nested `<main>` & Duplicate `<nav>`)

**Files:**

- Modify: `src/features/legal/components/PrivacyView.astro:815,1229`
- Modify: `src/features/legal/components/TermsView.astro:684,1048`
- Modify: `src/shared/layout/Navbar.astro:34-104`
- Test: `tests/semantic-html.spec.ts`

**Step 1: Write the failing test** In `tests/semantic-html.spec.ts`:

```typescript
test("pages contain exactly one <main> landmark and no duplicate <nav aria-label>", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/privacy-policy",
    "/terms-of-service",
    "/about",
    "/contact",
    "/tours",
  ]) {
    await page.goto(path);
    const mainCount = await page.locator("main").count();
    expect(mainCount).toBe(1);

    const mainNavs = await page.locator('nav[aria-label="Main Navigation"]').count();
    expect(mainNavs).toBeLessThanOrEqual(1);
  }
});
```

**Step 2: Run test to verify it fails** Run: `bun run test:e2e tests/semantic-html.spec.ts`
Expected: FAIL on `/privacy-policy` and `/terms-of-service` (count = 2 mains), and on `/` (multiple
main navigation landmarks).

**Step 3: Implement minimal changes**

1. In `src/features/legal/components/PrivacyView.astro`: Change line 815
   `<main class="relative bg-stone-50/70 text-slate-900 transition-colors print:bg-white print:text-black">`
   to
   `<div class="relative bg-stone-50/70 text-slate-900 transition-colors print:bg-white print:text-black">`
   and line 1229 `</main>` to `</div>`.

2. In `src/features/legal/components/TermsView.astro`: Change line 684
   `<main class="relative bg-stone-50/70 text-slate-900 transition-colors print:bg-white print:text-black">`
   to
   `<div class="relative bg-stone-50/70 text-slate-900 transition-colors print:bg-white print:text-black">`
   and closing `</main>` to `</div>`.

3. In `src/shared/layout/Navbar.astro`: Change outer wrapper around the desktop and mobile
   navigation from `<nav aria-label="...">` to
   `<div class="group fixed inset-s-1/2 top-2 z-50 translate-x-[-50%] rounded-2xl ...">` so that
   only the inner desktop links container `#desktop-nav` is the landmark
   `<nav aria-label={t("nav.mainAria", "Main Navigation")}>`.

**Step 4: Run test to verify it passes** Run:
`bun run test:e2e tests/semantic-html.spec.ts && bun run check` Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/legal/components/PrivacyView.astro src/features/legal/components/TermsView.astro src/shared/layout/Navbar.astro tests/semantic-html.spec.ts
git commit -m "fix(a11y): remove nested main landmarks and duplicate nav aria-labels"
```

---

### Task 3: Quotation & Citation Semantics Fix (`TestimonialsSection.astro`)

**Files:**

- Modify: `src/features/home/components/TestimonialsSection.astro:71-109`
- Test: `tests/semantic-html.spec.ts`

**Step 1: Write the failing test** In `tests/semantic-html.spec.ts`:

```typescript
test("testimonial quotes use semantic figure/blockquote/figcaption without misuse of cite on author names", async ({
  page,
}) => {
  await page.goto("/");
  const testimonialArticles = page.locator("#testimonials article");
  await expect(testimonialArticles.first()).toBeVisible();

  // MDN/WHATWG rule: <cite> must NOT be used for person's name
  const invalidAuthorCite = page.locator("#testimonials cite");
  await expect(invalidAuthorCite).toHaveCount(0);

  // Must use figure/blockquote/figcaption
  const figures = page.locator("#testimonials figure");
  await expect(figures).toHaveCount(3);
});
```

**Step 2: Run test to verify it fails** Run: `bun run test:e2e tests/semantic-html.spec.ts`
Expected: FAIL (`#testimonials cite` has count 3, `#testimonials figure` has count 0).

**Step 3: Implement minimal changes in `TestimonialsSection.astro`** In
`src/features/home/components/TestimonialsSection.astro`: Replace the blockquote and author
structure with:

```astro
<figure class="m-0 flex size-full flex-col justify-between">
  <div>
    <!-- Dispatch Meta Header -->
    <div class="mbe-5 flex items-center justify-between border-b border-stone-100 pbe-3.5 font-mono text-xs">
      <span class="font-bold tracking-[0.14em] text-orange-600 uppercase">
        [DISPATCH 0{index + 1}]
      </span>
      <div class="flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: 5 }, () => (
          <Star
            class="size-3.5 fill-current"
            stroke-width={1.5}
          />
        ))}
      </div>
    </div>

    <!-- Editorial Quote -->
    <blockquote class="mbe-6 text-sm leading-relaxed text-stone-600 sm:text-base">
      <p>“{guestQuote}”</p>
    </blockquote>
  </div>

  <!-- Guest Signature Attribution via figcaption -->
  <figcaption class="mbs-auto border-t border-stone-100 pbs-4">
    <span class="block truncate text-sm font-bold text-stone-950">{guestName}</span>
    <div class="mbs-1 flex items-center gap-1.5 font-mono text-xs text-stone-500">
      <span>{guestCountry}</span>
      <span class="text-stone-300">·</span>
      <span class="inline-flex items-center gap-1 font-sans text-xs font-medium text-emerald-600">
        <CircleCheck class="size-3" />
        Verified
      </span>
    </div>
  </figcaption>
</figure>
```

**Step 4: Run test to verify it passes** Run:
`bun run test:e2e tests/semantic-html.spec.ts && bun run check` Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/home/components/TestimonialsSection.astro tests/semantic-html.spec.ts
git commit -m "refactor(semantics): replace invalid author cite with figure and figcaption in testimonials"
```

---

### Task 4: Itinerary Sequence, Exclusive Accordion & Definition Lists

**Files:**

- Modify: `src/features/tours/components/TourItinerary.astro:32-148`
- Modify: `src/features/tours/components/TourSeoSections.astro:50-209`
- Modify: `src/shared/ui/TripCard.astro:76-88`
- Test: `tests/semantic-html.spec.ts`

**Step 1: Write the failing test** In `tests/semantic-html.spec.ts`:

```typescript
test("tours feature sequential <ol> for stages and <dl> for trip metadata, and exclusive details accordions", async ({
  page,
}) => {
  await page.goto("/tours/grand-moroccan-circuit-10-days");

  // Itinerary must use ordered list
  const stagesList = page.locator("ol.itinerary-stages-list");
  await expect(stagesList).toBeVisible();

  // FAQs must have name attribute for exclusive accordion
  const faqDetails = page.locator("#tour-single details");
  const firstFaq = faqDetails.first();
  await expect(firstFaq).toHaveAttribute("name", "tour-faq");

  // Key-value metadata must use definition lists
  const metadataDl = page.locator("dl.trip-meta-list");
  await expect(metadataDl.first()).toBeVisible();
});
```

**Step 2: Run test to verify it fails** Run: `bun run test:e2e tests/semantic-html.spec.ts`
Expected: FAIL.

**Step 3: Implement minimal changes**

1. In `src/features/tours/components/TourItinerary.astro`:
   - Replace outer `<div class="space-y-8">` with `<ol class="itinerary-stages-list space-y-8">`.
   - Wrap each day item in `<li class="group relative">`.
   - Convert stage title into `<h4>`.
   - Convert accommodation/meals/activities grid into `<dl class="mbs-4 grid gap-3 sm:grid-cols-2">`
     with `<dt class="font-mono text-[10px] ...">` and
     `<dd class="font-mono text-xs font-bold ...">`.
   - Convert bullet points into `<ul>` with `<li>`.

2. In `src/features/tours/components/TourSeoSections.astro`:
   - Convert duration/start/end row into
     `<dl class="trip-meta-list grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">` with `<dt>` and
     `<dd>`.
   - Add `name="tour-faq"` to `<details>` elements for exclusive accordion behavior:

     ```astro
     <details name="tour-faq" class="group rounded-2xl border ...">
     ```

   - Wrap price display in `<data value={price.label}>`.

3. In `src/shared/ui/TripCard.astro`:
   - Replace lines 77-87 with
     `<dl class="trip-meta-list mbe-5 grid grid-cols-2 gap-3 border-y border-stone-100 py-3 text-xs font-mono">`:

     ```astro
     {start && end && (
       <dl class="trip-meta-list mbe-5 grid grid-cols-2 gap-3 border-y border-stone-100 py-3 text-xs font-mono">
         <div class="flex flex-col">
           <dt class="text-[10px] tracking-wider text-stone-400 uppercase">{startLabel}</dt>
           <dd class="truncate font-semibold text-stone-900 m-0">{start}</dd>
         </div>
         <div class="flex flex-col border-s border-stone-100 ps-3">
           <dt class="text-[10px] tracking-wider text-stone-400 uppercase">{endLabel}</dt>
           <dd class="truncate font-semibold text-stone-900 m-0">{end}</dd>
         </div>
       </dl>
     )}
     ```

**Step 4: Run test to verify it passes** Run:
`bun run test:e2e tests/semantic-html.spec.ts && bun run check` Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/tours/components/TourItinerary.astro src/features/tours/components/TourSeoSections.astro src/shared/ui/TripCard.astro tests/semantic-html.spec.ts
git commit -m "feat(semantics): add ordered list itinerary, dl definition lists, and exclusive details accordions"
```

---

### Task 5: Section Structure & Heading Hierarchy (`TourInfo.astro`, `ServicesSection.astro`)

**Files:**

- Modify: `src/features/tours/components/TourInfo.astro:8-90`
- Modify: `src/features/home/components/ServicesSection.astro:212-234`
- Test: `tests/semantic-html.spec.ts`

**Step 1: Write the failing test** In `tests/semantic-html.spec.ts`:

```typescript
test("service pillars and tour inclusions use proper semantic sections and non-skipping heading hierarchy", async ({
  page,
}) => {
  await page.goto("/");
  const servicesHeading = page.locator("#services-heading");
  await expect(servicesHeading).toHaveText(/flotte|fleet/i);

  // Pillars must use h3 headings under the h2
  const pillarHeadings = page.locator("#services article h3");
  await expect(pillarHeadings).toHaveCount(3);

  await page.goto("/tours/grand-moroccan-circuit-10-days");
  const inclusionsSection = page.locator(
    "#tour-single section[aria-labelledby='included-services-title']",
  );
  await expect(inclusionsSection).toBeVisible();
});
```

**Step 2: Run test to verify it fails** Run: `bun run test:e2e tests/semantic-html.spec.ts`
Expected: FAIL.

**Step 3: Implement minimal changes**

1. In `src/features/home/components/ServicesSection.astro`:
   - Change line 227 from `<h4 class="text-base font-bold text-stone-900 tracking-tight mbe-2">` to
     `<h3 class="text-base font-bold text-stone-900 tracking-tight mbe-2">` to maintain strict
     `<h2>` -> `<h3>` hierarchy without skipping levels.

2. In `src/features/tours/components/TourInfo.astro`:
   - Wrap each block in a `<section aria-labelledby="...">` element:
     - `aria-labelledby="included-services-title"` with `id="included-services-title"` on heading.
     - `aria-labelledby="excluded-services-title"` with `id="excluded-services-title"` on heading.
     - `aria-labelledby="advisories-title"` with `id="advisories-title"` on heading.

**Step 4: Run test to verify it passes** Run:
`bun run test:e2e tests/semantic-html.spec.ts && bun run check` Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/tours/components/TourInfo.astro src/features/home/components/ServicesSection.astro tests/semantic-html.spec.ts
git commit -m "fix(headings): fix heading hierarchy in services and wrap tour info in semantic sections"
```

---

### Task 6: Date Formatting `<time>` & Accessible Table Semantics

**Files:**

- Modify: `src/features/legal/components/LegalLayout.astro:48-51`
- Modify: `src/features/legal/components/PrivacyView.astro:673-676,1095-1139`
- Modify: `src/features/legal/components/TermsView.astro:673-676`
- Test: `tests/semantic-html.spec.ts`

**Step 1: Write the failing test** In `tests/semantic-html.spec.ts`:

```typescript
test("legal pages render semantic <time> elements for revision dates and accessible table headers with caption", async ({
  page,
}) => {
  await page.goto("/privacy-policy");
  const timeElement = page.locator("time[datetime]");
  await expect(timeElement.first()).toBeVisible();

  const cookieTable = page.locator("table");
  await expect(cookieTable.locator("caption")).toBeVisible();
  const columnHeaders = cookieTable.locator("th[scope='col']");
  await expect(columnHeaders).toHaveCount(5);
});
```

**Step 2: Run test to verify it fails** Run: `bun run test:e2e tests/semantic-html.spec.ts`
Expected: FAIL (missing `time[datetime]`, missing `table caption`, missing `th[scope="col"]`).

**Step 3: Implement minimal changes**

1. In `src/features/legal/components/LegalLayout.astro`: Replace lines 48-50 with:

   ```astro
   {meta?.lastUpdated && (
     <div class="mbe-8 text-center text-sm font-medium text-neutral-500">
       <time datetime={meta.lastUpdated}>{meta.lastUpdated}</time>
     </div>
   )}
   ```

2. In `src/features/legal/components/PrivacyView.astro` & `TermsView.astro`: Wrap
   `current.lastUpdated` in:

   ```astro
   <time datetime={new Date().toISOString().slice(0, 10)}>{current.lastUpdated}</time>
   ```

   In `PrivacyView.astro` table: Add `caption` and `scope="col"` on headers:

   ```html
   <table class="w-full text-left text-xs sm:text-sm">
     <caption class="sr-only">
       {current.cookieTable.title} — {current.cookieTable.subtitle}
     </caption>
     <thead
       class="border-b border-stone-200 bg-stone-50 font-mono text-xs font-semibold text-slate-700"
     >
       <tr>
         <th
           scope="col"
           class="w-[20%] min-w-35 px-4 py-3"
         >
           {current.cookieTable.colName}
         </th>
         <th
           scope="col"
           class="w-[17%] min-w-31.25 px-4 py-3"
         >
           {current.cookieTable.colProvider}
         </th>
         <th
           scope="col"
           class="w-[16%] min-w-30 px-4 py-3"
         >
           {current.cookieTable.colCategory}
         </th>
         <th
           scope="col"
           class="w-[36%] min-w-60 px-4 py-3"
         >
           {current.cookieTable.colPurpose}
         </th>
         <th
           scope="col"
           class="w-[11%] min-w-20 px-4 py-3"
         >
           {current.cookieTable.colLifespan}
         </th>
       </tr>
     </thead>
   </table>
   ```

**Step 4: Run test to verify it passes** Run:
`bun run test:e2e tests/semantic-html.spec.ts && bun run check` Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/legal/components/LegalLayout.astro src/features/legal/components/PrivacyView.astro src/features/legal/components/TermsView.astro tests/semantic-html.spec.ts
git commit -m "feat(semantics): add semantic time elements and accessible table caption/scope"
```

---

### Task 7: Form Control Grouping & Accessible Output Elements

**Files:**

- Modify: `src/features/booking/components/BookingTripDetails.vue`
- Modify: `src/features/booking/components/BookingPersonalFields.vue`
- Modify: `src/features/contact/components/ContactFormFields.vue`
- Modify: `src/shared/layout/footer/NewsletterModal.vue`
- Test: `tests/semantic-html.spec.ts`

**Step 1: Write the failing test** In `tests/semantic-html.spec.ts`:

```typescript
test("forms use semantic fieldsets with legends and output elements for live announcements", async ({
  page,
}) => {
  await page.goto("/contact");
  const fieldsets = page.locator("form[data-form='contact'] fieldset");
  await expect(fieldsets.first()).toBeVisible();

  // Newsletter status element should be an <output>
  await page.goto("/");
  const modalStatus = page.locator("#newsletter-dialog output");
  await expect(modalStatus).toHaveAttribute("aria-live", "polite");
});
```

**Step 2: Run test to verify it fails** Run: `bun run test:e2e tests/semantic-html.spec.ts`
Expected: FAIL.

**Step 3: Implement minimal changes**

1. In `src/features/contact/components/ContactFormFields.vue`:
   - Group contact identity fields in
     `<fieldset class="grid gap-5 md:grid-cols-2"><legend class="sr-only">Contact Details</legend>...`.
   - Remove redundant `:aria-label` when `<label for="...">` is already bound to input ID.

2. In `src/features/booking/components/BookingPersonalFields.vue`:
   - Wrap personal information inputs in
     `<fieldset class="grid items-start gap-5 md:grid-cols-2"><legend class="sr-only">Guest Information</legend>...`.
   - Remove redundant `:aria-label` attributes.

3. In `src/features/booking/components/BookingTripDetails.vue`:
   - Wrap reservation configuration in
     `<fieldset><legend class="sr-only">Trip Configuration</legend>...`.

4. In `src/shared/layout/footer/NewsletterModal.vue`:
   - Replace `<p v-if="statusKey" role="status" aria-live="polite">` with
     `<output v-if="statusKey" class="block mbs-4 text-center text-sm font-medium" aria-live="polite">`.

**Step 4: Run test to verify it passes** Run:
`bun run test:e2e tests/semantic-html.spec.ts && bun run check` Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/booking/components/BookingTripDetails.vue src/features/booking/components/BookingPersonalFields.vue src/features/contact/components/ContactFormFields.vue src/shared/layout/footer/NewsletterModal.vue tests/semantic-html.spec.ts
git commit -m "feat(forms): add semantic fieldsets, legends, and output status tags"
```

---

### Task 8: Video & Dialog Cleanups (`VideoSection.vue`, `CookieConsent.astro`)

**Files:**

- Modify: `src/features/home/components/VideoSection.vue:123-156`
- Modify: `src/shared/ui/CookieConsent.astro:15-105`
- Test: `tests/semantic-html.spec.ts`

**Step 1: Write the failing test** In `tests/semantic-html.spec.ts`:

```typescript
test("video element does not use role=button and uses valid semantic media attributes", async ({
  page,
}) => {
  await page.goto("/");
  const video = page.locator("#video video");
  await expect(video).not.toHaveAttribute("role", "button");

  // Cookie consent banner has proper section/aside landmark
  const cookieBanner = page.locator("#cookie-banner");
  await expect(cookieBanner).toHaveAttribute("aria-labelledby", "cookie-banner-title");
});
```

**Step 2: Run test to verify it fails** Run: `bun run test:e2e tests/semantic-html.spec.ts`
Expected: FAIL (`video` has `role="button"`).

**Step 3: Implement minimal changes**

1. In `src/features/home/components/VideoSection.vue`:
   - Remove `role="button"` and `tabindex="0"` from `<video>`.
   - Ensure video interactions are triggered through dedicated semantic overlay
     `<button type="button">` or native controls.
   - Keep `<track kind="captions" ...>` for complete HTML5 media accessibility.

2. In `src/shared/ui/CookieConsent.astro`:
   - Replace outer `<div id="cookie-banner" role="region" ...>` with
     `<aside id="cookie-banner" aria-label="Cookie consent" ...>`.
   - Modernize `#cookie-preferences-modal` to a
     `<dialog id="cookie-preferences-modal" aria-labelledby="cookie-modal-title">` with proper
     `<form method="dialog">` or close actions.

**Step 4: Run test to verify it passes** Run:
`bun run test:e2e tests/semantic-html.spec.ts && bun run check` Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/home/components/VideoSection.vue src/shared/ui/CookieConsent.astro tests/semantic-html.spec.ts
git commit -m "refactor(semantics): remove role=button from video and upgrade cookie banner to semantic aside/dialog"
```

---

### Task 9: Final Quality Gate & Full Project Audit (COMPLETED)

**Files:**

- Test: `tests/semantic-html.spec.ts`
- Run: Full lint, typecheck, build, and E2E tests

**Audit Verification Results:**

1. `bun run check`: **PASS** — 0 errors, 0 warnings, 0 hints across 104 files.
2. `astro-html-validate`: **PASS** — 0 errors, 0 warnings.
3. `bun run build`: **PASS** — Server built cleanly in production mode.
4. `bun x playwright test tests/semantic-html.spec.ts --workers=1`: **PASS** — All 8 test suites
   passed (26.4s).
5. All changes preserved uncommitted in the working tree per strict user mandate.

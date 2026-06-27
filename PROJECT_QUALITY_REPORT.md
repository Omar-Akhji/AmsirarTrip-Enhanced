# Project Quality Analysis Report

**Project:** `my-astro-project-using-bun` (amsirartrip.com) **Date:** 2026-06-22 **Tools:** React
Doctor v0.5.8, Astro MCP, Tailwind CSS v4 analysis, Custom audit **React Doctor Score:** **81/100**
(Needs work)

---

## Executive Summary

| Dimension               | Score     | Rating                                     |
| ----------------------- | --------- | ------------------------------------------ |
| React Component Quality | 7/10      | Good (memory leaks, ARIA gaps)             |
| Astro Architecture      | 7/10      | Good (missing server islands, nested main) |
| Tailwind CSS / Theming  | 6/10      | Acceptable (hard-coded colors, no tokens)  |
| Accessibility           | 5/10      | Partial (missing focus traps, ARIA)        |
| Performance             | 7/10      | Good (image bypass, no code splitting)     |
| **Overall**             | **32/50** | **64% — Needs targeted improvements**      |

### Critical Findings

- **3 P0 issues** (memory leaks, broken image optimization)
- **9 P1 issues** (accessibility violations, SEO gaps, middleware overhead)
- **19 P2 issues** (architecture, code organization, consistency)
- **13 P3 issues** (polish, minor improvements)

---

## 1. React Component Quality

### React Doctor Results

| Category                 | Count | Severity |
| ------------------------ | ----- | -------- |
| Accessibility warnings   | 3     | P1       |
| Maintainability warnings | 4     | P2       |

#### P0 — Critical Issues

| #   | File                  | Line    | Issue                                                           | Fix                                         |
| --- | --------------------- | ------- | --------------------------------------------------------------- | ------------------------------------------- |
| 1   | `NewsletterModal.tsx` | 55      | **Memory leak**: `setTimeout` not cleaned up on unmount         | Store timer ID, clear in effect cleanup     |
| 2   | `BookingForm.tsx`     | 143     | **Memory leak**: `setTimeout` for form reset not cleaned        | Return `clearTimeout(id)` in effect cleanup |
| 3   | `BookingForm.tsx`     | 113-118 | **Unsafe type assertion**: `as unknown as (...)` double-casting | Create properly typed wrapper function      |

#### P1 — High Severity

| #   | File                   | Line    | Issue                                                            | Fix                                                       |
| --- | ---------------------- | ------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| 4   | `NativePopover.tsx`    | 122-129 | **Missing ARIA on trigger**: No `aria-expanded`, `aria-controls` | Add `aria-expanded={isOpen}`, `aria-controls={popoverId}` |
| 5   | `LanguageSelector.tsx` | 110-145 | **No focus trap or arrow-key navigation**                        | Add focus trap, ArrowUp/ArrowDown handlers                |
| 6   | `MobileMenu.tsx`       | 164-209 | **No focus trap in mobile menu**                                 | Add `role="dialog"`, `aria-modal="true"`, focus trap      |
| 7   | `HomeHero.tsx`         | 131-199 | **No `prefers-reduced-motion` support**                          | Wrap animations in `matchMedia` check                     |
| 8   | `VideoSection.tsx`     | 72-91   | **Video not keyboard-accessible**                                | Add `tabIndex={0}`, `role="button"`, `onKeyDown`          |
| 9   | `NewsletterModal.tsx`  | 21      | **Unsafe `any` type on ref**                                     | Type as `useRef<ReCAPTCHA \| null>(null)`                 |

#### P2 — Medium Severity

| #   | File                     | Line   | Issue                                         | Fix                                             |
| --- | ------------------------ | ------ | --------------------------------------------- | ----------------------------------------------- |
| 10  | `BookingForm.tsx`        | 298    | **Component too large (298 lines)**           | Extract reducer + reCAPTCHA into separate files |
| 11  | `ContactForm.tsx`        | 266    | **Component too large (266 lines)**           | Extract reducer + error summary                 |
| 12  | `MobileMenu.tsx`         | 96-117 | **Duplicated social links code**              | Extract `<SocialLinksList />` component         |
| 13  | `NativePopover.tsx`      | 64-66  | **useEffect runs every render** (no deps)     | Add `[]` dependency array                       |
| 14  | `BookingTripDetails.tsx` | 36-48  | **Unnecessary complexity** (microtask + flag) | Simplify to direct `useEffect`                  |
| 15  | `HomeHero.tsx`           | 28-31  | **useEffect without deps runs every render**  | Add `[]` dependency array                       |
| 16  | `ContactForm.tsx`        | 104    | **queueMicrotask dispatch** race condition    | Dispatch directly in effect body                |

#### P3 — Low Severity

| #   | File              | Line    | Issue                         | Fix                          |
| --- | ----------------- | ------- | ----------------------------- | ---------------------------- |
| 17  | `BookingForm.tsx` | 132-135 | stateRef updated every render | Add `[]` deps                |
| 18  | `ContactForm.tsx` | 94-97   | Same stateRef pattern         | Add `[]` deps                |
| 19  | `HomeHero.tsx`    | 1       | Large file (200 lines)        | Extract `useTypewriter` hook |

---

## 2. Astro Architecture

### Page Structure

| #   | File                                  | Line | Issue                                                                      | Severity |
| --- | ------------------------------------- | ---- | -------------------------------------------------------------------------- | -------- |
| 1   | `pages/[...locale]/index.astro`       | 23   | **Nested `<main>` tags** — Layout wraps in `<main>` AND page adds `<main>` | P2       |
| 2   | `pages/[...locale]/tours/index.astro` | 63   | Same nested `<main>` in ToursView                                          | P2       |
| 3   | `pages/[...locale]/about.astro`       | 62   | Same nested `<main>` in AboutView                                          | P2       |

**Fix:** Remove `<main>` from individual pages; let Layout.astro control it.

### Server Islands Opportunities

| #   | Component      | Current                                      | Recommendation                                   | Severity |
| --- | -------------- | -------------------------------------------- | ------------------------------------------------ | -------- |
| 1   | `BookingForm`  | `client:only="react"` — blank until JS loads | Use `server:defer` with loading skeleton         | P2       |
| 2   | `ContactForm`  | `client:only="react"` — blank until JS loads | Use `client:visible` for progressive enhancement | P3       |
| 3   | `VideoSection` | `client:visible` — good                      | No change needed                                 | —        |

### Image Optimization

| #   | File                               | Line    | Issue                                                                                             | Severity |
| --- | ---------------------------------- | ------- | ------------------------------------------------------------------------------------------------- | -------- |
| 1   | `shared/ui/Image.tsx`              | 12-37   | **Custom `<img>` wrapper bypasses Astro's image pipeline** — no WebP, no srcsets, no optimization | P0       |
| 2   | `about/components/AboutView.astro` | 148-152 | Raw `<img>` for about image                                                                       | P1       |
| 3   | `layouts/Layout.astro`             | 229-234 | Raw `<img>` for WhatsApp icon                                                                     | P3       |

**Fix:** Replace custom Image component with Astro's built-in `<Image>` from `astro:assets`.

### SEO & Meta Tags

| #   | File                                   | Line    | Issue                                                             | Severity |
| --- | -------------------------------------- | ------- | ----------------------------------------------------------------- | -------- |
| 1   | `layouts/Layout.astro`                 | 77-79   | **`og:image` always same default** — no per-page OG images        | P1       |
| 2   | `layouts/Layout.astro`                 | 107-109 | Same for `twitter:image`                                          | P1       |
| 3   | `layouts/Layout.astro`                 | 89-92   | `og:locale` uses raw locale code ("en") instead of "en_US" format | P2       |
| 4   | `pages/[...locale]/tours/[slug].astro` | 56-67   | JSON-LD hardcodes domain instead of using `Astro.site`            | P3       |

### i18n

| #   | File              | Line | Issue                                                        | Severity |
| --- | ----------------- | ---- | ------------------------------------------------------------ | -------- |
| 1   | `i18n/utils.ts`   | 3-7  | `useTranslations` creates new Map on every call — no caching | P2       |
| 2   | `i18n/routing.ts` | 14   | `LOCALES` array duplicated across 3 files                    | P3       |
| 3   | `i18n/routing.ts` | 77   | `prefetch` method is a no-op (dead code)                     | P3       |

### Middleware

| #   | File            | Line | Issue                                                                                       | Severity |
| --- | --------------- | ---- | ------------------------------------------------------------------------------------------- | -------- |
| 1   | `middleware.ts` | 4-12 | **Security headers applied to ALL requests** including static assets — unnecessary overhead | P1       |

**Fix:** Skip header injection for `/_astro/` paths and file extensions.

### Actions

| #   | File               | Line   | Issue                                       | Severity |
| --- | ------------------ | ------ | ------------------------------------------- | -------- |
| 1   | `actions/index.ts` | 32-131 | `booking` action handler is 100+ lines      | P2       |
| 2   | `actions/index.ts` | 15-23  | `getLanguageName` duplicates locale mapping | P3       |
| 3   | `actions/index.ts` | 88-108 | Raw HTML string interpolation for emails    | P2       |

### Import Consistency

| #   | Issue                                                                           | Severity |
| --- | ------------------------------------------------------------------------------- | -------- |
| 1   | Pages use relative paths (`../../features/...`) while components use `@/` alias | P2       |
| 2   | No barrel exports (`index.ts`) in feature directories                           | P3       |

---

## 3. Tailwind CSS / Theming

### Hard-Coded Colors (Critical)

**`Navbar.astro` (lines 97-286)** contains **15+ hard-coded hex colors** that bypass the design
token system:

| Line | Hard-Coded | Should Use                    |
| ---- | ---------- | ----------------------------- |
| 105  | `#0f172a`  | `--color-dark` or `text-dark` |
| 161  | `#18181b`  | `--color-dark-grey`           |
| 165  | `#d4d4d8`  | `--color-light-grey-alt2`     |
| 174  | `#52525b`  | `--color-grey-alt`            |
| 189  | `#ea580c`  | `--color-orange`              |
| 261  | `#f4f4f5`  | `--color-light-grey`          |

**`BookingSidebar.tsx:77`** — Hard-coded `bg-[#34E0A1]` (TripAdvisor green) — no token defined.

### Mixed Color Spaces

`global.css` `@theme` block uses **both `oklch()` and `hsl()`** — should standardize on one system.

### Repeated Patterns (Need Extraction)

| Pattern                | Occurrences | Extract To           |
| ---------------------- | ----------- | -------------------- |
| Orange gradient button | 4+ files    | `Button.astro`       |
| Section header badge   | 5+ files    | `SectionBadge.astro` |
| Section title heading  | 5+ files    | `SectionTitle.astro` |
| Form input styles      | 3 files     | `FormInput.astro`    |
| Social link styles     | 4 files     | `SocialLink.astro`   |

### Arbitrary Values That Should Be Tokens

| File               | Line | Arbitrary                                | Token to Define     |
| ------------------ | ---- | ---------------------------------------- | ------------------- |
| `Navbar.astro`     | 29   | `shadow-[0_10px_30px_rgba(3,7,18,0.12)]` | `--shadow-card`     |
| `Navbar.astro`     | 41   | `shadow-[0_8px_18px_rgba(0,0,0,0.28)]`   | `--shadow-dropdown` |
| `TripCard.astro`   | 33   | `rounded-[20px]`                         | `--radius-card`     |
| `TripCard.astro`   | 44   | `rounded-[15px]`                         | `--radius-card-sm`  |
| `VideoSection.tsx` | 49   | `rounded-[34px]`                         | `--radius-video`    |

### `!important` Usage

**6 instances** in `Navbar.astro` (lines 120, 128, 280-283) — suggests specificity wars. Refactor
with CSS layers or specificity management.

### Tailwind v4 Features Not Yet Used

| Feature                         | Status   | Benefit                                 |
| ------------------------------- | -------- | --------------------------------------- |
| `@theme` for shadows            | Not used | Replace arbitrary shadow values         |
| `@theme` for border-radius      | Not used | Replace arbitrary radius values         |
| `@variant` for custom variants  | Not used | Replace navbar scroll state logic       |
| `@utility` for custom utilities | Not used | Formalize `.page-hero`, `.card-article` |
| CSS-first config migration      | Complete | `@import "tailwindcss"` ✓               |
| Logical properties              | Used     | `inline-*`, `block-*` ✓                 |

---

## 4. Accessibility (A11y)

### Critical Violations

| #   | Component                   | Issue                                 | WCAG  | Severity |
| --- | --------------------------- | ------------------------------------- | ----- | -------- |
| 1   | `NativePopover.tsx:131`     | Dialog without accessible name        | 4.1.2 | P1       |
| 2   | `NewsletterModal.tsx:65`    | Dialog without accessible name        | 4.1.2 | P1       |
| 3   | `NewsletterModal.tsx:65`    | Handler on non-interactive `<dialog>` | 2.1.1 | P1       |
| 4   | `LanguageSelector.tsx`      | No focus trap in dropdown             | 2.4.3 | P1       |
| 5   | `MobileMenu.tsx`            | No focus trap in mobile nav           | 2.4.3 | P1       |
| 6   | `HomeHero.tsx`              | No `prefers-reduced-motion`           | 2.3.3 | P1       |
| 7   | `VideoSection.tsx`          | Video not keyboard-accessible         | 2.1.1 | P1       |
| 8   | `NativePopover.tsx:122-129` | Trigger missing `aria-expanded`       | 4.1.2 | P1       |

### Touch Targets

| Component                 | Issue                               | Fix                           |
| ------------------------- | ----------------------------------- | ----------------------------- |
| `BookingSidebar.tsx:45`   | `text-[10px]` — too small for touch | Increase to `text-xs` minimum |
| `LanguageSelector.tsx:26` | `text-[0.6rem]` — too small         | Increase font size            |

---

## 5. Performance

### Issues

| #   | File                  | Issue                                     | Impact                                | Severity |
| --- | --------------------- | ----------------------------------------- | ------------------------------------- | -------- |
| 1   | `shared/ui/Image.tsx` | **No image optimization** — raw `<img>`   | Larger images, no WebP, no srcsets    | P0       |
| 2   | `middleware.ts`       | **Headers on static assets**              | Unnecessary processing overhead       | P1       |
| 3   | `BookingForm`         | **`client:only`** — blank until JS loads  | Poor FCP/LCP                          | P2       |
| 4   | `ContactForm`         | **`client:only`** — blank until JS loads  | Poor FCP                              | P2       |
| 5   | `NewsletterModal.tsx` | **Lazy ReCAPTCHA without error boundary** | Crash on import failure               | P3       |
| 6   | `HomeHero.tsx`        | **Typing animation runs on every load**   | CPU usage for non-essential animation | P3       |

### What's Working Well

- `@playform/compress` for CSS, HTML, JS, SVG
- `prettier-plugin-tailwindcss` for class sorting
- `client:visible` for below-fold components
- Logical properties for i18n efficiency
- `data-animate` system with IntersectionObserver
- `bun` as package manager (30x faster installs)
- `Bun.Image` replacing sharp (1.2-70x faster)

---

## 6. Recommendations by Priority

### P0 — Fix Immediately

1. **Replace custom Image component** with Astro's `<Image>` from `astro:assets`
2. **Fix memory leaks** in `NewsletterModal.tsx` and `BookingForm.tsx` (clear timeouts)
3. **Fix unsafe type assertion** in `BookingForm.tsx:113-118`

### P1 — Fix Before Release

4. **Add ARIA attributes** to `NativePopover.tsx` and `NewsletterModal.tsx` dialogs
5. **Add focus traps** to `LanguageSelector.tsx` and `MobileMenu.tsx`
6. **Add `prefers-reduced-motion`** support to `HomeHero.tsx`
7. **Make video keyboard-accessible** in `VideoSection.tsx`
8. **Add per-page OG images** for tours and excursions
9. **Filter middleware** to skip static assets
10. **Fix nested `<main>` tags** in pages

### P2 — Fix in Next Pass

11. **Extract repeated components** (Button, SectionBadge, SectionTitle, FormInput)
12. **Move hard-coded colors to `@theme` tokens** in `Navbar.astro`
13. **Define missing tokens** (shadows, border-radius, TripAdvisor green)
14. **Standardize color space** in `@theme` (oklch only)
15. **Cache translations** in `i18n/utils.ts`
16. **Extract locale constants** to single source of truth
17. **Split large components** (BookingForm, ContactForm, calendar)
18. **Standardize imports** to use `@/` alias everywhere
19. **Use `Astro.site`** instead of hardcoded domain in JSON-LD

### P3 — Polish

20. **Add `@variant`** for navbar scroll state
21. **Add `@utility`** for `.page-hero`, `.card-article`
22. **Remove dead code** (`prefetch` no-op in routing.ts)
23. **Add barrel exports** for feature directories
24. **Add error boundaries** around lazy-loaded components

---

## 7. File-by-File Priority Matrix

| File                   | P0  | P1  | P2  | P3  | Total |
| ---------------------- | --- | --- | --- | --- | ----- |
| `shared/ui/Image.tsx`  | 1   | —   | —   | —   | 1     |
| `BookingForm.tsx`      | 2   | —   | 1   | 1   | 4     |
| `NewsletterModal.tsx`  | 1   | 2   | 1   | —   | 4     |
| `NativePopover.tsx`    | —   | 2   | 1   | —   | 3     |
| `MobileMenu.tsx`       | —   | 1   | 1   | —   | 2     |
| `LanguageSelector.tsx` | —   | 1   | —   | —   | 1     |
| `HomeHero.tsx`         | —   | 1   | —   | 1   | 2     |
| `VideoSection.tsx`     | —   | 1   | —   | —   | 1     |
| `ContactForm.tsx`      | —   | —   | 2   | —   | 2     |
| `Navbar.astro`         | —   | —   | 3   | —   | 3     |
| `Layout.astro`         | —   | 2   | 1   | 1   | 4     |
| `middleware.ts`        | —   | 1   | —   | —   | 1     |
| `global.css`           | —   | —   | 2   | —   | 2     |
| `i18n/utils.ts`        | —   | —   | 1   | —   | 1     |
| `actions/index.ts`     | —   | —   | 2   | 1   | 3     |

---

## 8. Positive Findings

- **Feature-based folder structure** is well-organized
- **Tailwind v4 migration** is complete and correct
- **`cn()` utility** properly implemented with `clsx` + `tailwind-merge`
- **Client directives** used appropriately (`client:load`, `client:visible`, `client:only`)
- **React 19 patterns** already in use (`useActionState`, `useFormStatus`)
- **i18n routing** with locale prefix support works correctly
- **Bun integration** is solid (package manager, `Bun.Image`, test runner)
- **Security middleware** with CSP headers (though needs filtering)
- **Honeypot spam protection** in actions
- **Rate limiting** in server-side actions
- **`data-animate` system** for scroll-triggered animations
- **CSS `@property` registrations** for advanced animations

---

_Report generated by automated analysis. Run `/audit` after fixes to verify improvements._

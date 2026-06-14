# Project Analysis Report — Amsirar Trip

> **Date**: 2026-06-14
> **Project**: `my-astro-project-using-bun`
> **Site**: [amsirartrip.com](https://amsirartrip.com)

---

## 1. Project Overview

**Amsirar Trip** is a Morocco travel and tourism website offering desert tours, imperial city excursions, Atlas Mountains treks, and private guided experiences. The site was migrated from Next.js to Astro 6 with server-side rendering (SSR), using Bun as the runtime.

### Key Facts
- **Company**: Amsirar Trip — 20+ years serving travelers
- **Location**: Morocco (Marrakech, Casablanca, Fes, Tangier, Agadir)
- **Languages**: English (default), French, German, Spanish
- **Contact**: WhatsApp (+212 661 173 144), phone helpline, email forms

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Astro | 6.4 |
| **UI Layer** | React | 19.2 |
| **Runtime** | Bun | Latest |
| **CSS** | Tailwind CSS | 4.x (Vite plugin) |
| **TypeScript** | TypeScript | 6.x (strictest) |
| **SSR Pipeline** | Hono | 4.x |
| **Validation** | Zod | 4.x |
| **Animation** | GSAP | 3.x + ScrollTrigger |
| **Icons** | Lucide React | Latest |
| **Email** | Nodemailer | 8.x (Gmail SMTP) |
| **Captcha** | reCAPTCHA | v2 |
| **Image Processing** | Sharp | 0.35.x |
| **Linting** | ESLint | 10.x (flat config) |
| **Formatting** | Prettier | 3.x |
| **Deployment** | Docker | Multi-stage Bun build |

### Key Dependencies
```json
{
  "astro": "^6.4.6",
  "react": "^19.2.7",
  "hono": "^4.12.25",
  "tailwindcss": "^4.3.1",
  "typescript": "^6.0.3",
  "zod": "^4.4.3",
  "sharp": "^0.35.1",
  "nodemailer": "^8.0.11",
  "react-google-recaptcha": "^3.1.0"
}
```

---

## 3. Architecture

### 3.1 Directory Structure

```
src/
├── actions/          Astro Server Actions (booking, contact, newsletter)
├── app.ts            Hono SSR pipeline entrypoint
├── features/         Domain modules (feature-based architecture)
│   ├── about/
│   ├── booking/      BookingForm.tsx (interactive island)
│   ├── contact/      ContactForm.tsx (interactive island)
│   ├── excursions/   Pure .astro views + data
│   ├── home/         HomeHero.tsx + VideoSection.tsx (interactive islands)
│   ├── legal/        Pure .astro views
│   └── tours/        Pure .astro views + data
├── i18n/             Translation dictionaries + utils
├── layouts/          Layout.astro (base shell)
├── lib/              Shared utilities, hooks, types, env, schemas
├── middleware.ts     Security headers, CSP, locale injection
├── pages/            [...locale]/ route tree
├── shared/           Reusable layout components + UI primitives
│   ├── layout/       Navbar.tsx, Footer.astro, PageHeader, etc.
│   ├── ui/           Image.astro/.tsx, JsonLd.astro, Loading, calendar, etc.
│   └── utilities/    ErrorBoundary.tsx
└── styles/global.css Tailwind v4 entry
```

### 3.2 SSR Pipeline (Hono)

The server-side rendering pipeline is defined in `src/app.ts`:

```
Request → Error Handler → Logger → Sessions → Rate Limiter → Actions → Middleware → i18n → Pages
```

**Key components**:
- **Rate Limiter**: 120 requests per minute on `/_actions/*` endpoints
- **Middleware**: Injects security headers (HSTS, CSP, X-Frame-Options, etc.)
- **i18n**: Handles locale routing and translation injection
- **Actions**: Server-side form processing (booking, contact, newsletter)

### 3.3 React Islands Pattern

Interactive components use Astro's `client:load` or `client:visible` directives:

| Component | Directive | Purpose |
|-----------|-----------|---------|
| `Navbar.tsx` | `client:load` | Navigation with scroll behavior |
| `HomeHero.tsx` | `client:visible` | Typing animation, image rotation |
| `VideoSection.tsx` | `client:visible` | Play/pause video controls |
| `BookingForm.tsx` | `client:load` | Interactive booking form |
| `ContactForm.tsx` | `client:load` | Interactive contact form |
| `AnimateOnScroll.tsx` | `client:visible` | GSAP scroll animations |

All other components (tours, excursions, about, legal) are pure Astro components with zero JavaScript.

---

## 4. Pages & Routing

### 4.1 Route Structure

```
[...locale]/
├── index.astro           Home page
├── about.astro           About page
├── contact.astro         Contact page
├── privacy-policy.astro  Privacy policy
├── terms-of-service.astro Terms of service
├── 404.astro             Custom 404 page
├── tours/
│   ├── index.astro       Tours listing
│   └── [slug].astro      Individual tour page
└── excursions/
    ├── index.astro       Excursions listing
    └── [slug].astro      Individual excursion page
```

### 4.2 i18n Routing

- **4 locales**: `en` (default, prefixless), `fr`, `de`, `es`
- **Routing**: Astro's built-in `[...locale]` parameter
- **English URLs**: `/tours`, `/contact`, `/about` (no prefix)
- **Other locales**: `/fr/tours`, `/de/contact`, `/es/about`

### 4.3 Page Components

**Home Page** (`src/pages/[...locale]/index.astro`):
- `HomeHero` (React) — typing animation, image slideshow
- `HomeStats` (Astro) — statistics section
- `FeaturedTours` (Astro) — featured tour cards
- `ServicesSection` (Astro) — services offered
- `TestimonialsSection` (Astro) — customer reviews
- `VideoSection` (React) — video with play/pause

---

## 5. Features

### 5.1 Tours

**9 tour packages** defined in `src/features/tours/data/toursData.ts`:

| Tour | Duration | Start | End |
|------|----------|-------|-----|
| Merzouga Desert Adventure | 3 days | Marrakech | Marrakech |
| Coast and Cities Explorer | 6 days | Casablanca | Marrakech |
| Caravan and Kasbah Experience | 3 days | Fes | Marrakech |
| Imperial Cities and Coastline | 5 days | Casablanca | Fes |
| Grand Moroccan Circuit | 10 days | Marrakech | Casablanca |
| Atlas and Desert Escape | 4 days | Marrakech | Marrakech |
| Coastal and Desert Odyssey | 4 days | Agadir | Marrakech |
| Chegaga Wilderness Expedition | 3 days | Marrakech | Marrakech |
| Northern Heritage Trail | 7 days | Tangier | Marrakech |

### 5.2 Forms & Actions

Three server actions handle form submissions:

**Booking Form** (`actions.booking`):
- Fields: reservation type, full name, email, phone, persons, date, message, duration
- Validation: Zod 4 schema with i18n error messages
- Security: honeypot, rate limiting (10 req/min), reCAPTCHA v2
- Email: Sends HTML-formatted booking request via Nodemailer

**Contact Form** (`actions.contact`):
- Fields: name, email, phone, topic, message
- Validation: Zod 4 schema
- Security: honeypot, rate limiting, reCAPTCHA v2
- Email: Sends contact message via Nodemailer

**Newsletter Form** (`actions.newsletter`):
- Fields: name, email
- Validation: Zod 4 schema
- Security: rate limiting, reCAPTCHA v2
- Email: Sends subscription notification

**Form State Pattern**:
```typescript
type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};
```

### 5.3 Internationalization (i18n)

**4 languages supported**:
- English (`en`) — default, prefixless URLs
- French (`fr`)
- German (`de`)
- Spanish (`es`)

**Translation system**:
- TypeScript dictionaries: `src/i18n/ui.ts` (type-safe keys)
- JSON files: `public/locales/{en,fr,de,es}/common.json` (client-side)
- Usage: `useTranslations(locale)` → `t("key")` returns `string`

### 5.4 Security

**Security Headers** (injected via middleware):
- `Strict-Transport-Security`: max-age=63072000; includeSubDomains; preload
- `X-Frame-Options`: SAMEORIGIN
- `X-Content-Type-Options`: nosniff
- `Referrer-Policy`: origin-when-cross-origin
- `Permissions-Policy`: camera=(), microphone=(), geolocation=()
- `Content-Security-Policy`: Restrictive policy allowing google.com for reCAPTCHA, tripadvisor.com for images

**Form Security**:
- Honeypot fields (hidden from users, catch bots)
- IP-based rate limiting (10 requests per minute per IP)
- reCAPTCHA v2 verification
- Zod validation on all inputs

---

## 6. Styling & Design

### 6.1 Tailwind CSS 4

- **Vite plugin** (no PostCSS config needed)
- **Custom theme** in `src/styles/global.css`
- **Custom fonts**:
  - Montserrat (sans-serif, variable weight)
  - StoryScript (cursive, fancy text)
  - Yellowtail (cursive, brand name)

### 6.2 Design System

**Color palette**:
- Primary: Orange (`oklch(56% 0.19 33deg)`)
- Dark orange: `oklch(51% 0.18 36deg)`
- WhatsApp green for contact button
- Zinc/slate grays for text

**Components**:
- Glassmorphism navbar with scroll behavior
- Floating WhatsApp button with ping animation
- Initial page loader with SVG spinner
- Card-based layouts for tours and excursions

### 6.3 Animations

- **GSAP 3** + ScrollTrigger for scroll-based animations
- **React state** for hero typing animation and image rotation
- **CSS transitions** for hover effects and page transitions
- **Astro ClientRouter** for smooth page transitions

---

## 7. Deployment

### 7.1 Docker

**Multi-stage Dockerfile**:
```dockerfile
FROM oven/bun:1 AS base
# Stage 1: Production dependencies
# Stage 2: Build dependencies + build
# Stage 3: Runtime (prod deps + built dist)
CMD ["bun", "./dist/server/entry.mjs"]
```

**Exposed port**: 4321

### 7.2 Environment Variables

**Server-side** (secret):
- `GMAIL_USER` — Gmail address for sending emails
- `GMAIL_PASS` — Gmail app password
- `MAIL_TO` — Optional recipient email (defaults to GMAIL_USER)
- `RECAPTCHA_SECRET_KEY` — reCAPTCHA v2 secret key

**Client-side** (public):
- `PUBLIC_RECAPTCHA_SITE_KEY` — reCAPTCHA v2 site key

---

## 8. Code Quality

### 8.1 TypeScript

- **Strictest configuration** with `erasableSyntaxOnly` and `verbatimModuleSyntax`
- **Path alias**: `@/*` maps to `./src/*`
- **React JSX**: `react-jsx` with `react` import source

### 8.2 Linting & Formatting

- **ESLint 10** with flat config
- **Prettier 3** with Tailwind CSS plugin
- **Plugins**: astro, react-hooks, security, unicorn, no-unsanitized

### 8.3 Known Technical Debt

1. **TypeScript errors in `.astro` files** (~31 errors):
   - Lucide icons use `class` instead of `className`
   - `key` prop on HTML elements
   - All runtime-safe, but `astro check` reports them

2. **Prettier violations** (~1431):
   - `.astro` files need formatting

3. **React Compiler**:
   - Wired up in Babel config but needs verification with React 19.2

4. **Server Actions barrel file**:
   - `src/actions/index.ts` is a single file; migration.md references separate files that don't exist

5. **Empty directory**:
   - `src/assets/` is empty and can be removed

---

## 9. Performance Considerations

### 9.1 Optimizations

- **Image optimization**: Sharp via `astro:assets`
- **Compression**: `@playform/compress` for CSS, HTML, JS, SVG
- **Prefetching**: `prefetch: { prefetchAll: true, defaultStrategy: "viewport" }`
- **React lazy loading**: `client:visible` for below-fold components
- **Font loading**: `font-display: swap` for all custom fonts

### 9.2 Bundle Size

- **Minimal JavaScript**: Only React islands load JS
- **Zero-JS components**: Tours, excursions, about, legal pages
- **Tree shaking**: Lucide icons imported individually

---

## 10. SEO & Meta

### 10.1 Metadata

- **Title tags**: Locale-aware with i18n
- **Meta descriptions**: Locale-aware
- **Open Graph**: Full OG tags with images
- **Twitter Cards**: `summary_large_image`
- **Canonical URLs**: Properly configured
- **Hreflang**: All 4 locales + `x-default`

### 10.2 Structured Data

- **Organization JSON-LD**: Company information
- **Website JSON-LD**: Site metadata
- **Sitemap**: Auto-generated at `/sitemap-index.xml`
- **Robots.txt**: Configurable via `src/pages/robots.txt.ts`

---

## 11. Summary

**Amsirar Trip** is a well-architected, modern travel website built with:

- **Astro 6** for optimal performance (SSR + static components)
- **React 19** islands for interactive features only
- **Hono** for a clean, composable server pipeline
- **TypeScript 6** with strictest settings
- **Tailwind CSS 4** for utility-first styling
- **Comprehensive security**: CSP, rate limiting, reCAPTCHA, honeypots
- **Full i18n**: 4 languages with type-safe translations
- **Docker deployment**: Multi-stage build for production

The project follows a **feature-based architecture** with clear separation between interactive React components and zero-JS Astro components, resulting in excellent performance while maintaining rich interactivity where needed.

---

*Report generated by MiMo Code Agent*
# Amsirar Trip

Server-rendered web application for [Amsirar Trip SARL](https://amsirartrip.com), a licensed
Moroccan tour operator in Marrakech (`Agrément Ministère du Tourisme N° 24/TT/RAK`, founded 2006).

The platform serves 9 multi-day private Morocco circuits (3–10 days across Merzouga, Erg Chegaga,
the High Atlas, and imperial cities), 6 Marrakech day excursions, and 6 destinations across 4
languages (`en`, `fr`, `de`, `es` — 929 synced i18n keys, unprefixed English default with `/fr`,
`/de`, and `/es` localized routes).

---

## Stack

| Layer               | Technology                                                    | Notes                                                                                                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework           | Astro 7                                                       | `output: "server"`, `@astrojs/node` standalone adapter (`64 KB` body limit), `memoryCache({ query: { include: [] } })`                                                                                                                                                                     |
| Interactive Islands | Vue 3.5                                                       | Booking form, contact form, newsletter modal, calendar, phone input, Cloudflare Turnstile widget                                                                                                                                                                                           |
| Styling             | Tailwind CSS v4                                               | `@tailwindcss/vite`, OKLCH palette tokens, `rem` typography, `px` borders, percentage layout proportions                                                                                                                                                                                   |
| Motion & Scroll     | Lenis + Astro ClientRouter                                    | Smooth scroll, View Transitions, WebGL ink theme transition (`src/scripts/ink/`), CSS animations                                                                                                                                                                                           |
| Email Dispatch      | Nodemailer 10.6                                               | Pooled Gmail / Google Workspace SMTP transport with inline CID assets (`src/services/email.ts`)                                                                                                                                                                                            |
| Runtime & Tooling   | Bun `>= 1.4.4` & Node.js `24.x`                               | Bun for package management, scripts, and checks; Node 24 for standalone production server (`bun run start`)                                                                                                                                                                                |
| Quality Gates       | TypeScript 6, ESLint 10, Stylelint 18, Prettier 3, Playwright | Strict type-checked linting (`security` + `no-unsanitized`), HTML validation, and browser E2E tests                                                                                                                                                                                        |
| SEO & Discovery     | JSON-LD + Prerendered Feeds                                   | Schema.org (`Organization`, `WebSite`, `TouristTrip`, `FAQPage`, `BreadcrumbList`, `VideoObject`), `/sitemap-index.xml`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/.well-known/ai-catalog.json`, `/.well-known/security.txt`, WebMCP (`src/scripts/webmcp-tools.ts`) |

---

## Security Architecture & Cloudflare Edge

```text
Browser (TLS 1.2/1.3)
   │
   ▼
Cloudflare Edge (DDoS -> Custom WAF -> Managed WAF -> Rate Limit -> Cache -> Request/Response Headers)
   │  X-Origin-Verify + CF-Connecting-IP (over SSL Full Strict)
   ▼
Node Standalone (@astrojs/node, 64 KB body limit)
   ├─► Astro memoryCache (public GETs only; query strings ignored; 403/404/429/redirects bypass cache)
   ├─► src/middleware.ts (timingSafeEqual X-Origin-Verify check, i18n routing, security headers)
   ├─► /_actions/{booking,contact,newsletter} (checkOrigin -> rate limit -> honeypot -> Zod -> Turnstile -> SMTP)
   └─► /api/{tours,excursions,destinations}.json (read-only catalog APIs, 60 req/min/IP)
```

### Implemented Controls

- **Origin & Proxy Trust**: `src/middleware.ts` validates `X-Origin-Verify` in constant time
  (`node:crypto` `timingSafeEqual`) when `ORIGIN_VERIFY_SECRET` is set in production.
  `extractClientIp` in `src/actions/helpers/action-guards.ts` trusts `CF-Connecting-IP` only when
  `isCloudflareVerified === true`, rejecting spoofed proxy headers. `security.allowedDomains` in
  `astro.config.mjs` permits only `amsirartrip.com` and `www.amsirartrip.com`, paired with
  `checkOrigin: true`.
- **Content Security Policy & HTTP Headers**: `astro.config.mjs` enables Astro 7's native SHA-256
  hash-based `security.csp` so `script-src` is hash-locked without `'unsafe-inline'` scripts or
  `'unsafe-eval'`, keeping HTML caching safe across `memoryCache()` and Cloudflare Edge.
  `src/lib/security-headers.ts` sets HSTS (`max-age=63072000; includeSubDomains; preload`),
  `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`,
  `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and strict `Permissions-Policy`.
- **Anti-Bot & Form Validation**: `src/shared/ui/widgets/Turnstile.vue` and
  `src/services/turnstile.ts` enforce Cloudflare Turnstile server-side via `siteverify` (`hostname`,
  per-form `action` matching `booking` | `contact` | `newsletter`, `challenge_ts` age <= 5 min,
  `idempotency_key`, fail-closed in production). Forms also enforce per-IP rate limiting
  (`src/lib/api-utils.ts`), honeypot checks (`booking` and `contact`), and `.trim()`-first Zod
  validation (`src/lib/schemas.ts`).
- **Cache, Logging & Client Isolation**: `memoryCache({ query: { include: [] } })` blocks
  query-string LRU eviction, while explicit `cache.set(false)` calls prevent caching `403`, `404`,
  `429`, and `/en/*` query redirects. `src/services/logger.ts` rotates daily UTC streams safely with
  error listeners. Map facades (`src/scripts/route-map-facade.ts`,
  `src/scripts/contact-map-facade.ts`) enforce Google Maps URL origin validation and iframe
  `sandbox` attributes. Cookie preferences follow GDPR and Moroccan Law 09-08
  (`src/scripts/cookie-consent.ts`).
- **Cloudflare Edge IaC**: `docs/cloudflare/security-rules.tf` defines Terraform rulesets for
  `cloudflare_plan = "free"` and `"pro"` (Origin Auth header injection, `www` to apex 301 redirect,
  Custom WAF, Managed WAF with multilingual-safe OWASP CRS PL1, Edge Rate Limits without
  geo-blocking, Cache Rules, and Edge Response Headers). Required dashboard settings: SSL/TLS **Full
  (Strict)**, **Rocket Loader OFF**, **Email Address Obfuscation OFF**, **DNSSEC ON**, and **SPF /
  DKIM / DMARC** records.

---

## Routes & Server Endpoints

| Surface              | Path                                                                                                                                            | Behavior                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Public Pages         | `/`, `/tours`, `/tours/[slug]`, `/excursions`, `/excursions/[slug]`, `/about`, `/contact`, `/privacy-policy`, `/terms-of-service`               | Also mounted under `/fr/*`, `/de/*`, `/es/*`; invalid `/en/*` redirects 301 to unprefixed path |
| Catalog JSON APIs    | `/api/tours.json`, `/api/excursions.json`, `/api/destinations.json`                                                                             | `GET`, rate-limited (`60 req/min/IP`), cached (`15m` max-age / `1h` SWR; `429` never cached)   |
| Astro Actions        | `/_actions/booking`, `/_actions/contact`, `/_actions/newsletter`                                                                                | `POST` only, `64 KB` max body, origin-checked, rate-limited, Turnstile-verified                |
| Discovery & Metadata | `/robots.txt`, `/sitemap-index.xml`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, `/.well-known/ai-catalog.json`, `/.well-known/security.txt` | Prerendered / static discovery endpoints                                                       |

---

## Project Structure

```text
├── astro.config.mjs                    # SSR adapter, 64 KB body limit, native SHA-256 CSP, cache & env schema
├── docs/cloudflare/security-rules.tf   # Terraform WAF, rate-limiting, cache, redirect & origin-auth rulesets
├── public/                             # Fonts, icons, hero media, captions, .well-known/{ai-catalog.json,security.txt}
├── scripts/                            # i18n key parity check & Lighthouse runner
├── src/
│   ├── actions/                        # Astro actions (booking, contact, newsletter) & email/guard helpers
│   ├── content/                        # JSON content collections (tours, excursions, destinations, legal)
│   ├── data/                           # Agency profile, navigation, countries, languages & stats JSON
│   ├── features/                       # Feature-sliced UI (about, booking, contact, excursions, home, legal, maps, tours)
│   ├── i18n/                           # Locales, schemas, routing helpers & client translation data
│   ├── layouts/                        # Base layout, navbar, footer, page headers & transition skeletons
│   ├── lib/                            # Security headers, Zod schemas, rate limiter, structured data & env wrappers
│   ├── locales/                        # Translation bundles (en, fr, de, es)
│   ├── middleware.ts                   # Origin secret verification, i18n routing & HTTP security headers
│   ├── pages/                          # Localized pages, JSON catalog APIs & discovery endpoints
│   ├── scripts/                        # Map facades, cookie consent, ink transition, smooth scroll & WebMCP tools
│   ├── services/                       # Turnstile verifier (turnstile.ts), Gmail mailer (email.ts) & logger (logger.ts)
│   ├── shared/                         # Reusable UI primitives, skeletons, icons & Turnstile/calendar/phone widgets
│   └── styles/                         # Tailwind v4 global tokens & animations
├── tests/                              # Playwright E2E, CWV, a11y, semantic HTML, type & security (security.spec.ts) tests
├── .env.example                        # Environment variable template
└── AGENTS.md                           # Repository execution protocols (Bun, MCPs, skills, EGM, Ponytail, CSS rules)
```

---

## Getting Started

### Prerequisites

- **Bun** `>= 1.4.4` (required runtime & package manager — avoid `npm`, `yarn`, `pnpm`, or `npx`)
- **Node.js** `24.x` (for running the compiled standalone production server)

### Installation & Environment

```bash
bun install
cp .env.example .env
```

Configure `.env` (reference in `.env.example`):

| Variable                    | Scope         | Requirement         | Purpose                                                                                         |
| --------------------------- | ------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| `GMAIL_USER`                | Server secret | Required for email  | Gmail or Google Workspace SMTP username                                                         |
| `GMAIL_PASS`                | Server secret | Required for email  | Gmail App Password                                                                              |
| `PUBLIC_WHATSAPP_NUMBER`    | Client public | Required            | Raw international digits without `+` (default `212661172393`)                                   |
| `PUBLIC_TURNSTILE_SITE_KEY` | Client public | Required in prod    | Cloudflare Turnstile widget site key (dev defaults to `1x00000000000000000000AA`)               |
| `TURNSTILE_SECRET_KEY`      | Server secret | Required in prod    | Cloudflare Turnstile secret key (dev defaults to test secret; production fails closed if unset) |
| `ORIGIN_VERIFY_SECRET`      | Server secret | Recommended in prod | 64-char hex secret (`openssl rand -hex 32`) matching Cloudflare `X-Origin-Verify` header rule   |
| `MAIL_TO`                   | Server secret | Optional            | Destination inbox override (defaults to `GMAIL_USER`)                                           |

### Commands

| Command                   | Action                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `bun run dev`             | Start local Astro dev server on `http://localhost:4321`                                                       |
| `bun run build`           | Build production server and client bundles into `./dist/`                                                     |
| `bun run preview`         | Preview built Astro app locally                                                                               |
| `bun run start`           | Run standalone Node production server (`./dist/server/entry.mjs`)                                             |
| `bun run verify`          | Run formatting check (`format:check`), ESLint + Stylelint (`lint`), and i18n + Astro + `tsc` checks (`check`) |
| `bun run check`           | Run i18n parity check, `astro check`, and `tsc --noEmit`                                                      |
| `bun run lint`            | Run ESLint and Stylelint across the repository                                                                |
| `bun run format`          | Normalize Tailwind classes and format files with Prettier                                                     |
| `bun run test:e2e`        | Run Playwright test suite (including `tests/security.spec.ts`)                                                |
| `bun run test:cwv`        | Run Core Web Vitals Playwright checks                                                                         |
| `bun run test:lighthouse` | Build and execute Lighthouse audit script                                                                     |
| `bun audit`               | Audit installed dependencies for known advisories                                                             |

---

## Cloudflare Edge Deployment

Apply the versioned WAF, rate-limiting, caching, and origin-authentication rulesets from
`docs/cloudflare/security-rules.tf`:

```bash
cd docs/cloudflare
terraform init
terraform plan \
  -var="zone_id=<CLOUDFLARE_ZONE_ID>" \
  -var="origin_verify_secret=<64_HEX_CHAR_SECRET>" \
  -var="cloudflare_plan=free" # or "pro"
terraform apply
```

When onboarding on `pro`, start with `owasp_action=log` for 14 days to review multilingual (`en`,
`fr`, `de`, `es`) form submissions before switching to `managed_challenge`.

---

## License & Ownership

Copyright © 2026 **Amsirar Trip SARL**. All rights reserved. Licensed Moroccan Tour Operator
(`Agrément Ministère du Tourisme N° 24/TT/RAK`) — Marrakech, Morocco.

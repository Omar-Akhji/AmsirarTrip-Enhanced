Now I have a complete picture. Here's the honest migration assessment first, then the full
architecture.

---

## ⚠️ Before you migrate — what changes fundamentally

RSC support is still experimental in Astro — if RSC is central to your architecture, Next.js is the
safer bet today. Your Next.js project uses RSC heavily. In Astro, the equivalent is **Astro
components** (`.astro` files) which are server-rendered by default, and **React Islands** for
interactive parts only.

Astro's Islands architecture means a page is rendered to static HTML on the server, and only the
specific interactive components ship JavaScript and hydrate in the browser. Every React component in
your project that is interactive needs a `client:*` directive. Components that are purely
presentational become `.astro` files.

Astro 6.3 introduced Advanced Routing — you can now compose the full request pipeline yourself using
`astro/fetch` or `astro/hono`, with handlers for auth, rate limiting, CORS, logging, i18n, actions,
and pages. This replaces Next.js middleware.

---

## Final architecture

```
amsirar-trip/
├── src/
│   │
│   ├── actions/                        # Astro Server Actions (replaces Next.js Server Actions)
│   │   ├── index.ts                    # Action barrel — exports all actions
│   │   ├── booking.ts                  # Booking form action (Zod + DOMPurify + Nodemailer)
│   │   ├── contact.ts                  # Contact form action
│   │   └── newsletter.ts               # Newsletter subscription action
│   │
│   ├── app.ts                          # 🆕 Astro 6.3 Advanced Routing entrypoint
│   │                                   # Composes: rateLimit → auth → actions → middleware → pages → i18n
│   │
│   ├── middleware.ts                    # Security headers, CSP, locals injection
│   │
│   ├── pages/                          # File-based routing (replaces Next.js App Router)
│   │   ├── robots.txt.ts               # Dynamic robots.txt endpoint
│   │   ├── sitemap.xml.ts              # Dynamic sitemap endpoint
│   │   ├── api/
│   │   │   └── health.ts               # Health check endpoint
│   │   └── [locale]/                   # Built-in Astro i18n routing
│   │       ├── index.astro             # Homepage
│   │       ├── about.astro             # About page
│   │       ├── contact.astro           # Contact page
│   │       ├── privacy-policy.astro    # Privacy policy
│   │       ├── terms-of-service.astro  # Terms of service
│   │       ├── excursions/
│   │       │   ├── index.astro         # Excursions catalog
│   │       │   └── [slug].astro        # Excursion detail page
│   │       └── tours/
│   │           ├── index.astro         # Tours catalog
│   │           └── [slug].astro        # Tour detail page
│   │
│   ├── features/                       # Feature-based modules (1:1 with Next.js)
│   │   ├── about/
│   │   │   └── components/
│   │   │       └── AboutView.astro     # Pure server — becomes .astro
│   │   ├── booking/
│   │   │   └── components/
│   │   │       ├── BookingForm.tsx     # Interactive — stays React (client:load)
│   │   │       ├── BookingFormFields.tsx
│   │   │       ├── BookingPersonalFields.tsx
│   │   │       ├── BookingSidebar.astro  # Static summary — becomes .astro
│   │   │       ├── BookingTripDetails.astro
│   │   │       └── FormStatusMessages.tsx  # Interactive — stays React
│   │   ├── contact/
│   │   │   └── components/
│   │   │       ├── ContactForm.tsx     # Interactive — stays React (client:load)
│   │   │       ├── ContactFormFields.tsx
│   │   │       ├── ContactInfoSidebar.astro  # Static — becomes .astro
│   │   │       └── ContactView.astro
│   │   ├── excursions/
│   │   │   ├── components/
│   │   │   │   ├── ExcursionCard.astro
│   │   │   │   ├── ExcursionInfo.astro
│   │   │   │   ├── ExcursionLayout.astro
│   │   │   │   └── ExcursionsView.astro
│   │   │   └── data/
│   │   │       ├── excursionsData.ts
│   │   │       └── excursionsMetadata.ts
│   │   ├── home/
│   │   │   └── components/
│   │   │       ├── FeaturedTours.astro
│   │   │       ├── HomeHero.astro
│   │   │       ├── HomeStats.tsx       # CountUp animation — stays React (client:visible)
│   │   │       ├── HomeView.astro
│   │   │       ├── ServicesSection.astro
│   │   │       ├── TestimonialsSection.tsx  # Slider — stays React (client:visible)
│   │   │       └── VideoSection.astro
│   │   ├── legal/
│   │   │   ├── components/
│   │   │   │   ├── LegalPageLayout.astro
│   │   │   │   ├── LegalSectionCard.astro
│   │   │   │   ├── PrivacyPolicyView.astro
│   │   │   │   └── TermsOfServiceView.astro
│   │   │   ├── data/
│   │   │   │   └── legalConfig.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── tours/
│   │       ├── components/
│   │       │   ├── StatHighlights.astro
│   │       │   ├── TourCard.astro
│   │       │   ├── TourInfo.astro
│   │       │   ├── TourItinerary.tsx   # Accordion interactive — stays React (client:visible)
│   │       │   ├── TourLayout.astro
│   │       │   ├── TourSeoSections.astro
│   │       │   └── ToursView.astro
│   │       ├── data/
│   │       │   ├── toursData.ts
│   │       │   └── toursMetadata.ts
│   │       ├── types/
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── i18n/                           # Replaces next-intl
│   │   ├── ui.ts                       # Translation dictionaries (en, fr, ar)
│   │   └── utils.ts                    # useTranslations(locale) helper
│   │
│   ├── lib/                            # Core utilities (mostly 1:1 with Next.js)
│   │   ├── constants/
│   │   │   └── routes.ts
│   │   ├── hooks/                      # React hooks (only used in .tsx islands)
│   │   │   ├── index.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useNavbar.ts
│   │   │   └── useTranslation.ts
│   │   ├── env.ts                      # Zod server env validation (astro:env schema)
│   │   ├── client-env.ts               # Client-safe env (astro:env client)
│   │   ├── form-types.ts
│   │   ├── gsap.ts                     # GSAP + ScrollTrigger register
│   │   ├── metadata.ts                 # <head> meta tag helpers
│   │   ├── schemas.ts                  # Zod validation schemas
│   │   ├── security-headers.ts         # CSP + HTTP headers (used in middleware.ts)
│   │   ├── server-utils.ts             # Nodemailer transport
│   │   ├── structuredData.ts           # JSON-LD constructors
│   │   ├── types.ts
│   │   └── utils.ts                    # clsx + tailwind-merge
│   │
│   ├── shared/                         # Shared primitives (mostly 1:1)
│   │   ├── layout/
│   │   │   ├── DetailsSidebar.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Navbar.astro
│   │   │   ├── NavigationProgress.tsx  # Interactive — stays React (client:load)
│   │   │   ├── PageHeader.astro
│   │   │   ├── index.ts
│   │   │   ├── footer/
│   │   │   │   ├── FooterBottomBar.astro
│   │   │   │   ├── FooterBrand.astro
│   │   │   │   ├── FooterContactInfo.astro
│   │   │   │   ├── FooterNewsletter.tsx  # Interactive — stays React (client:visible)
│   │   │   │   └── NewsletterModal.tsx   # Interactive — stays React (client:idle)
│   │   │   └── navbar/
│   │   │       ├── constants.ts
│   │   │       ├── DesktopMenu.astro
│   │   │       ├── LanguageSelector.tsx  # Interactive dropdown — stays React (client:load)
│   │   │       ├── MobileMenu.tsx        # Interactive flyout — stays React (client:load)
│   │   │       └── SocialLinks.astro
│   │   ├── ui/
│   │   │   ├── AnimateOnScroll.tsx     # GSAP ScrollTrigger — stays React (client:visible)
│   │   │   ├── Calendar.tsx            # Interactive — stays React (client:load)
│   │   │   ├── CountUp.tsx             # Animation — stays React (client:visible)
│   │   │   ├── Icons.astro             # Static SVG — becomes .astro
│   │   │   ├── index.ts
│   │   │   ├── JsonLd.astro            # Static script tag — becomes .astro
│   │   │   ├── Loading.astro           # Static spinner — becomes .astro
│   │   │   ├── NativePopover.tsx       # Interactive — stays React (client:idle)
│   │   │   ├── PageTransitionLoader.tsx # Interactive — stays React (client:load)
│   │   │   └── WhatsAppButton.astro    # Static link — becomes .astro
│   │   └── utilities/
│   │       └── ErrorBoundary.tsx       # React Error Boundary — stays React
│   │
│   └── styles/
│       └── global.css                  # Tailwind CSS v4 entry point
│
├── public/                             # Static assets
│   ├── icon.png
│   └── icon.svg
│
├── app.ts                              # 🆕 Astro 6.3 Advanced Routing (src/app.ts)
├── astro.config.ts                     # Astro configuration
├── tsconfig.json                       # TypeScript config
├── prettier.config.ts
├── eslint.config.ts
└── package.json
```

---

## Key migration decisions

### i18n — `next-intl` → Astro built-in + `ui.ts`

Astro 4+ has built-in i18n routing — configure locales in `astro.config.mjs` and organize content in
`[locale]` folders. Use `getRelativeLocaleUrl()` and `Astro.currentLocale` for URL generation.

```ts
// astro.config.ts
i18n: {
  locales: ["en", "fr", "ar"],
  defaultLocale: "en",
  routing: { prefixDefaultLocale: false }, // /about not /en/about
}
```

```ts
// src/i18n/utils.ts — replaces next-intl's useTranslations()
export function useTranslations(locale: string) {
  return function t(key: string) {
    return ui[locale]?.[key] ?? ui["en"][key];
  };
}
```

### Server Actions — Next.js → Astro Actions

```ts
// src/actions/contact.ts
import { defineAction } from "astro:actions";
import { z } from "zod";

export const contact = defineAction({
  accept: "form",
  input: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    message: z.string().min(10),
  }),
  handler: async (input, context) => {
    // rate limit via context.locals (set in middleware/app.ts)
    // DOMPurify sanitization
    // Nodemailer send
  },
});
```

### Rate limiting + Middleware — Next.js middleware → Astro 6.3 Advanced Routing

`astro/hono` wraps every Astro stage as a Hono middleware — logger, CORS, JWT, rate limiting, Zod
request validation all available as drop-ins alongside Astro's own pipeline.

```ts
// src/app.ts
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { logger } from "hono/logger";
import { actions, i18n, middleware, pages } from "astro/hono";

const app = new Hono();

app.use(logger());
app.use(rateLimiter({ windowMs: 60_000, limit: 30 }));
app.use(actions());
app.use(middleware());
app.use(pages());
app.use(i18n());

export default app;
```

### React Islands — what stays `.tsx` vs becomes `.astro`

| Component type                          | Migration                               |
| --------------------------------------- | --------------------------------------- |
| Pure display (no state, no events)      | ✅ → `.astro` — zero JS shipped         |
| Forms, inputs, controlled state         | ✅ → stays `.tsx` with `client:load`    |
| Animations (GSAP ScrollTrigger)         | ✅ → stays `.tsx` with `client:visible` |
| Sliders, accordions, modals             | ✅ → stays `.tsx` with `client:visible` |
| Navigation (mobile menu, lang selector) | ✅ → stays `.tsx` with `client:load`    |
| JSON-LD, static icons, static links     | ✅ → `.astro`                           |

### Env vars — `next/env` → `astro:env`

```ts
// astro.config.ts
env: {
  schema: {
    SMTP_HOST: envField.string({ context: "server", access: "secret" }),
    SMTP_PORT: envField.number({ context: "server", access: "secret" }),
    SMTP_USER: envField.string({ context: "server", access: "secret" }),
    SMTP_PASS: envField.string({ context: "server", access: "secret" }),
    RECAPTCHA_SECRET: envField.string({ context: "server", access: "secret" }),
    PUBLIC_SITE_URL: envField.string({ context: "client", access: "public" }),
    PUBLIC_RECAPTCHA_KEY: envField.string({ context: "client", access: "public" }),
  },
}
```

### What has no direct equivalent

| Next.js feature        | Astro equivalent                                                 |
| ---------------------- | ---------------------------------------------------------------- |
| `next/font`            | Native CSS `@font-face` or `fontsource` packages                 |
| `next/image`           | `<Image />` from `astro:assets`                                  |
| `useRouter()`          | `<a>` tags + `Astro.redirect()` on server                        |
| `usePathname()`        | `Astro.url.pathname` in `.astro`, pass as prop to React islands  |
| `generateMetadata()`   | `<meta>` tags in `.astro` frontmatter or `metadata.ts` helper    |
| `loading.tsx` Suspense | `transition:animate` + `<ViewTransitions />`                     |
| `not-found.tsx`        | `src/pages/404.astro`                                            |
| `error.tsx`            | `<ErrorBoundary>` wrapping React islands + `src/pages/500.astro` |

# PROJECT_MAP.md — `my-astro-project-using-bun`

> Travel/tourism site for **Amsirar Trip** — Morocco tours & excursions. Migrated from Next.js →
> Astro 6 (SSR, Node adapter).

---

## Stack

| Layer          | Choice                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| Framework      | **Astro 6.4** (server output, `@astrojs/node` standalone)              |
| UI Layer       | **React 19** islands (`client:load` / `client:visible`)                |
| Runtime        | **Bun**                                                                |
| CSS            | **Tailwind 4** (Vite plugin, no PostCSS config)                        |
| Types          | **TypeScript 6** (strictest, `erasableSyntaxOnly`)                     |
| Routing        | Astro `[...locale]` param (en/fr/de/es, default `en` prefixless)       |
| SSR Pipeline   | Hono (`src/app.ts`) — rate limit → middleware → actions → pages → i18n |
| Server Actions | Astro Actions (`src/actions/index.ts`) — booking, contact, newsletter  |
| Validation     | **Zod 4** (forms, env)                                                 |
| Animation      | **GSAP 3** + ScrollTrigger                                             |
| Icons          | **Lucide React**                                                       |
| Email          | **Nodemailer** (Gmail SMTP)                                            |
| Captcha        | **reCAPTCHA v2**                                                       |
| Image          | **sharp** (`astro:assets`)                                             |
| Lint           | **ESLint 10** (flat config) + **Prettier 3**                           |

---

## Directory Architecture

```
src/
├── actions/          Astro Server Actions (barrel: booking, contact, newsletter)
├── app.ts            Hono SSR pipeline entrypoint
├── features/         Domain modules (feature-based)
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
│   ├── [...locale]/index.astro     Home
│   ├── [...locale]/about.astro
│   ├── [...locale]/contact.astro
│   ├── [...locale]/privacy-policy.astro
│   ├── [...locale]/terms-of-service.astro
│   ├── [...locale]/tours/          Listing + [slug]
│   └── [...locale]/excursions/     Listing + [slug]
├── shared/           Reusable layout components + UI primitives
│   ├── layout/       Navbar.tsx, Footer.astro, PageHeader, etc.
│   ├── ui/           Image.astro/.tsx, JsonLd.astro, Loading, calendar, etc.
│   └── utilities/    ErrorBoundary.tsx
└── styles/global.css Tailwind v4 entry
```

---

## React Islands vs Astro Components

### React (`.tsx`) — interactive islands

| Component                  | Location                | Directive                                           |
| -------------------------- | ----------------------- | --------------------------------------------------- |
| `Navbar.tsx`               | `shared/layout/`        | `client:load`                                       |
| `DesktopMenu.tsx`          | `shared/layout/navbar/` | (imported by Navbar)                                |
| `MobileMenu.tsx`           | `shared/layout/navbar/` | (imported by Navbar)                                |
| `LanguageSelector.tsx`     | `shared/layout/navbar/` | (imported by Navbar)                                |
| `SocialLinks.tsx`          | `shared/layout/navbar/` | (imported by Navbar)                                |
| `PageHeader.tsx`           | `shared/layout/`        | (imported by Page layouts)                          |
| `FooterNewsletter.tsx`     | `shared/layout/footer/` | `client:load`                                       |
| `NewsletterModal.tsx`      | `shared/layout/footer/` | (imported by FooterNewsletter)                      |
| `AnimateOnScroll.tsx`      | `shared/ui/`            | `client:visible`                                    |
| `Image.tsx`                | `shared/ui/`            | Used from React files                               |
| `calendar.tsx`             | `shared/ui/`            | (imported by BookingForm)                           |
| `NativePopover.tsx`        | `shared/ui/`            | `client:visible`                                    |
| `PageTransitionLoader.tsx` | `shared/ui/`            | `client:visible`                                    |
| `Loading.tsx`              | `shared/ui/`            | Shared spinner                                      |
| `ErrorBoundary.tsx`        | `shared/utilities/`     | Error boundary wrapper                              |
| `HomeHero.tsx`             | `features/home/`        | `client:visible` (typing animation, image rotation) |
| `VideoSection.tsx`         | `features/home/`        | `client:visible` (play/pause)                       |
| `BookingForm.tsx`          | `features/booking/`     | `client:load`                                       |
| `ContactForm.tsx`          | `features/contact/`     | `client:load`                                       |

### Astro (`.astro`) — zero JS

All components under `features/tours/`, `features/excursions/`, `features/about/`,
`features/legal/`, and shared presentational layouts.

---

## Forms & Actions

| Form       | Action               | Captcha      | State Pattern                                              |
| ---------- | -------------------- | ------------ | ---------------------------------------------------------- |
| Booking    | `actions.booking`    | reCAPTCHA v2 | `useActionState` + `withState` → normalized to `FormState` |
| Contact    | `actions.contact`    | reCAPTCHA v2 | `useActionState` + `withState` → normalized to `FormState` |
| Newsletter | `actions.newsletter` | None         | `useActionState` + `withState`                             |

Core types: `FormState = { success: boolean; message: string; errors?: Record<string, string> }`

Astro SafeResult shape: `{ data: T; error: undefined } | { data: undefined; error: ActionError }`

---

## i18n

- **4 locales**: en (default, prefixless), fr, de, es
- **Translation files**: `public/locales/{en,fr,de,es}/common.json` (client-side, `fetch`-based)
- **Type-safe keys**: `src/i18n/ui.ts` (TypeScript dictionaries)
- **Usage**: `useTranslations(locale)` → `t("key")` returns `string`
- **Routing**: Astro built-in `[...locale]` param

---

## Key Config Files

| File                    | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `astro.config.ts`       | Site config, integrations, i18n, image, env, security |
| `tsconfig.json`         | TS6 strictest, `@/*` alias                            |
| `eslint.config.mjs`     | ESLint 10 flat config                                 |
| `prettier.config.ts`    | Prettier with Tailwind + import sorting               |
| `src/app.ts`            | Hono SSR pipeline                                     |
| `src/middleware.ts`     | Security headers + CSP                                |
| `src/lib/env.ts`        | Zod-validated server env                              |
| `src/lib/client-env.ts` | Client-safe env vars                                  |

---

## Known Technical Debt

1. **Lucide icons in .astro files** use `class` instead of `className` (TS errors from Astro check;
   runtime works via `set:html` passthrough)
2. **`key` prop** on HTML elements in `.astro` files (TS errors; Astro ignores it at runtime for
   static content)
3. **`astro check`** reports ~31 TS errors (all from `.astro` files, same root causes above)
4. **`.astro` files need formatting** — 1431 Prettier violations across the codebase
5. **React Compiler** is wired up in babel config but may need verification of compatibility with
   React 19.2
6. **`src/actions/index.ts`** is a single barrel file; `migration.md` references separate files that
   don't exist
7. **`src/assets/`** is an empty directory — can be removed
8. **Some `useClient` usage** may need `data-*` attribute sync for React 19 hydration

---

## [ORPHANS & PENDING]

> Intentionally empty — all orphaned files have been deleted, pending items are tracked as
> "unplanned cleanup" above.

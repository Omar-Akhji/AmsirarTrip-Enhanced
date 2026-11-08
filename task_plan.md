# Task Plan: i18n Modernization & Best Practices (AmsirarTrip)

## Goal

Perfect i18n across Astro 7 + Vue islands: single source of truth, zero dictionary leakage into
client bundles, strict type safety, canonical URL resolution in middleware, and zero build/type
errors without making unauthorized git commits.

## Architecture

- `src/locales/en/common.json`: Single source of truth.
- `src/i18n/types.ts`: Extracts `Messages` and `MessageKey` leaf paths for compiler validation.
- `src/i18n/client.ts` & `client-data.ts`: Minimal subtrees only for Vue islands (reduced 412 KB to
  29 KB).
- `src/middleware.ts`: Validates URL parameters, canonical redirects, and injects
  `Astro.locals.locale`.
- `scripts/i18n-check.ts`: CI/dev gate verifying 100% key and structure parity.

## Phases & Status

| Phase   | Description                                                                                                                     | Status       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Phase 0 | Safety net (audit script `scripts/i18n-check.ts` + Playwright `tests/i18n.spec.ts` 6/6 tests passing)                          | **COMPLETE** |
| Phase 1 | P0 Correctness (Middleware locale check, 39 missing keys added across all 4 locales, Vue payload slimming)                      | **COMPLETE** |
| Phase 2 | Type Safety & Code Simplification (Deleted `schema.ts`, added `types.ts`, `Intl.PluralRules`, single `locales.ts` import)       | **COMPLETE** |
| Phase 3 | Localized Trip Content & Structured Data (JSON-LD name/description/itinerary localized for tours, excursions, and video)        | **COMPLETE** |
| Phase 4 | SEO, Video Object, Hreflang & DevTools Polish (`hreflang`/`lang` on LanguageSelector, `Content-Language` header, zero warnings) | **COMPLETE** |
| Phase 5 | Inline Fallback Cleanup & Zero-Defect Linting (removed hardcoded fallbacks, ESLint + Stylelint 0 errors, Astro check 0 errors)  | **COMPLETE** |
| Phase 6 | E2E Browser Testing & Verification (`astro build` pass, Playwright 6/6 e2e passing on preview server)                           | **COMPLETE** |

## Rules

- NO GIT COMMITS unless explicitly commanded by user.
- All modifications tested with `bun run check`, `bun run lint`, `bun run build`, and `bun test:e2e`.
- Maintain strict focus with file-backed memory.

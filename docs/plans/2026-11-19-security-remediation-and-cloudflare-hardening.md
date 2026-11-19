# AmsirarTrip Security Remediation & Cloudflare Edge Hardening Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Execute task-by-task using Elephant & Goldfish
> Methodology (EGM) verification gates (`fix-finding` -> `verify-fix` -> stateless Goldfish
> re-audit). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all 12 validated application, middleware, caching, runtime, and edge-to-origin
security vulnerabilities in AmsirarTrip (`amsirartrip.com`) and establish defense-in-depth
Cloudflare protection (Origin Auth, WAF, Rate Limiting, Turnstile, Cache Rules, DNS/Email Auth).

**Architecture:** Harden the Astro 7.4.13 SSR (`@astrojs/node` standalone) origin first so every
boundary fails closed independently of upstream proxies, replace fragile per-request regex-stamped
CSP nonces with Astro 7's native build-time hash CSP (`security.csp`) to safely coexist with
caching, and layer Cloudflare edge controls (Origin Verification, Wirefilter WAF, Edge Rate
Limiting, and Turnstile) in front of the origin.

**Tech Stack:** Astro 7.4.13, `@astrojs/node` 11.1.14, Vue 3.5, Tailwind CSS v4, Bun (`>=1.4.4`),
Nodemailer 10.6, Playwright, Cloudflare (WAF Rulesets, Rate Limiting, Turnstile, Transform Rules,
Cache Rules, DNSSEC/DMARC).

**Methodology & Active Skills:**

- **EGM (Elephant & Goldfish Methodology)**: Primary Elephant coordinator + 3 independent stateless
  Goldfish adversarial audits (Server/API, HTTP/Client, Cloudflare Edge) completed on `2026-11-19`.
- **Codex Security Playbooks**: `threat-model`, `finding-discovery`, `validation`,
  `attack-path-analysis`, `resolve-dependency-alert`, `propose-security-hardening`, `fix-finding`,
  `verify-fix`.
- **Cloudflare Skills**: `cloudflare` (WAF, Turnstile, Rate Limiting, Cache Rules, Bot Management,
  DDoS, Origin Pulls), `workers-best-practices`.
- **Execution Standards**: `writing-plans` + `ponytail` (shortest working diff, reuse platform
  primitives first, zero speculative abstractions).

## Global Constraints

- Always use **Bun** (`bun`, `bun run`, `bunx`, `bun add`, `bun install`) — never `npm`, `yarn`,
  `pnpm`, or `npx`.
- Never use `!important` anywhere in CSS, HTML, Tailwind utilities, or templates.
- Dependency audit baseline (`bun audit` on `2026-11-19`): **0 known vulnerabilities** across 838
  packages (`bun.lock`).
- Zero geo-blocking on Cloudflare (international tourists book from global IPs, roaming SIMs, hotel
  Wi-Fi, and VPNs across `en`, `fr`, `de`, `es`).
- Every code task must pass `bun run verify` (`format:check`, `lint`, `check`) + targeted security
  tests before moving to the next task.

---

## 1. Threat Model & Trust Boundaries

```
[Untrusted Internet / Bots / Tourists]
          │  (TLS 1.2/1.3)
          ▼
[Cloudflare Edge: DDoS -> Custom WAF -> Managed WAF -> Rate Limit -> Cache -> Transform]
          │  (TLS Full Strict + X-Origin-Verify / AOP mTLS / Tunnel)
          ▼
[Hostinger / Standalone Node Origin: @astrojs/node (port 4321, bodySizeLimit 65KB)]
          ├── Astro memoryCache() (public GET pages + catalog JSON; NO 4xx/5xx; NO query-string keys)
          ├── src/middleware.ts (Origin verification, locale routing, security headers)
          ├── src/actions/index.ts (POST /_actions/{booking,contact,newsletter} -> Rate Limit -> Zod -> Turnstile/Cap -> Nodemailer Gmail SMTP)
          ├── src/pages/api/*.json.ts (GET public catalog JSON)
          └── src/pages/api/cap/* (POST Cap PoW — hardened in Phase 1, removed in Phase 3 upon Turnstile migration)
```

**Primary Assets to Protect:**

1. **Availability of the Node SSR process & catalog APIs** (prevent OOM, event-loop CPU stalls,
   midnight stream crashes, and 429 cache poisoning).
2. **Gmail SMTP quota & sender reputation (`GMAIL_USER` / `amsirartrip.com`)** (prevent automated
   spam relays and booking inbox flooding).
3. **Guest booking/contact PII** (names, emails, phones, travel dates in transit and in server
   logs).
4. **Browser integrity of visitors** (prevent CSP bypass/downgrade, script injection, clickjacking,
   and untrusted iframe loading).

---

## 2. Validated Vulnerability Ledger (Cross-Verified by 3 Goldfish Auditors)

| ID         | Severity     | Finding                                                                                                                                                                                                                                                        | CWE                       | Evidence (`file:line`)                                                                                                                                                            | Closed By       |
| ---------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **SEC-01** | **Critical** | Hardcoded fallback `CAP_SECRET_KEY` (`"amsirar-default-dev-cap-secret-key-32b"`) + unconditional `capStore.consumeToken()` enables offline zero-PoW CAPTCHA forgery                                                                                            | CWE-798, CWE-347, CWE-636 | `src/pages/api/cap/challenge.ts:8`, `src/pages/api/cap/redeem.ts:9`, `src/services/recaptcha.ts:36-38`                                                                            | Task 1 & Task 7 |
| **SEC-02** | **Critical** | Unconditional trust of spoofable proxy IP headers (`CF-Connecting-IP`, `X-Real-IP`, leftmost `X-Forwarded-For`), prod `127.0.0.1` honeypot bypass, and multi-tenant wildcard `*.hostingersite.com` in `allowedDomains`                                         | CWE-290, CWE-348, CWE-644 | `src/actions/helpers/action-guards.ts:10-29`, `astro.config.mjs:46-50`                                                                                                            | Task 2 & Task 8 |
| **SEC-03** | **High**     | Broken midnight UTC log rotation leaves ended `WriteStream` in `streams`, causing uncaught async `ERR_STREAM_WRITE_AFTER_END` process crash (remote DoS) + pre-rate-limit honeypot disk flooding                                                               | CWE-404, CWE-755, CWE-770 | `src/services/logger.ts:42-68`, `src/actions/index.ts:28-34,84-90`                                                                                                                | Task 3          |
| **SEC-04** | **High**     | Web Cache Poisoning DoS: HTTP 429 responses on `/api/*.json` (and 404 slug rewrites) cached globally for 15–30 min in `memoryCache()`; arbitrary query strings evict the 1,000-entry LRU                                                                       | CWE-524, CWE-400          | `astro.config.mjs:55,74`, `src/pages/api/{tours,excursions,destinations}.json.ts:6-21`, `src/pages/[...locale]/{tours,excursions}/[slug].astro:22-28`                             | Task 4          |
| **SEC-05** | **High**     | Unthrottled `/api/cap/*` with 1 GiB `@astrojs/node` default `bodySizeLimit`, unbounded `capStore` Maps, and pre-nonce-check synchronous WASM verification (OOM & CPU DoS)                                                                                      | CWE-770, CWE-400          | `astro.config.mjs:24`, `src/pages/api/cap/{challenge,redeem}.ts`, `src/services/cap-store.ts:12-37`                                                                               | Task 1 & Task 7 |
| **SEC-06** | **High**     | CSP Nonce vs Cache Architecture Conflict (`memoryCache` reuses 1 static nonce for up to 8 days) + post-render regex `<script` nonce stamping blindly blesses injected `<script>` tags + `data-csp-nonce` DOM exposure                                          | CWE-330, CWE-693, CWE-200 | `astro.config.mjs:55-67`, `src/middleware.ts:75-115`, `src/layouts/Layout.astro:55`, `src/scripts/theme-init.ts:1-5`                                                              | Task 5          |
| **SEC-07** | **High**     | Production CSP downgrade to Development policy (`'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net`, no `upgrade-insecure-requests`) via un-gated `LOCAL_HOSTS` fallback when `Host`/`X-Forwarded-Proto` is unrecognized                                          | CWE-693, CWE-290          | `src/lib/constants/hosts.ts:3`, `src/lib/security-headers.ts:9,32-34,59`, `src/middleware.ts:82`                                                                                  | Task 5          |
| **SEC-08** | **Medium**   | Security headers & HSTS bypassed on static/prerendered files, missing-asset 404 HTML responses (cached 1 year `immutable`!), and `/en/*` 301 redirects                                                                                                         | CWE-693                   | `src/middleware.ts:29-67`, `astro.config.mjs:24`                                                                                                                                  | Task 5 & Task 8 |
| **SEC-09** | **Medium**   | Runtime `NODE_ENV=development` CAPTCHA bypass in prod builds, `?wasm=0` downgrade, cleartext `http://` external Cap verify, missing `challenge_ts` fail-open, and missing CAPTCHA reset on `NewsletterModal.vue` failure                                       | CWE-489, CWE-757          | `src/services/recaptcha.ts:28-33,41,122-128`, `src/layouts/footer/NewsletterModal.vue:50-65`                                                                                      | Task 1 & Task 7 |
| **SEC-10** | **Low**      | Prototype lookup crash (`language=toString` -> `TypeError`), post-validation `.trim()` bypassing `.min()`/`.regex()`, unbounded `z.email()`, unescaped inline `mailto:`/`tel:` `href`, `logger.ts` `...extra` overwrite, email `target="_blank"` missing `rel` | CWE-20, CWE-79, CWE-1321  | `src/actions/helpers/form-helpers.ts:8-10`, `src/lib/schemas.ts:13-107`, `src/actions/helpers/email-templates.ts:95,182,370,378,496,504,593`, `src/services/logger.ts:57,134-140` | Task 6          |
| **SEC-11** | **Low**      | Map facades omit URL origin validation, iframe `sandbox`, and strict `referrerPolicy`                                                                                                                                                                          | CWE-79, CWE-1021, CWE-200 | `src/scripts/route-map-facade.ts:10-27`, `src/scripts/contact-map-facade.ts:13-16`, `src/features/contact/components/ContactView.astro:226-234`                                   | Task 6          |
| **SEC-12** | **Low**      | Information disclosure (`meta generator` exposing `Astro v7.4.13`), unneeded public test/reference files (`slider-ref/`, `banana-*.png`, duplicate `public/llms.txt`), committed `logs/*.log`, missing `.gitignore`                                            | CWE-200, CWE-538          | `src/layouts/Layout.astro:103-106`, `public/images/slider-ref/`, `public/images/banana-*.png`, `public/llms.txt`, `logs/`                                                         | Task 6          |

**Verified Clean Surfaces (No Fix Needed):**

- `bun audit`: 0 vulnerabilities across 838 packages.
- SMTP header injection (`form-helpers.ts:19-24`, `email.ts:76-87`), Email HTML body escaping,
  `JsonLd.astro` escaping, `webmcp-tools.ts` `navigate_to`, `capture.ts` SVG-as-image isolation,
  `middleware.ts` locale redirect open-redirect safety, all 12 web UI `target="_blank"` links
  (`rel="noopener noreferrer"`).

---

## 3. File Structure Map

| Action | Path                                                                                                                        | Responsibility                                                                                                                                                                                |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modify | `astro.config.mjs`                                                                                                          | `bodySizeLimit: 65_536`, `staticHeaders: true`, remove `*.hostingersite.com`, `memoryCache({ query: { include: [] } })`, native `security.csp`, `ORIGIN_VERIFY_SECRET` & Turnstile env schema |
| Modify | `src/env.d.ts`                                                                                                              | Add `isCloudflareVerified: boolean` to `App.Locals`; remove `cspNonce` once migrated to Astro native hash CSP                                                                                 |
| Modify | `src/lib/env.ts`                                                                                                            | Export `ORIGIN_VERIFY_SECRET` and (Phase 3) `TURNSTILE_SECRET_KEY`                                                                                                                            |
| Modify | `src/lib/constants/hosts.ts`                                                                                                | Gate `LOCAL_HOSTS` strictly on `!isProduction`; keep `TRUSTED_HOSTS` apex/www only in prod                                                                                                    |
| Modify | `src/lib/security-headers.ts`                                                                                               | Gate `isLocal` on `!import.meta.env.PROD`; remove dead reCAPTCHA/CDN origins; align non-CSP headers with Astro native `security.csp`                                                          |
| Modify | `src/middleware.ts`                                                                                                         | Enforce `X-Origin-Verify` in prod (`timingSafeEqual`), fix 404/301 security header bypass, remove regex `<script` nonce rewriter                                                              |
| Delete | `src/lib/csp.ts`                                                                                                            | Obsoleted once Astro 7 native hash-based `security.csp` replaces per-request nonces                                                                                                           |
| Modify | `src/actions/helpers/action-guards.ts`                                                                                      | Trust `cf-connecting-ip` ONLY when `isCloudflareVerified === true`; remove `127.0.0.1` prod honeypot bypass; pass `expectedAction` to CAPTCHA verifier                                        |
| Modify | `src/actions/index.ts`                                                                                                      | Run `enforceRateLimit` BEFORE `isHoneypotTriggered`; pass `context.locals.isCloudflareVerified` and explicit action name to guards                                                            |
| Modify | `src/lib/api-utils.ts`                                                                                                      | Prune expired entries before FIFO eviction so active bans/limits cannot be evicted by expired keys                                                                                            |
| Modify | `src/services/logger.ts`                                                                                                    | Fix midnight rotation key deletion (`delete streams[key]`), attach `.on("error")` handler, fix `...extra`/`...meta` spread order                                                              |
| Modify | `src/services/cap-store.ts`                                                                                                 | Bound `tokens` & `nonces` Maps to max 5,000 entries with expired-first pruning (deleted in Task 7 if migrating to Turnstile)                                                                  |
| Modify | `src/pages/api/cap/challenge.ts` & `redeem.ts`                                                                              | Remove hardcoded fallback secret (fail closed in prod), add rate limiting & 16 KB body cap (deleted in Task 7 if migrating to Turnstile)                                                      |
| Modify | `src/services/recaptcha.ts`                                                                                                 | Remove `NODE_ENV=development` prod bypass, enforce `https://` & `challenge_ts` (replaced by `src/services/turnstile.ts` in Task 7)                                                            |
| Modify | `src/pages/api/{tours,excursions,destinations}.json.ts`                                                                     | Call `cache.set(false)` on 429 responses; pass `locals.isCloudflareVerified` to `extractClientIp`                                                                                             |
| Modify | `src/pages/[...locale]/{tours,excursions}/[slug].astro`                                                                     | Call `Astro.cache.set(false)` before returning 404 rewrite                                                                                                                                    |
| Modify | `src/lib/schemas.ts`, `src/actions/helpers/form-helpers.ts`, `src/actions/helpers/email-templates.ts`                       | Trim before min/regex, `z.email().max(254)`, `z.enum(LOCALES)`, `Object.hasOwn` lookup, escape inline `mailto:`/`tel:`, add `rel="noopener noreferrer"`                                       |
| Modify | `src/layouts/Layout.astro`, `src/scripts/theme-init.ts`, `src/layouts/footer/NewsletterModal.vue`                           | Remove `meta generator` and `data-csp-nonce`; reset CAPTCHA on Newsletter errors                                                                                                              |
| Modify | `src/scripts/route-map-facade.ts`, `src/scripts/contact-map-facade.ts`, `src/features/contact/components/ContactView.astro` | Validate Google Maps embed URL origin, add iframe `sandbox`, tighten `referrerPolicy`                                                                                                         |
| Create | `.gitignore`                                                                                                                | Exclude `logs/`, `scratch/`, `playwright-report/`, `test-results/`, `rem-reports/`, `.env*`                                                                                                   |
| Delete | `public/images/slider-ref/`, `public/images/banana-*.png`, `public/llms.txt`, `logs/*.log`, `Gemini_Generated_Image_*.jpg`  | Remove public test assets, duplicate discovery file, and committed logs                                                                                                                       |
| Create | `tests/security.spec.ts`                                                                                                    | Automated security regression tests covering SEC-01 through SEC-12                                                                                                                            |
| Create | `docs/cloudflare/security-rules.tf` (optional IaC)                                                                          | Versioned Cloudflare Terraform rulesets (Origin Auth, WAF, Rate Limit, Cache, Response Headers)                                                                                               |

---

## Phase 1 (P0): Immediate Origin & Runtime Vulnerability Closure

### Task 1: Eliminate Hardcoded Cap Secret Fallback, Bound `/api/cap/*` DoS Vectors, and Fix Dev Bypass (Closes SEC-01, SEC-05, SEC-09)

**Files:**

- Modify: `astro.config.mjs:24`
- Modify: `src/services/cap-store.ts:11-77`
- Modify: `src/pages/api/cap/challenge.ts:1-30`
- Modify: `src/pages/api/cap/redeem.ts:1-48`
- Modify: `src/services/recaptcha.ts:22-144`
- Modify: `src/layouts/footer/NewsletterModal.vue:50-68`
- Test: `tests/security-unit.test.ts` (Bun test runner: `bun test`)

**Interfaces:**

- Produces: `getCapSecret(): string | null` (returns configured `>= 32`-byte secret, ephemeral dev
  random secret in `DEV`, or `null` in `PROD` to fail closed).
- Produces: bounded `capStore` (`MAX_ENTRIES = 5_000`) and
  `node({ mode: "standalone", bodySizeLimit: 65_536 })`.

- [ ] **Step 1: Write failing unit tests for SEC-01, SEC-05, SEC-09**

Create `tests/security-unit.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { capStore } from "../src/services/cap-store";

describe("SEC-05: capStore capacity bounding", () => {
  test("never grows unbounded beyond MAX_ENTRIES", () => {
    const future = Date.now() + 60_000;
    for (let i = 0; i < 6_000; i++) {
      capStore.saveToken(`id${i}:hash${i}`, future);
    }
    expect(capStore.size().tokens).toBeLessThanOrEqual(5_000);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test tests/security-unit.test.ts` Expected: FAIL (`capStore.size is not a function` or
size exceeds `5_000`).

- [ ] **Step 3: Set `bodySizeLimit: 65_536` on `@astrojs/node` in `astro.config.mjs:24`**

```js
adapter: node({ mode: "standalone", bodySizeLimit: 65_536, staticHeaders: true }),
```

- [ ] **Step 4: Bound `capStore` Maps in `src/services/cap-store.ts`**

Add `const MAX_CAP_ENTRIES = 5_000;`, a `pruneBeforeInsert(map)` helper that first deletes expired
entries and evicts oldest entry only if still `>= MAX_CAP_ENTRIES`, and a read-only `size()` helper
for testing:

```ts
const MAX_CAP_ENTRIES = 5_000;

private enforceCapacity<T extends { readonly expires: number }>(map: Map<string, T>): void {
  if (map.size < MAX_CAP_ENTRIES) return;
  const now = Date.now();
  for (const [key, item] of map) {
    if (item.expires < now) map.delete(key);
  }
  while (map.size >= MAX_CAP_ENTRIES) {
    const oldest = map.keys().next().value;
    if (oldest === undefined) break;
    map.delete(oldest);
  }
}

public size = (): { nonces: number; tokens: number } => ({
  nonces: this.nonces.size,
  tokens: this.tokens.size,
});
```

Call `this.enforceCapacity(this.nonces)` before `this.nonces.set(...)` and
`this.enforceCapacity(this.tokens)` before `this.tokens.set(...)`.

- [ ] **Step 5: Fail closed on missing `CAP_SECRET_KEY`, rate-limit `/api/cap/*`, enforce 16 KB body
      limit, and tighten TTLs**

Create a tiny helper `getCapSecret()` inside `src/services/cap-store.ts` (avoiding extra files per
Ponytail):

```ts
import { createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

const DEV_EPHEMERAL_SECRET = import.meta.env.DEV ? randomBytes(32).toString("hex") : "";

export function getCapSecret(): string | null {
  const configured = env.CAP_SECRET_KEY.trim();
  if (Buffer.byteLength(configured, "utf8") >= 32) return configured;
  return import.meta.env.DEV ? DEV_EPHEMERAL_SECRET : null;
}
```

Update `src/pages/api/cap/challenge.ts`:

- Extract IP via `extractClientIp(request, clientAddress, locals.isCloudflareVerified)` and enforce
  `checkRateLimit(\`cap:\${ip}\`, 20, 60_000)`-> return HTTP`429`with`Cache-Control: no-store`.
- Call
  `const secret = getCapSecret(); if (!secret) return Response.json({ error: "CAPTCHA unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });`.
- Tighten challenge expiry (`expiresMs: 3 * 60 * 1000`).

Update `src/pages/api/cap/redeem.ts`:

- Enforce `checkRateLimit(\`cap:\${ip}\`, 20, 60_000)`-> return HTTP`429`.
- Require `content-type` includes `application/json`, reject
  `Number(request.headers.get("content-length")) > 16_384` with `413`, and read via
  `const rawText = await request.text(); if (Buffer.byteLength(rawText, "utf8") > 16_384) return Response.json({ success: false, reason: "payload_too_large" }, { status: 413 });`.
- Use `getCapSecret()` (return `503` if `null`) and tighten `tokenTtlMs: 5 * 60 * 1000`.

- [ ] **Step 6: Fix `src/services/recaptcha.ts` and `src/layouts/footer/NewsletterModal.vue`**

In `src/services/recaptcha.ts`:

- Line 28: Change `const isDev = import.meta.env.DEV || process.env["NODE_ENV"] === "development";`
  -> `const isDev = import.meta.env.DEV;`.
- Line 36: Gate `capStore.consumeToken(token)` behind `Boolean(getCapSecret())`.
- Line 41: Change `PUBLIC_CAP_API_ENDPOINT?.startsWith("http")` ->
  `PUBLIC_CAP_API_ENDPOINT?.startsWith(isDev ? "http" : "https://")`.
- Line 122: Fail closed if `!challengeTs` (`if (!challengeTs) return false;`).

In `src/layouts/footer/NewsletterModal.vue:50-68`:

- Call `recaptchaRef.value?.reset()` inside `if (error)`, inside `else` when `!data.ok`, and inside
  `catch`.

- [ ] **Step 7: Run tests & verification**

Run: `bun test tests/security-unit.test.ts && bun run verify` Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add astro.config.mjs src/services/cap-store.ts src/pages/api/cap/ src/services/recaptcha.ts src/layouts/footer/NewsletterModal.vue tests/security-unit.test.ts
git commit -m "fix(security): fail closed on CAP_SECRET_KEY, bound capStore, rate-limit /api/cap, fix dev bypass"
```

---

### Task 2: Lock Down Origin Trust Boundary, Proxy IP Extraction, Honeypot, and `allowedDomains` (Closes SEC-02)

**Files:**

- Modify: `astro.config.mjs:44-52, 89-106`
- Modify: `src/env.d.ts:14-19`
- Modify: `src/lib/env.ts:1-9`
- Modify: `src/middleware.ts:27-59`
- Modify: `src/actions/helpers/action-guards.ts:10-41`
- Modify: `src/actions/index.ts:26, 82, 137`
- Modify: `src/pages/api/{tours,excursions,destinations}.json.ts:6-8`
- Modify: `src/lib/api-utils.ts:7-13`
- Test: `tests/security-unit.test.ts`

**Interfaces:**

- Produces: `App.Locals.isCloudflareVerified: boolean`
- Produces:
  `extractClientIp(request: Request, clientAddress?: string, isCloudflareVerified?: boolean): string`

- [ ] **Step 1: Write failing unit tests for IP spoofing, honeypot prod bypass, and rate-limit
      eviction**

Append to `tests/security-unit.test.ts`:

```ts
import { extractClientIp, isHoneypotTriggered } from "../src/actions/helpers/action-guards";

describe("SEC-02: IP extraction & honeypot", () => {
  test("ignores spoofed CF-Connecting-IP and X-Forwarded-For when unverified", () => {
    const req = new Request("https://amsirartrip.com/_actions/contact", {
      headers: {
        "cf-connecting-ip": "127.0.0.1",
        "x-real-ip": "1.2.3.4",
        "x-forwarded-for": "5.6.7.8, 9.10.11.12",
      },
    });
    expect(extractClientIp(req, "203.0.113.50", false)).toBe("203.0.113.50");
  });

  test("uses CF-Connecting-IP ONLY when isCloudflareVerified is true", () => {
    const req = new Request("https://amsirartrip.com/_actions/contact", {
      headers: { "cf-connecting-ip": "198.51.100.22" },
    });
    expect(extractClientIp(req, "172.64.0.1", true)).toBe("198.51.100.22");
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test tests/security-unit.test.ts` Expected: FAIL (`extractClientIp` currently returns
`"127.0.0.1"` even when unverified).

- [ ] **Step 3: Remove `*.hostingersite.com` and add `ORIGIN_VERIFY_SECRET` in `astro.config.mjs` &
      `src/lib/env.ts`**

In `astro.config.mjs`:

```js
security: {
  checkOrigin: true,
  allowedDomains: [
    { hostname: "amsirartrip.com", protocol: "https" },
    { hostname: "www.amsirartrip.com", protocol: "https" },
  ],
  actionBodySizeLimit: 65_536,
},
```

In `env.schema`:

```js
ORIGIN_VERIFY_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
```

In `src/lib/env.ts`, export
`ORIGIN_VERIFY_SECRET: ORIGIN_VERIFY_SECRET ?? process.env["ORIGIN_VERIFY_SECRET"] ?? ""`. In
`src/env.d.ts`, add `isCloudflareVerified: boolean;` to `App.Locals`.

- [ ] **Step 4: Enforce constant-time `X-Origin-Verify` check at top of `src/middleware.ts`**

```ts
import { timingSafeEqual } from "node:crypto";
import { env } from "./lib/env";

function isValidOriginSecret(provided: string | null, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
```

At the start of `onRequest` (before static/discovery branches):

```ts
const configuredOriginSecret = env.ORIGIN_VERIFY_SECRET.trim();
if (import.meta.env.PROD && configuredOriginSecret.length > 0) {
  const headerVal = context.request.headers.get("x-origin-verify");
  if (!isValidOriginSecret(headerVal, configuredOriginSecret)) {
    return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  context.locals.isCloudflareVerified = true;
} else {
  context.locals.isCloudflareVerified = false;
}
```

_(Note: Deploying `ORIGIN_VERIFY_SECRET` alongside Cloudflare Transform Rule in Task 8 immediately
locks down direct-to-origin bypass; until the secret is set, `isCloudflareVerified` stays `false` so
spoofed `CF-Connecting-IP` headers are STILL rejected!)_

- [ ] **Step 5: Harden `extractClientIp`, `isHoneypotTriggered`, and `enforceMapCapacity`**

In `src/actions/helpers/action-guards.ts`:

```ts
export function extractClientIp(
  request: Request,
  clientAddress?: string,
  isCloudflareVerified = false,
): string {
  if (isCloudflareVerified) {
    const cfIp = request.headers.get("cf-connecting-ip")?.trim();
    if (cfIp && isIP(cfIp) !== 0) {
      return cfIp;
    }
  }
  const fallback = clientAddress?.trim();
  return fallback && isIP(fallback) !== 0 ? fallback : "unknown";
}

export function isHoneypotTriggered(value: string, ip: string, actionName: string): boolean {
  if (value.trim().length > 0) {
    if (import.meta.env.DEV) {
      logSecurityEvent("HONEYPOT", ip, `${actionName} (ignored in dev)`);
      return false;
    }
    logSecurityEvent("HONEYPOT", ip, `${actionName} (value: "${value.trim().slice(0, 32)}")`);
    return true;
  }
  return false;
}
```

Update all callers (`src/actions/index.ts:26,82,137`,
`src/pages/api/{tours,excursions,destinations}.json.ts:7`,
`src/pages/api/cap/{challenge,redeem}.ts`) to pass `context.locals.isCloudflareVerified`. In
`src/lib/api-utils.ts:7-13`, prune expired records before evicting oldest keys in
`enforceMapCapacity`.

- [ ] **Step 6: Run tests & verification**

Run: `bun test tests/security-unit.test.ts && bun run verify` Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add astro.config.mjs src/env.d.ts src/lib/env.ts src/middleware.ts src/actions/ src/pages/api/ src/lib/api-utils.ts tests/security-unit.test.ts
git commit -m "fix(security): harden origin trust boundary, prevent IP spoofing and prod honeypot bypass"
```

---

### Task 3: Fix Midnight UTC Logger Crash (Remote DoS) & Pre-Rate-Limit Honeypot Disk Flooding (Closes SEC-03)

**Files:**

- Modify: `src/services/logger.ts:41-68, 128-141`
- Modify: `src/actions/index.ts:26-36, 82-92`
- Test: `tests/security-unit.test.ts`

- [ ] **Step 1: Write failing test reproducing the UTC midnight rotation crash**

Append to `tests/security-unit.test.ts`:

```ts
import { logger } from "../src/services/logger";

describe("SEC-03: logger date rotation stability", () => {
  test("does not write to an ended stream across UTC date rollover", async () => {
    const realToISOString = Date.prototype.toISOString;
    let fakeDate = "2026-11-19T23:59:59.000Z";
    Date.prototype.toISOString = () => fakeDate;
    try {
      logger.security("day1-event", { ip: "198.51.100.1" });
      fakeDate = "2026-11-20T00:00:01.000Z";
      logger.security("day2-event", { ip: "198.51.100.1" });
      await new Promise((r) => setTimeout(r, 25));
    } finally {
      Date.prototype.toISOString = realToISOString;
    }
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it crashes with `ERR_STREAM_WRITE_AFTER_END`**

Run: `bun test tests/security-unit.test.ts` Expected: FAIL with
`ERR_STREAM_WRITE_AFTER_END: write after end`.

- [ ] **Step 3: Fix `getStream` rotation & attach stream error listener in
      `src/services/logger.ts`**

```ts
function getStream(level: LogLevel): WriteStream {
  const today = new Date().toISOString().split("T", 1)[0] ?? "";
  if (today !== activeDate) {
    for (const key of Object.keys(streams) as LogLevel[]) {
      streams[key]?.end();
      delete streams[key];
    }
    activeDate = today;
  }
  if (!streams[level]) {
    const filePath = `${LOG_DIR}/${today}-${level}.log`;
    const stream = disk.createStream(filePath, { flags: "a" });
    stream.on("error", (err) => {
      console.error(`[Logger] Stream error for ${level}:`, err);
      if (streams[level] === stream) {
        delete streams[level];
      }
    });
    streams[level] = stream;
  }
  return streams[level];
}
```

Also fix spread order in `formatLogEntry`
(`{ ...meta, timestamp: new Date().toISOString(), level, message }`) and `logSecurityEvent`
(`{ ...extra, ip: ..., type, details: ..., userAgent: ... }`) to close the log-field clobbering
piece of SEC-10.

- [ ] **Step 4: Reorder `enforceRateLimit` BEFORE `isHoneypotTriggered` in `src/actions/index.ts`**

In both `booking` (`lines 28-34`) and `contact` (`lines 84-90`), run `enforceRateLimit(...)`
**first**, then `isHoneypotTriggered(...)`, so single-IP honeypot floods cannot write unbounded disk
logs.

- [ ] **Step 5: Run tests & verification**

Run: `bun test tests/security-unit.test.ts && bun run verify` Expected: PASS (zero uncaught errors).

- [ ] **Step 6: Commit**

```bash
git add src/services/logger.ts src/actions/index.ts tests/security-unit.test.ts
git commit -m "fix(security): fix midnight log rotation crash and rate-limit honeypot logging"
```

---

### Task 4: Close Web Cache Poisoning DoS (`429` / `404` Caching & Query-String LRU Eviction) (Closes SEC-04)

**Files:**

- Modify: `astro.config.mjs:55`
- Modify: `src/pages/api/destinations.json.ts:6-22`
- Modify: `src/pages/api/excursions.json.ts:6-22`
- Modify: `src/pages/api/tours.json.ts:6-22`
- Modify: `src/pages/[...locale]/tours/[slug].astro:25-28`
- Modify: `src/pages/[...locale]/excursions/[slug].astro:22-25`

- [ ] **Step 1: Disable arbitrary query-string cache partitioning in `astro.config.mjs:55`**

```js
cache: { provider: memoryCache({ query: { include: [] } }) },
```

- [ ] **Step 2: Bypass Astro cache on HTTP 429 in all three catalog JSON APIs**

In `src/pages/api/{destinations,excursions,tours}.json.ts`:

```ts
export const GET: APIRoute = async ({ cache, clientAddress, locals, request }) => {
  const ip = extractClientIp(request, clientAddress, locals.isCloudflareVerified);
  const rateLimit = checkRateLimit(`api:${ip}`, 60, 60_000);
  if (!rateLimit.allowed) {
    cache.set(false);
    return Response.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
```

- [ ] **Step 3: Bypass Astro cache on invalid-slug 404 rewrites**

In `src/pages/[...locale]/tours/[slug].astro:25-28` and
`src/pages/[...locale]/excursions/[slug].astro:22-25`:

```ts
if (!tourEntry) {
  Astro.cache.set(false);
  Astro.response.status = 404;
  return Astro.rewrite(locale === "en" ? "/404" : `/${locale}/404`);
}
```

- [ ] **Step 4: Build & verify 429/404 are never cached**

Run: `bun run build && bun run verify` Expected: Clean build, zero TS/lint errors. Verify in Task 9
Playwright/HTTP test that exhausting `api:<ip>` returns `429` without `CDN-Cache-Control` /
`X-Astro-Cache: HIT` for subsequent clean requests.

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs src/pages/api/ src/pages/\[...locale\]/
git commit -m "fix(security): prevent 429/404 cache poisoning and query-string LRU eviction"
```

---

## Phase 2 (P1): CSP Architecture, Security Headers, Input & Client Hygiene

### Task 5: Migrate to Astro 7 Native Hash-Based CSP, Eliminate Dev-CSP Prod Downgrade, and Fix Middleware 404/301 Header Bypasses (Closes SEC-06, SEC-07, SEC-08)

**Design Decision (from `propose-security-hardening`):**

- **Recommended**: Adopt **Astro 7.4.13's native hash-based `security.csp`**
  (`algorithm: "SHA-256"`). It computes exact SHA-256 hashes of every Astro-emitted script/style at
  build time, emits the `Content-Security-Policy` HTTP header via `@astrojs/node`, completely
  eliminates the vulnerable post-render regex `<script` nonce stamper (`middleware.ts:104-107`),
  eliminates `<html data-csp-nonce>` exposure, AND makes HTML responses 100% safe to cache in both
  `memoryCache()` and Cloudflare Edge!
- **Note on `cap-widget` before Task 7**: `cap-widget` creates an `<iframe srcdoc>` script using
  `CAP_SCRIPT_NONCE`. If executing Task 7 (Turnstile migration) immediately after, migrate to
  Turnstile and drop `'wasm-unsafe-eval'` / `worker-src blob:` / `cdn.jsdelivr.net` together. If
  keeping Cap temporarily, verify `cap-widget` works under hash CSP (`'wasm-unsafe-eval'` +
  `worker-src 'self' blob:`) via `bun run build && bun run test:e2e`.

**Files:**

- Modify: `astro.config.mjs:44-52`
- Modify: `src/lib/constants/hosts.ts:1-9`
- Modify: `src/lib/security-headers.ts:1-63`
- Modify: `src/middleware.ts:1-118`
- Modify: `src/layouts/Layout.astro:53-59`
- Modify: `src/scripts/theme-init.ts:1-6`
- Modify: `src/env.d.ts:14-19`
- Delete: `src/lib/csp.ts` (once native hash CSP is verified)

- [ ] **Step 1: Gate `LOCAL_HOSTS` strictly on `!isProduction` in `src/lib/constants/hosts.ts`**

```ts
const isProduction = import.meta.env.PROD;

export const LOCAL_HOSTS = new Set(isProduction ? [] : ["localhost", "127.0.0.1"]);

export const TRUSTED_HOSTS = new Set([
  "amsirartrip.com",
  "www.amsirartrip.com",
  ...(isProduction ? [] : ["localhost", "127.0.0.1"]),
]);
```

- [ ] **Step 2: Configure Astro 7 native `security.csp` in `astro.config.mjs`**

```js
security: {
  checkOrigin: true,
  allowedDomains: [
    { hostname: "amsirartrip.com", protocol: "https" },
    { hostname: "www.amsirartrip.com", protocol: "https" },
  ],
  actionBodySizeLimit: 65_536,
  csp: {
    algorithm: "SHA-256",
    directives: [
      "default-src 'self'",
      "font-src 'self'",
      "img-src 'self' blob: data: https://*.tripadvisor.com https://*.tripadvisor.de https://*.google.com https://*.gstatic.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
      "media-src 'self' blob: data:",
      // Add https://challenges.cloudflare.com in Task 7; narrow Google to /maps/ only
      "frame-src 'self' https://www.google.com/maps/ https://maps.google.com",
      "frame-ancestors 'self'",
      "connect-src 'self' https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ],
    scriptDirective: {
      resources: [
        "'self'",
        "'wasm-unsafe-eval'", // Removed in Task 7 upon Turnstile migration
      ],
    },
    styleDirective: {
      resources: [
        "'self'",
        { resource: "'unsafe-inline'", kind: "attribute" },
      ],
    },
  },
},
```

_(Verify in Step 5 whether any inline `<style>` tags from Tailwind v4/Vue require `style-src-elem`
hashes or if Astro hashes all built `<style>` elements automatically.)_

- [ ] **Step 3: Refactor `src/lib/security-headers.ts` (remove `isLocal` prod downgrade and
      duplicate CSP header)**

- Compute `const isLocal = !import.meta.env.PROD && LOCAL_HOSTS.has(normalizedHost);`.
- Return all baseline non-CSP security headers (`Strict-Transport-Security`, `X-Frame-Options`,
  `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`,
  `Cross-Origin-Resource-Policy`, `Permissions-Policy`, `X-Permitted-Cross-Domain-Policies`,
  `X-DNS-Prefetch-Control`).
- Ensure `Content-Security-Policy` is NOT emitted twice (browsers intersect duplicate CSP headers).
  Only add `frame-ancestors 'self'` via HTTP header if Astro's native CSP emits `<meta>` instead of
  an HTTP header on a given route — verify exact `curl -I` response headers in Step 5!

- [ ] **Step 4: Fix `src/middleware.ts` (remove regex `<script` rewriter; guard 404/301 headers)**

- On `isDiscoveryAsset` (`lines 34-41`) and `isStaticAsset` (`lines 43-58`):
  - Only apply static/discovery caching headers when
    `response.status < 400 && !(response.headers.get("content-type") ?? "").includes("text/html")`.
  - Always set `Strict-Transport-Security`, `Referrer-Policy`, `X-Content-Type-Options: nosniff`,
    `X-Permitted-Cross-Domain-Policies: none`.
  - If `response.status >= 400` (e.g., `/images/missing` or `/sitemap-missing.xml` -> 404 HTML), set
    `Cache-Control: no-store` and fall through to full security headers!
- On locale 301 redirect (`lines 64-67`): attach security headers (`Strict-Transport-Security`,
  `X-Content-Type-Options`, `Referrer-Policy`) to the redirect `Response`.
- Delete lines 74-78 (`generateNonce()`, `context.locals.cspNonce`) and lines 97-115 (regex
  `<script` rewriter), delete `src/lib/csp.ts`, remove `data-csp-nonce` from
  `src/layouts/Layout.astro:55`, and remove `CAP_SCRIPT_NONCE` from `src/scripts/theme-init.ts:1-5`.

- [ ] **Step 5: Build & smoke-test live headers + browser console (zero CSP violations)**

Run: `bun run build && bun run verify && bun run test:e2e` Verify against a built preview
(`bun run start`):

- `GET /` returns single `Content-Security-Policy` with `'sha256-...'`, NO `'unsafe-inline'` in
  `script-src`, NO `'unsafe-eval'`, NO `data-csp-nonce` in HTML.
- `GET /` with `Host: localhost` in production still emits production CSP (never dev CSP).
- `GET /images/does-not-exist` returns `404` with `Cache-Control: no-store` and full security
  headers (NOT `max-age=2592000`).
- `GET /en/tours` returns `301` with `Strict-Transport-Security` and
  `X-Content-Type-Options: nosniff`.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs src/lib/ src/middleware.ts src/layouts/Layout.astro src/scripts/theme-init.ts src/env.d.ts
git commit -m "fix(security): switch to Astro 7 hash CSP, block prod CSP downgrade, fix 404/301 headers"
```

---

### Task 6: Input Validation, Prototype Safety, Email/Map-Facade Hardening, and Repo/Public Hygiene (Closes SEC-10, SEC-11, SEC-12)

**Files:**

- Modify: `src/lib/schemas.ts:1-113`
- Modify: `src/actions/helpers/form-helpers.ts:1-11`
- Modify: `src/actions/helpers/email-templates.ts:95, 182, 370, 378, 496, 504, 593`
- Modify: `src/scripts/route-map-facade.ts:10-28`
- Modify: `src/scripts/contact-map-facade.ts:10-20`
- Modify: `src/features/contact/components/ContactView.astro:226-234`
- Modify: `src/layouts/Layout.astro:103-106`
- Create: `.gitignore`
- Delete: `public/images/slider-ref/`, `public/images/banana-*.png`, `public/llms.txt`,
  `logs/2026-11-08-security.log`, `logs/2026-11-10-security.log`,
  `Gemini_Generated_Image_hcfmy3hcfmy3hcfm.jpg`
- Test: `tests/security-unit.test.ts`

- [ ] **Step 1: Write failing unit tests for SEC-10 (`language=toString`, whitespace-only schemas,
      email max length)**

Append to `tests/security-unit.test.ts`:

```ts
import { getLanguageName } from "../src/actions/helpers/form-helpers";
import { getBookingSchema, getContactSchema } from "../src/lib/schemas";

const identity = (k: string) => k;

describe("SEC-10: validation & prototype safety", () => {
  test("getLanguageName rejects Object.prototype properties", () => {
    expect(typeof getLanguageName("toString")).toBe("string");
    expect(getLanguageName("toString")).toBe("toString");
  });

  test("schemas reject whitespace-only strings and oversized emails", () => {
    const contact = getContactSchema(identity).safeParse({
      name: "   ",
      email: `${"a".repeat(250)}@example.com`,
      phone: "       ",
      message: "          ",
      recaptchaToken: "token123",
    });
    expect(contact.success).toBe(false);

    const booking = getBookingSchema(identity).safeParse({
      reservationType: "   ",
      fullName: "   ",
      email: "user@example.com",
      phone: ".......",
      persons: 2,
      date: "2027-05-01",
      language: "toString",
      recaptchaToken: "token123",
    });
    expect(booking.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test tests/security-unit.test.ts` Expected: FAIL (`getLanguageName("toString")` returns
`[Function: toString]`, whitespace passes).

- [ ] **Step 3: Fix `src/actions/helpers/form-helpers.ts`, `src/lib/schemas.ts`, and
      `src/actions/helpers/email-templates.ts`**

1. In `src/actions/helpers/form-helpers.ts:8-10`:
   ```ts
   export function getLanguageName(code = ""): string {
     return Object.hasOwn(LANGUAGE_NAMES, code) ? LANGUAGE_NAMES[code]! : code;
   }
   ```
2. In `src/lib/schemas.ts`:
   - Move `.trim()` **before** `.min()` / `.max()` / `.regex()` on every string field.
   - Add `.max(254, { message: t("emailInvalid") })` on every `z.email(...)`.
   - Refine `phone` to require at least 7 ASCII digits:
     `.refine((v) => v.replaceAll(/\D/g, "").length >= 7, { message: t("phoneInvalid") })`.
   - Change `language` in `buildBookingSchema` to `z.enum(LOCALES).optional()` (import `LOCALES`
     from `@/i18n/locales`).
3. In `src/actions/helpers/email-templates.ts`:
   - Add `rel="noopener noreferrer"` to lines 95 and 182.
   - Escape inline `mailto:` and `tel:` attributes on lines 370, 378, 496, 504, 593
     (`href="mailto:${escapeHtml(safeReplyTo)}"` and
     `href="tel:${escapeHtml(data.phone.replaceAll(/\s+/g, ""))}"`).

- [ ] **Step 4: Harden Google Maps facades (`route-map-facade.ts`, `contact-map-facade.ts`,
      `ContactView.astro`)**

Add shared origin check before setting `iframe.src`:

```ts
function isTrustedGoogleMapsEmbedUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === "https:"
      && parsed.hostname === "www.google.com"
      && parsed.pathname.startsWith("/maps/embed")
    );
  } catch {
    return false;
  }
}
```

Set on both iframes:

- `sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"`
- `referrerPolicy = "strict-origin-when-cross-origin"`

- [ ] **Step 5: Remove `meta generator`, clean public/repo hygiene, and add `.gitignore`**

- Remove lines 103–106 (`<meta content={Astro.generator} name="generator" />`) from
  `src/layouts/Layout.astro`.
- Delete unreferenced public/repo artifacts:
  - `public/images/slider-ref/`
  - `public/images/banana-*.png` (verify with `grep -rn "banana-" src/` first = 0 matches)
  - `public/llms.txt` (duplicate of prerendered `src/pages/llms.txt.ts`)
  - `logs/2026-11-08-security.log`, `logs/2026-11-10-security.log`
  - `Gemini_Generated_Image_hcfmy3hcfmy3hcfm.jpg`
- Create `.gitignore` covering `node_modules/`, `dist/`, `.astro/`, `logs/`, `scratch/`,
  `playwright-report/`, `test-results/`, `rem-reports/`, `.env`, `.env.*`, `!.env.example`,
  `.eslintcache`, `.stylelintcache`, `tsconfig.tsbuildinfo`.

- [ ] **Step 6: Run tests & verification**

Run: `bun test tests/security-unit.test.ts && bun run verify` Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix(security): harden schemas, prototype lookup, email links, map iframes, and repo hygiene"
```

---

## Phase 3 (P1/P2): Cloudflare Turnstile Migration & Edge Security Hardening

### Task 7: Migrate CAPTCHA to Cloudflare Turnstile (Eliminates Cap PoW State/WASM/CSP Surface)

> **Prerequisite Decision:** Confirm migrating from Cap PoW (`capjs-core`/`cap-widget`) to
> **Cloudflare Turnstile (Managed)** (recommended: zero origin state, eliminates `/api/cap/*` +
> `'wasm-unsafe-eval'` + `worker-src blob:`, binds tokens to `hostname` and `action`). If you prefer
> to keep Cap PoW instead, skip Task 7 (Task 1 already closed Cap's critical vulnerabilities).

**Files:**

- Modify: `astro.config.mjs` (env schema + `security.csp` adding
  `https://challenges.cloudflare.com`, removing `'wasm-unsafe-eval'` & `worker-src blob:`)
- Modify: `src/lib/env.ts` & `src/lib/client-env.ts`
- Create: `src/services/turnstile.ts` (replacing `src/services/recaptcha.ts`)
- Create: `src/shared/ui/widgets/Turnstile.vue` (replacing `src/shared/ui/widgets/Recaptcha.vue`)
- Modify: `src/actions/helpers/action-guards.ts` & `src/actions/index.ts` (pass expected action
  `"booking" | "contact" | "newsletter"`)
- Modify: `src/features/booking/components/BookingForm.vue`,
  `src/features/contact/components/ContactForm.vue`, `src/layouts/footer/NewsletterModal.vue`
- Delete: `src/services/recaptcha.ts`, `src/services/cap-store.ts`,
  `src/pages/api/cap/challenge.ts`, `src/pages/api/cap/redeem.ts`, `public/cap/hashwx.wasm`,
  `src/shared/ui/widgets/Recaptcha.vue`
- Modify: `package.json` (`bun remove cap-widget capjs-core`)

- [ ] **Step 1: Update env schema (`astro.config.mjs`, `src/lib/env.ts`, `src/lib/client-env.ts`)**

Add:

- `TURNSTILE_SECRET_KEY: envField.string({ context: "server", access: "secret", optional: true })`
- `PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: "client", access: "public", optional: true })`
  In `DEV`, default strictly to Cloudflare's official test keys (`1x00000000000000000000AA` /
  `1x0000000000000000000000000000000AA`); in `PROD`, fail closed if unset.

- [ ] **Step 2: Implement `src/services/turnstile.ts` with 4-point server verification**

```ts
import { z } from "astro/zod";
import { TRUSTED_HOSTS } from "@/lib/constants/hosts";
import { env } from "@/lib/env";

const turnstileResponseSchema = z.object({
  success: z.boolean(),
  "error-codes": z.array(z.string()).optional(),
  hostname: z.string().optional(),
  action: z.string().optional(),
  challenge_ts: z.string().optional(),
});

export type TurnstileAction = "booking" | "contact" | "newsletter";

export async function verifyTurnstile({
  token,
  remoteip,
  expectedAction,
}: {
  readonly expectedAction: TurnstileAction;
  readonly remoteip?: string;
  readonly token: string;
}): Promise<boolean> {
  if (!token || token.length < 10 || token.length > 2048) return false;

  const secret =
    env.TURNSTILE_SECRET_KEY.trim()
    || (import.meta.env.DEV ? "1x0000000000000000000000000000000AA" : "");
  if (!secret) return false;

  const idempotencyKey = crypto.randomUUID();
  const payload: Record<string, string> = {
    secret,
    response: token,
    idempotency_key: idempotencyKey,
  };
  if (remoteip && remoteip !== "unknown") {
    payload["remoteip"] = remoteip;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;

    const parsed = turnstileResponseSchema.safeParse(await res.json());
    if (!parsed.success || !parsed.data.success) return false;

    const { hostname, action, challenge_ts: challengeTs } = parsed.data;
    if (!import.meta.env.DEV) {
      if (!hostname || !TRUSTED_HOSTS.has(hostname.toLowerCase())) return false;
      if (action !== expectedAction) return false;
    }
    if (!challengeTs) return false;
    const ageMs = Date.now() - Date.parse(challengeTs);
    if (Number.isNaN(ageMs) || ageMs < 0 || ageMs > 5 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Implement `src/shared/ui/widgets/Turnstile.vue` (explicit render + Astro transition
      cleanup)**

- Load `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` once, render with
  `{ sitekey, action, theme, language, "refresh-expired": "auto", callback, "expired-callback", "error-callback" }`.
- Clean up with `window.turnstile?.remove(widgetId)` in `onBeforeUnmount`.
- Expose `{ getValue, reset }` matching the existing form contract.

- [ ] **Step 4: Wire all 3 forms & remove Cap PoW dependencies/endpoints**

- Pass `action="booking"` / `action="contact"` / `action="newsletter"` in `BookingForm.vue`,
  `ContactForm.vue`, and `NewsletterModal.vue`.
- Remove `cap-widget` and `capjs-core` via `bun remove cap-widget capjs-core`, delete
  `src/pages/api/cap/*`, `src/services/cap-store.ts`, `public/cap/hashwx.wasm`, and tighten
  `astro.config.mjs` `security.csp` (add `https://challenges.cloudflare.com` to
  `scriptDirective.resources`, `frame-src`, `connect-src`; remove `'wasm-unsafe-eval'` and
  `worker-src 'self' blob:`).

- [ ] **Step 5: Run full verification & Playwright E2E**

Run: `bun run verify && bun run build && bun run test:e2e` Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(security): migrate anti-bot verification to Cloudflare Turnstile and remove Cap PoW surface"
```

---

### Task 8: Deploy Cloudflare Edge Security Architecture (WAF, Rate Limits, Origin Protection, Cache Rules, DNS/Email Auth)

**Files:**

- Create: `docs/cloudflare/security-rules.tf` (versioned Terraform IaC + dashboard parity guide; no
  secrets committed)

- [ ] **Step 1: Lock Down Origin Exposure & SSL/TLS**
  1. Set **SSL/TLS -> Overview** to **Full (Strict)**; **Edge Certificates**: Minimum TLS `1.2`, TLS
     1.3 `ON`, Always Use HTTPS `ON`, Automatic HTTPS Rewrites `ON`.
  2. Disable CSP-breaking edge rewrites: **Rocket Loader = OFF**, **Email Address Obfuscation =
     OFF**, **Automatic Web Analytics injection = OFF**.
  3. **Origin Authentication** (choose per Hostinger plan):
     - _Hostinger VPS_: Run **Cloudflare Tunnel (`cloudflared`)** -> `http://127.0.0.1:4321` and
       close TCP 80/443 on firewall (`ufw deny 80 && ufw deny 443`), OR enable **Authenticated
       Origin Pulls (per-zone custom cert)** + Nginx `ssl_verify_client on` + firewall allowlist of
       Cloudflare IPs.
     - _Hostinger Managed Node_: Create **Request Header Transform Rule
       (`http_request_late_transform`)** setting `X-Origin-Verify: <64-char random hex>` (matching
       `ORIGIN_VERIFY_SECRET` env var on Hostinger) and removing `X-Original-URL` & `X-Rewrite-URL`.
  4. Audit **Cloudflare DNS**: orange-cloud `@` and `www`; delete/isolate any unproxied `A`/`AAAA`
     records (`mail`, `ftp`, `cpanel`, `direct`) that expose the Hostinger IP.

- [ ] **Step 2: Deploy Cloudflare WAF Custom Rules (`http_request_firewall_custom`)** Configure the
      5 Free-tier-compatible Wirefilter rules (no `matches` regex or `cf.waf.score` needed on Free):
  1. **Block CMS/Secret/Traversal Probes** (`block`):
     ```txt
     not starts_with(http.request.uri.path, "/.well-known/") and (lower(http.request.uri.path) contains ".php" or lower(http.request.uri.path) contains "/wp-" or lower(http.request.uri.path) contains "/xmlrpc" or lower(http.request.uri.path) contains "/.env" or lower(http.request.uri.path) contains "/.git" or lower(http.request.uri.path) contains "/phpmyadmin" or lower(http.request.uri.path) contains "/cgi-bin/" or lower(http.request.uri.path) contains "/actuator" or lower(http.request.uri.path) contains "..")
     ```
  2. **Strict Method & API/Action Route Allowlist** (`block`): _(Drop `/api/cap/*` paths once Task 7
     Turnstile migration is live)_
     ```txt
     (not http.request.method in {"GET" "HEAD" "POST" "OPTIONS"}) or (http.request.method eq "POST" and not http.request.uri.path in {"/_actions/booking" "/_actions/contact" "/_actions/newsletter"}) or (http.request.uri.path in {"/_actions/booking" "/_actions/contact" "/_actions/newsletter"} and http.request.method ne "POST") or (starts_with(http.request.uri.path, "/api/") and not http.request.uri.path in {"/api/destinations.json" "/api/excursions.json" "/api/tours.json"}) or (starts_with(http.request.uri.path, "/_actions/") and not http.request.uri.path in {"/_actions/booking" "/_actions/contact" "/_actions/newsletter"})
     ```
  3. **Enforce Content-Type & Same-Origin on Actions** (`block`):
     ```txt
     (http.request.uri.path in {"/_actions/booking" "/_actions/contact"} and not (lower(http.request.headers["content-type"][0]) contains "multipart/form-data" or lower(http.request.headers["content-type"][0]) contains "application/x-www-form-urlencoded")) or (http.request.uri.path eq "/_actions/newsletter" and not lower(http.request.headers["content-type"][0]) contains "application/json") or (starts_with(http.request.uri.path, "/_actions/") and not http.request.headers["origin"][0] in {"https://amsirartrip.com" "https://www.amsirartrip.com"})
     ```
  4. **Block Scripted CLI Scrapers on Write Endpoints** (`block`):
     ```txt
     starts_with(http.request.uri.path, "/_actions/") and (http.user_agent eq "" or lower(http.user_agent) contains "curl/" or lower(http.user_agent) contains "python-" or lower(http.user_agent) contains "go-http-client" or lower(http.user_agent) contains "wget/" or lower(http.user_agent) contains "scrapy" or http.request.version eq "HTTP/1.0")
     ```
  5. **Managed Challenge on Elevated Threat Score (Write Endpoints, Zero Geo-Blocking)**
     (`managed_challenge`):
     ```txt
     starts_with(http.request.uri.path, "/_actions/") and cf.threat_score gt 10 and not cf.client.bot
     ```

- [ ] **Step 3: Deploy Managed WAF Rulesets (Pro+ Plans Only — Multilingual Safe)**
  - Add Rule 0 (`skip` `http_request_firewall_managed` on static assets `GET/HEAD` under `/_astro/`,
    `/images/`, `/videos/`, `/fonts/`, `/icons/`, `/patterns/`).
  - Enable **Cloudflare Managed Ruleset (`efb7b8c949ac4650a09736fc376e9aee`)** with non-JS stacks
    disabled (`wordpress`, `php`, `drupal`, `joomla`, `magento`).
  - Enable **OWASP Core Ruleset (`4814384a9e5d4991b9815dcfc25d2f1f`)** at **Paranoia Level 1 only**
    (PL2/PL3/PL4 disabled), anomaly score threshold `40`, starting in `log` mode for 14 days to
    verify zero false positives on FR/DE/ES form messages before switching to `managed_challenge`.

- [ ] **Step 4: Deploy Edge Rate Limiting (`http_ratelimit`)**
  - **Free Plan (1 rule)**: `POST` to `/_actions/*` -> `8 req / 10s` per `ip.src` (`block`, 10s
    mitigation).
  - **Pro+ Plan (3–4 rules)**:
    - `POST /_actions/{booking,contact}` -> `10 req / 60s` (`managed_challenge`, 600s) keyed on
      `["cf.colo.id", "ip.src", "http.request.headers[\"user-agent\"][0]"]` (prevents hotel NAT
      false lockouts).
    - `POST /_actions/newsletter` -> `5 req / 60s` (`block`, 600s) keyed on
      `["cf.colo.id", "ip.src", "http.request.headers[\"user-agent\"][0]"]`.
    - `GET /api/{destinations,excursions,tours}.json` -> `60 req / 60s` (`block`, 120s) keyed on
      `["cf.colo.id", "ip.src"]`.

- [ ] **Step 5: Deploy Cache Rules, Edge Security Headers, Canonical 301, Bot/DDoS, & DNS Auth**
  - **Cache Rules (`http_request_cache_settings`)**:
    - Bypass (`cache = false`) on `/_actions/*` (and `/api/cap/*` if retained).
    - Cache static assets (`/_astro/*`, `/images/*`, `/videos/*`, `/fonts/*`, `/icons/*`,
      `/patterns/*`) with `ignore_query_strings_order = true`, respect origin TTL.
    - Cache public JSON & discovery (`/api/*.json`, `/robots.txt`, `/sitemap*.xml`, `/llms*.txt`,
      `/.well-known/*`).
    - Cache HTML pages **ONLY AFTER Task 5** (hash-based CSP removes per-request nonces).
  - **Response Header Transform Rule (`http_response_headers_transform`)**: Set
    `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
    `X-Permitted-Cross-Domain-Policies: none`; remove `X-Powered-By`, `Via`. (Do NOT duplicate
    `Content-Security-Policy` at the edge.)
  - **Canonical 301 Redirect (`http_request_dynamic_redirect`)**: `www.amsirartrip.com` ->
    `https://amsirartrip.com` (preserve path & query).
  - **HSTS**: Staged rollout (`300` -> `86400` -> `31536000` ->
    `63072000; includeSubDomains; preload`) after verifying all subdomains support HTTPS.
  - **DNS & Email Auth**: Enable **DNSSEC**, publish **CAA** (`pki.goog`, `letsencrypt.org`,
    `ssl.com`), and publish **SPF / DKIM (2048-bit) / DMARC** (Workspace `include:_spf.google.com` +
    phased `p=none` -> `p=quarantine` -> `p=reject` via Cloudflare DMARC Management, OR defensive
    null `v=spf1 -all` + `p=reject` if sending from a `@gmail.com` account).
  - **Bot & DDoS**: Enable Bot Fight Mode / Super Bot Fight Mode (Allow verified bots, JS Detections
    `OFF`), keep L7 DDoS at default sensitivity, enable HTTP DDoS & 5xx alert notifications.

---

### Task 9: Final Automated Security Suite & EGM Goldfish Verification Gate

**Files:**

- Create: `tests/security.spec.ts` (Playwright HTTP + browser security regression tests)

- [ ] **Step 1: Add Playwright security regression tests (`tests/security.spec.ts`)**

Verify against production server (`bun run build && bun run start`):

1. Security headers present on `/`, `/fr`, `/contact`, `/en/tours` (301), and `/images/nonexistent`
   (404 with `Cache-Control: no-store`).
2. `Content-Security-Policy` contains SHA-256 hashes, zero `'unsafe-inline'` in `script-src`, zero
   `'unsafe-eval'`, zero `data-csp-nonce` attribute in DOM, zero `<meta name="generator">`, and zero
   console CSP errors across `/`, `/tours`, `/excursions`, `/contact`.
3. `Host: localhost` header against production server does NOT downgrade CSP.
4. Direct request without `X-Origin-Verify` (when `ORIGIN_VERIFY_SECRET` is configured) returns
   `403`.
5. Spoofing `CF-Connecting-IP: 127.0.0.1` does NOT bypass rate limits or honeypot.
6. Triggering `429` on `/api/tours.json` does NOT poison `/api/tours.json` for a fresh caller.
7. Submitting `language=toString` or whitespace-only fields to `actions.booking` / `actions.contact`
   returns structured validation error (never HTTP 500).
8. `bun audit` exits 0 with 0 vulnerabilities.

- [ ] **Step 2: Run full verification suite**

Run:

```bash
bun audit
bun test tests/security-unit.test.ts
bun run verify
bun run build
bun run test:e2e
```

Expected: ALL PASS with zero warnings/errors.

- [ ] **Step 3: Deploy stateless Goldfish Final Verification Auditor (EGM Closeout)**

Invoke a fresh stateless `research` subagent with ONLY the final `git diff` and vulnerability ledger
(SEC-01..SEC-12) to verify:

- Every original attack path is closed with no surviving bypasses.
- Zero regressions to multilingual (`en`/`fr`/`de`/`es`) UX, View Transitions, theme switching, or
  booking/contact/newsletter email delivery.
- Zero `!important` introduced, zero hardcoded secrets, zero leftover debug code.

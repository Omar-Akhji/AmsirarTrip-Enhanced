import { PUBLIC_TURNSTILE_SITE_KEY } from "astro:env/client";

/** Cloudflare Turnstile official always-passes test site key (development only). */
const DEV_TEST_SITE_KEY = "1x00000000000000000000AA";

const configuredSiteKey = PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

export const TURNSTILE_SITE_KEY =
  configuredSiteKey.length > 0 ? configuredSiteKey
  : import.meta.env.DEV ? DEV_TEST_SITE_KEY
  : "";

export const hasCaptcha = Boolean(TURNSTILE_SITE_KEY);

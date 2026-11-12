import { PUBLIC_CAP_API_ENDPOINT } from "astro:env/client";

const PUBLIC_RECAPTCHA_SITE_KEY = import.meta.env["PUBLIC_RECAPTCHA_SITE_KEY"] as
  string | undefined;

export const CAP_API_ENDPOINT = PUBLIC_CAP_API_ENDPOINT ?? "/api/cap/";
export const hasCap = Boolean(CAP_API_ENDPOINT);

export const RECAPTCHA_V2_SITE_KEY = PUBLIC_RECAPTCHA_SITE_KEY ?? "";
export const hasRecaptchaV2 = Boolean(RECAPTCHA_V2_SITE_KEY);

export const hasCaptcha = Boolean(CAP_API_ENDPOINT || hasRecaptchaV2 || import.meta.env.DEV);

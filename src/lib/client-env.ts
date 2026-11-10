import { PUBLIC_CAP_API_ENDPOINT, PUBLIC_RECAPTCHA_SITE_KEY } from "astro:env/client";

export const CAP_API_ENDPOINT = PUBLIC_CAP_API_ENDPOINT || "/api/cap/";
export const hasCap = Boolean(CAP_API_ENDPOINT);

export const RECAPTCHA_V2_SITE_KEY = PUBLIC_RECAPTCHA_SITE_KEY ?? "";
export const hasRecaptchaV2 = Boolean(RECAPTCHA_V2_SITE_KEY);

export const hasCaptcha = Boolean(CAP_API_ENDPOINT || hasRecaptchaV2 || import.meta.env.DEV);

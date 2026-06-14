import { PUBLIC_RECAPTCHA_SITE_KEY } from "astro:env/client";

export const RECAPTCHA_V2_SITE_KEY =
  PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

export const hasRecaptchaV2 = Boolean(RECAPTCHA_V2_SITE_KEY);

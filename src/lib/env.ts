import { GMAIL_PASS, GMAIL_USER, MAIL_TO, RECAPTCHA_SECRET_KEY } from "astro:env/server";

export const env = {
  GMAIL_USER: GMAIL_USER ?? "",
  GMAIL_PASS: GMAIL_PASS ?? "",
  RECAPTCHA_SECRET_KEY: RECAPTCHA_SECRET_KEY ?? "",
  MAIL_TO: MAIL_TO ?? "",
} as const;

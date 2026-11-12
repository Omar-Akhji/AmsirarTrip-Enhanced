import {
  CAP_SECRET_KEY,
  GMAIL_PASS,
  GMAIL_USER,
  MAIL_TO,
  RECAPTCHA_SECRET_KEY,
} from "astro:env/server";

export const env = {
  GMAIL_USER: GMAIL_USER ?? process.env["GMAIL_USER"] ?? "",
  GMAIL_PASS: GMAIL_PASS ?? process.env["GMAIL_PASS"] ?? "",
  RECAPTCHA_SECRET_KEY: RECAPTCHA_SECRET_KEY ?? process.env["RECAPTCHA_SECRET_KEY"] ?? "",
  CAP_SECRET_KEY: CAP_SECRET_KEY ?? process.env["CAP_SECRET_KEY"] ?? "",
  MAIL_TO: MAIL_TO ?? process.env["MAIL_TO"] ?? "",
} as const;

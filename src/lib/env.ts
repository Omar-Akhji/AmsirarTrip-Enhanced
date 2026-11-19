import {
  GMAIL_PASS,
  GMAIL_USER,
  MAIL_TO,
  ORIGIN_VERIFY_SECRET,
  TURNSTILE_SECRET_KEY,
} from "astro:env/server";

export const env = {
  GMAIL_USER: GMAIL_USER ?? process.env["GMAIL_USER"] ?? "",
  GMAIL_PASS: GMAIL_PASS ?? process.env["GMAIL_PASS"] ?? "",
  MAIL_TO: MAIL_TO ?? process.env["MAIL_TO"] ?? "",
  ORIGIN_VERIFY_SECRET: ORIGIN_VERIFY_SECRET ?? process.env["ORIGIN_VERIFY_SECRET"] ?? "",
  TURNSTILE_SECRET_KEY: TURNSTILE_SECRET_KEY ?? process.env["TURNSTILE_SECRET_KEY"] ?? "",
} as const;

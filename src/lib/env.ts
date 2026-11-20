import {
  GMAIL_PASS,
  GMAIL_USER,
  LOG_DIR,
  MAIL_TO,
  ORIGIN_VERIFY_SECRET,
  TURNSTILE_SECRET_KEY,
} from "astro:env/server";
import { z } from "astro/zod";

const trimmedString = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "");

const serverEnvSchema = z.object({
  GMAIL_PASS: trimmedString,
  GMAIL_USER: trimmedString,
  LOG_DIR: trimmedString.transform((value) => value || "./logs"),
  MAIL_TO: trimmedString,
  ORIGIN_VERIFY_SECRET: trimmedString,
  TURNSTILE_SECRET_KEY: trimmedString,
});

export const env = serverEnvSchema.parse({
  GMAIL_PASS: GMAIL_PASS ?? process.env["GMAIL_PASS"],
  GMAIL_USER: GMAIL_USER ?? process.env["GMAIL_USER"],
  LOG_DIR: LOG_DIR ?? process.env["LOG_DIR"],
  MAIL_TO: MAIL_TO ?? process.env["MAIL_TO"],
  ORIGIN_VERIFY_SECRET: ORIGIN_VERIFY_SECRET ?? process.env["ORIGIN_VERIFY_SECRET"],
  TURNSTILE_SECRET_KEY: TURNSTILE_SECRET_KEY ?? process.env["TURNSTILE_SECRET_KEY"],
});

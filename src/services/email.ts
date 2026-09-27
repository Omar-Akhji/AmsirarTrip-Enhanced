/**
 * Email service — single place for all transactional email logic. Uses nodemailer with a Gmail SMTP
 * pool.
 */
import nodemailer, { type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { env } from "@/lib/env";

let _transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;

/** Returns a reusable nodemailer transporter (singleton per server process). */
export function getMailer(): Transporter<SMTPTransport.SentMessageInfo> {
  if (_transporter) return _transporter;

  const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_PASS },
    pool: true,
    maxConnections: 3,
  });

  _transporter = mailer;
  return mailer;
}

export { type default as SMTPTransport } from "nodemailer/lib/smtp-transport";

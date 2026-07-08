/**
 * Email service — single place for all transactional email logic. Uses nodemailer with a Gmail SMTP
 * pool.
 */
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { env } from "@/lib/env";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _transporter: nodemailer.Transporter<any> | null = null;

/** Returns a reusable nodemailer transporter (singleton per server process). */
export function getMailer(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
  if (_transporter) return _transporter as nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_PASS },
    pool: true,
    maxConnections: 3,
  });

  return _transporter as nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
}

export { type default as SMTPTransport } from "nodemailer/lib/smtp-transport";

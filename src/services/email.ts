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

export interface TransactionalEmailOptions {
  readonly category: string;
  readonly replyTo: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

/**
 * Sends a transactional email through the configured SMTP transport with standard sender &
 * recipient fallback.
 */
export async function sendTransactionalEmail(
  options: TransactionalEmailOptions,
): Promise<SMTPTransport.SentMessageInfo> {
  const mailer = getMailer();
  const recipient = env.MAIL_TO.length > 0 ? env.MAIL_TO : env.GMAIL_USER;

  return mailer.sendMail({
    from: `Amsirar Trip ${options.category} <${env.GMAIL_USER}>`,
    to: recipient,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

/** Transactional email service using nodemailer with a reusable Gmail SMTP connection pool. */
import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";
import type SMTPPool from "nodemailer/lib/smtp-pool";
import { env } from "@/lib/env";

let _transporter: Transporter<SMTPPool.SentMessageInfo, SMTPPool.Options> | null = null;

/** Returns a reusable nodemailer transporter (singleton per server process). */
export function getMailer(): Transporter<SMTPPool.SentMessageInfo, SMTPPool.Options> {
  if (_transporter) return _transporter;

  if (!env.GMAIL_USER || !env.GMAIL_PASS) {
    throw new Error("SMTP credentials (GMAIL_USER / GMAIL_PASS) are not configured.");
  }

  const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_PASS.replaceAll(/\s+/g, "") },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  });

  _transporter = mailer;
  return mailer;
}

export type EmailCategory = "Bookings" | "Contact" | "Newsletter";

export interface TransactionalEmailOptions {
  readonly attachments?:
    readonly NonNullable<SendMailOptions["attachments"]>[number][] | SendMailOptions["attachments"];
  readonly bcc?: string | string[];
  readonly category: EmailCategory;
  readonly cc?: string | string[];
  readonly headers?: Record<string, string>;
  readonly html: string;
  readonly replyTo: string;
  readonly subject: string;
  readonly text: string;
}

/** Sends a transactional email through the configured SMTP transport. */
export async function sendTransactionalEmail(
  options: TransactionalEmailOptions,
): Promise<SMTPPool.SentMessageInfo> {
  const mailer = getMailer();
  const recipient = env.MAIL_TO.length > 0 ? env.MAIL_TO : env.GMAIL_USER;

  return mailer.sendMail({
    from: `Amsirar Trip ${options.category} <${env.GMAIL_USER}>`,
    to: recipient,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
    cc: options.cc,
    bcc: options.bcc,
    attachments: options.attachments ? [...options.attachments] : undefined,
    headers: options.headers,
  });
}

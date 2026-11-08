/**
 * Email service — single place for all transactional email logic. Uses nodemailer with a resilient
 * Gmail SMTP connection pool.
 */
import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";
import type SMTPPool from "nodemailer/lib/smtp-pool";
import { env } from "@/lib/env";
import { logger } from "./logger";

let _transporter: Transporter<SMTPPool.SentMessageInfo, SMTPPool.Options> | null = null;

/** Returns a reusable nodemailer transporter (singleton per server process). */
export function getMailer(): Transporter<SMTPPool.SentMessageInfo, SMTPPool.Options> {
  if (_transporter) return _transporter;

  const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.GMAIL_USER.trim(), pass: env.GMAIL_PASS.replaceAll(/\s+/g, "") },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    // Timeout protections to prevent hanging sockets during SMTP operations
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  });

  _transporter = mailer;
  return mailer;
}

/** Verifies that the SMTP transporter configuration and credentials are functioning. */
export async function verifyMailer(): Promise<boolean> {
  try {
    const mailer = getMailer();
    await mailer.verify();
    return true;
  } catch (error) {
    logger.error("Nodemailer SMTP verification failed", error);
    return false;
  }
}

export interface TransactionalEmailOptions {
  readonly category: string;
  readonly replyTo: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
  readonly cc?: string | string[];
  readonly bcc?: string | string[];
  readonly attachments?: SendMailOptions["attachments"];
  readonly headers?: Record<string, string>;
}

/**
 * Sends a transactional email through the configured SMTP transport with standard sender &
 * recipient fallback.
 */
export async function sendTransactionalEmail(
  options: TransactionalEmailOptions,
): Promise<SMTPPool.SentMessageInfo> {
  const mailer = getMailer();
  const recipient = env.MAIL_TO.length > 0 ? env.MAIL_TO : env.GMAIL_USER;

  if (!env.GMAIL_USER || !env.GMAIL_PASS) {
    logger.warn("SMTP credentials not fully configured. Email sending may fail.", {
      category: options.category,
      recipient,
    });
  }

  return mailer.sendMail({
    from: `Amsirar Trip ${options.category} <${env.GMAIL_USER}>`,
    to: recipient,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
    cc: options.cc,
    bcc: options.bcc,
    attachments: options.attachments,
    headers: options.headers,
  });
}

/**
 * Server utilities — re-exports from services + HTML escape + security logging. Core
 * implementations live in src/services/ to keep concerns separated.
 */

// Re-export for backward compatibility
export { getMailer } from "@/services/email";
export { verifyRecaptcha } from "@/services/recaptcha";
export { logger, logSecurityEvent, logActionError, logAppError } from "@/services/logger";

import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { getMailer } from "@/services/email";
import { logSecurityEvent } from "@/services/logger";

/** @deprecated Use `getMailer()` from `@/services/email` directly. */
export function createMailer(): Transporter<SMTPTransport.SentMessageInfo> {
  return getMailer();
}

// ── HTML escape ───────────────────────────────────────────────────────────────

export function escapeHtml(string_: string = ""): string {
  return string_
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ── Security logging ──────────────────────────────────────────────────────────

/**
 * Log suspicious activity to file and console.
 *
 * @deprecated Use `logSecurityEvent` from `@/services/logger` directly.
 */
export function logSuspiciousActivity(ip: string, type: string, details: string) {
  // Map old type strings to new enum values
  const eventTypeMap: Record<
    string,
    "RATE_LIMIT" | "BLOCKED_IP" | "HONEYPOT" | "CAPTCHA_FAILED" | "SUSPICIOUS"
  > = {
    HONEYPOT_TRIGGERED: "HONEYPOT",
    BLOCKED_ACTION: "RATE_LIMIT",
    BLOCKED: "BLOCKED_IP",
    CAPTCHA_FAILED: "CAPTCHA_FAILED",
  };

  const mappedType = eventTypeMap[type] || "SUSPICIOUS";

  logSecurityEvent(mappedType, ip, details, { originalType: type, source: "server-utils" });
}

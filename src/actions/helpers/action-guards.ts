import { checkRateLimit } from "../../lib/api-utils";
import { env } from "../../lib/env";
import { logSecurityEvent } from "../../services/logger";
import { verifyTurnstile, type TurnstileAction } from "../../services/turnstile";

export interface HoneypotCheckOptions {
  readonly actionName: string;
  readonly ip: string;
  readonly value: string;
}

export interface RateLimitEnforcementOptions {
  readonly actionName: string;
  readonly ip: string;
  readonly key: string;
  readonly maxRequests: number;
  readonly windowMs?: number;
}

export interface CaptchaVerificationOptions {
  readonly expectedAction: TurnstileAction;
  readonly ip: string;
  readonly token: string;
}

export function isHoneypotTriggered({ actionName, ip, value }: HoneypotCheckOptions): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  if (import.meta.env.DEV) {
    logSecurityEvent({
      details: `${actionName} (ignored in dev, length: ${trimmed.length})`,
      ip,
      type: "HONEYPOT",
    });
    return false;
  }

  logSecurityEvent({ details: `${actionName} (length: ${trimmed.length})`, ip, type: "HONEYPOT" });
  return true;
}

export function enforceRateLimit({
  actionName,
  ip,
  key,
  maxRequests,
  windowMs = 60_000,
}: RateLimitEnforcementOptions): { allowed: boolean } {
  const result = checkRateLimit({ identifier: key, maxRequests, windowMs });
  if (result.allowed) return { allowed: true };

  // Log pre-block denials and the block transition once; skip repeat logs while already banned.
  if (result.newlyBlocked) {
    logSecurityEvent({
      details: `${actionName} blocked after repeated violations`,
      ip,
      type: "BLOCKED_IP",
    });
  } else if (!result.blocked) {
    logSecurityEvent({ details: actionName, ip, type: "RATE_LIMIT" });
  }
  return { allowed: false };
}

export async function verifyCaptcha({
  expectedAction,
  ip,
  token,
}: CaptchaVerificationOptions): Promise<boolean> {
  const isValid = await verifyTurnstile({
    expectedAction,
    remoteip: ip,
    secret: env.TURNSTILE_SECRET_KEY,
    token,
  });
  if (!isValid) {
    logSecurityEvent({ details: `${expectedAction}-action`, ip, type: "CAPTCHA_FAILED" });
    return false;
  }
  return true;
}

import { checkRateLimit } from "../../lib/api-utils";
import { logSecurityEvent } from "../../services/logger";
import { verifyTurnstile, type TurnstileAction } from "../../services/turnstile";

export function isHoneypotTriggered(value: string, ip: string, actionName: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  if (import.meta.env.DEV) {
    logSecurityEvent("HONEYPOT", ip, `${actionName} (ignored in dev: "${trimmed.slice(0, 32)}")`);
    return false;
  }

  logSecurityEvent("HONEYPOT", ip, `${actionName} (value: "${trimmed.slice(0, 32)}")`);
  return true;
}

export function enforceRateLimit(
  key: string,
  ip: string,
  actionName: string,
  maxRequests: number,
  windowMs = 60_000,
): { allowed: boolean } {
  const result = checkRateLimit(key, maxRequests, windowMs);
  if (result.allowed) return { allowed: true };

  // Log pre-block denials and the block transition once; skip repeat logs while already banned.
  if (result.newlyBlocked) {
    logSecurityEvent("BLOCKED_IP", ip, `${actionName} blocked after repeated violations`);
  } else if (!result.blocked) {
    logSecurityEvent("RATE_LIMIT", ip, actionName);
  }
  return { allowed: false };
}

export async function verifyCaptcha(
  token: string,
  ip: string,
  expectedAction: TurnstileAction,
): Promise<boolean> {
  const isValid = await verifyTurnstile({ expectedAction, remoteip: ip, token });
  if (!isValid) {
    logSecurityEvent("CAPTCHA_FAILED", ip, `${expectedAction}-action`);
    return false;
  }
  return true;
}

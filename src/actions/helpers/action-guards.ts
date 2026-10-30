import { checkRateLimit } from "../../lib/api-utils";
import { logSecurityEvent } from "../../lib/server-utils";
import { verifyRecaptcha } from "../../services/recaptcha";

export function isHoneypotTriggered(value: string, ip: string, actionName: string): boolean {
  if (value.length > 0) {
    logSecurityEvent("HONEYPOT", ip, actionName);
    return true;
  }
  return false;
}

export function enforceRateLimit(
  key: string,
  ip: string,
  actionName: string,
  maxRequests: number,
  windowMs = 60_000,
): { allowed: boolean } {
  const result = checkRateLimit(key, maxRequests, windowMs);
  if (!result.allowed) {
    if (result.blocked) {
      logSecurityEvent("RATE_LIMIT", ip, actionName);
    }
    return { allowed: false };
  }
  return { allowed: true };
}

export async function verifyCaptcha(
  token: string,
  host: string,
  ip: string,
  actionName: string,
): Promise<boolean> {
  const isValid = await verifyRecaptcha({ token, hostname: host, remoteip: ip });
  if (!isValid) {
    logSecurityEvent("CAPTCHA_FAILED", ip, actionName);
    return false;
  }
  return true;
}

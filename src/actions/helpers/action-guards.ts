import { isIP } from "node:net";
import { checkRateLimit } from "../../lib/api-utils";
import { logSecurityEvent } from "../../lib/server-utils";
import { verifyRecaptcha } from "../../services/recaptcha";

/**
 * Safely extracts client IP address prioritizing trusted proxy headers (X-Real-IP) set by the edge
 * Nginx reverse proxy, falling back to Astro context.clientAddress.
 */
export function extractClientIp(request: Request, clientAddress?: string | undefined): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isIP(realIp) !== 0) {
    return realIp;
  }
  const fallback = clientAddress?.trim();
  return fallback && isIP(fallback) !== 0 ? fallback : "unknown";
}

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
  ip: string,
  actionName: string,
): Promise<boolean> {
  const isValid = await verifyRecaptcha({ token, remoteip: ip });
  if (!isValid) {
    logSecurityEvent("CAPTCHA_FAILED", ip, actionName);
    return false;
  }
  return true;
}

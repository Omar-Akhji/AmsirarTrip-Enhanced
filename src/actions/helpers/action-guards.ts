import { isIP } from "node:net";
import { checkRateLimit } from "../../lib/api-utils";
import { logSecurityEvent } from "../../lib/server-utils";
import { verifyRecaptcha } from "../../services/recaptcha";

/**
 * Safely extracts client IP address prioritizing trusted proxy headers (x-vercel-forwarded-for,
 * x-real-ip, or the first hop of x-forwarded-for), falling back to Astro context.clientAddress.
 */
export function extractClientIp(request: Request, clientAddress?: string | undefined): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",", 1)[0]?.trim();
  if (vercelIp && isIP(vercelIp) !== 0) {
    return vercelIp;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isIP(realIp) !== 0) {
    return realIp;
  }
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  if (forwardedFor && isIP(forwardedFor) !== 0) {
    return forwardedFor;
  }
  const fallback = clientAddress?.trim();
  return fallback && isIP(fallback) !== 0 ? fallback : "unknown";
}

export function isHoneypotTriggered(value: string, ip: string, actionName: string): boolean {
  if (value.trim().length > 0) {
    if (ip === "::1" || ip === "127.0.0.1" || import.meta.env.DEV) {
      logSecurityEvent(
        "HONEYPOT",
        ip,
        `${actionName} (ignored in dev: "${value.trim().slice(0, 32)}")`,
      );
      return false;
    }
    logSecurityEvent("HONEYPOT", ip, `${actionName} (value: "${value.trim().slice(0, 32)}")`);
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

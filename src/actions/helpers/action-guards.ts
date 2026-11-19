import { isIP } from "node:net";
import { checkRateLimit } from "../../lib/api-utils";
import { logSecurityEvent } from "../../lib/server-utils";
import { verifyTurnstile, type TurnstileAction } from "../../services/turnstile";

/**
 * Safely extracts client IP address. Trusts `cf-connecting-ip` ONLY when the request has been
 * authenticated as coming through Cloudflare (`isCloudflareVerified === true`); otherwise falls
 * back strictly to the direct socket peer `clientAddress` to prevent proxy header spoofing.
 */
export function extractClientIp(
  request: Request,
  clientAddress?: string,
  isCloudflareVerified = false,
): string {
  if (isCloudflareVerified) {
    const cfIp = request.headers.get("cf-connecting-ip")?.trim();
    if (cfIp && isIP(cfIp) !== 0) {
      return cfIp;
    }
  }
  const fallback = clientAddress?.trim();
  return fallback && isIP(fallback) !== 0 ? fallback : "unknown";
}

export function isHoneypotTriggered(value: string, ip: string, actionName: string): boolean {
  if (value.trim().length > 0) {
    if (import.meta.env.DEV) {
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
  expectedAction: TurnstileAction,
): Promise<boolean> {
  const isValid = await verifyTurnstile({ expectedAction, remoteip: ip, token });
  if (!isValid) {
    logSecurityEvent("CAPTCHA_FAILED", ip, `${expectedAction}-action`);
    return false;
  }
  return true;
}

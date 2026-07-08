import { logSuspiciousActivity } from "./server-utils";

const rateLimitMap = new Map<string, { count: number; resetAt: number; violations: number }>();
const blockedIPs = new Map<string, number>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60_000,
): { allowed: boolean; remaining: number; blocked?: boolean } {
  const now = Date.now();

  const blockExpiry = blockedIPs.get(identifier);
  if (blockExpiry && now < blockExpiry) {
    return { allowed: false, remaining: 0, blocked: true };
  }
  if (blockExpiry) {
    blockedIPs.delete(identifier);
  }

  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
      violations: record?.violations || 0,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    record.violations++;

    if (record.violations >= 3) {
      blockedIPs.set(identifier, now + 3_600_000);
      logSuspiciousActivity(
        identifier,
        "BLOCKED",
        `Blocked after ${record.violations} rate limit violations`,
      );
      return { allowed: false, remaining: 0, blocked: true };
    }

    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Clean up stale rate limit entries every minute to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000;
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
  for (const [key, expiry] of blockedIPs) {
    if (now > expiry) {
      blockedIPs.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

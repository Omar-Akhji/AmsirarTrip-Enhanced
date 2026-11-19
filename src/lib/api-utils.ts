import { logSecurityEvent } from "./server-utils";

const MAX_TRACKED_KEYS = 10_000;
const rateLimitMap = new Map<string, { count: number; resetAt: number; violations: number }>();
const blockedIPs = new Map<string, number>();

function enforceRateLimitCapacity(now: number): void {
  if (rateLimitMap.size < MAX_TRACKED_KEYS) return;
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
  while (rateLimitMap.size >= MAX_TRACKED_KEYS) {
    const oldestKey = rateLimitMap.keys().next().value;
    if (oldestKey === undefined) break;
    rateLimitMap.delete(oldestKey);
  }
}

function enforceBlockedCapacity(now: number): void {
  if (blockedIPs.size < MAX_TRACKED_KEYS) return;
  for (const [key, expiry] of blockedIPs) {
    if (now > expiry) {
      blockedIPs.delete(key);
    }
  }
  while (blockedIPs.size >= MAX_TRACKED_KEYS) {
    const oldestKey = blockedIPs.keys().next().value;
    if (oldestKey === undefined) break;
    blockedIPs.delete(oldestKey);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  blocked?: boolean;
  remaining: number;
}

export function checkRateLimit(
  identifier: string,
  maxRequests = 5,
  windowMs = 60_000,
): RateLimitResult {
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
    enforceRateLimitCapacity(now);
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
      violations: record?.violations ?? 0,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    record.violations++;

    if (record.violations >= 3) {
      enforceBlockedCapacity(now);
      blockedIPs.set(identifier, now + 3_600_000);
      logSecurityEvent(
        "BLOCKED_IP",
        identifier,
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
const cleanupTimer = setInterval(() => {
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

if (typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

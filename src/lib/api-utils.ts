import { isIP } from "node:net";

const MAX_TRACKED_KEYS = 10_000;
const VIOLATION_DECAY_MS = 15 * 60_000;
const BLOCK_DURATION_MS = 3_600_000;
const VIOLATION_THRESHOLD = 3;

interface RateLimitRecord {
  count: number;
  resetAt: number;
  violationResetAt: number;
  violations: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const blockedIPs = new Map<string, number>();

function enforceMapCapacity<V>(
  map: Map<string, V>,
  isExpired: (value: V, now: number) => boolean,
  now: number,
): void {
  if (map.size < MAX_TRACKED_KEYS) return;
  for (const [key, value] of map) {
    if (isExpired(value, now)) {
      map.delete(key);
    }
  }
  while (map.size >= MAX_TRACKED_KEYS) {
    const oldestKey = map.keys().next().value;
    if (oldestKey === undefined) break;
    map.delete(oldestKey);
  }
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly blocked?: boolean;
  readonly newlyBlocked?: boolean;
  readonly remaining: number;
}

/**
 * Extracts client IP. Trusts `cf-connecting-ip` ONLY when the request was authenticated via
 * Cloudflare (`isCloudflareVerified === true`); otherwise falls back strictly to `clientAddress`.
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

export function checkRateLimit(
  identifier: string,
  maxRequests = 5,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const isUnidentified = identifier.endsWith(":unknown") || identifier === "unknown";

  if (!isUnidentified) {
    const blockExpiry = blockedIPs.get(identifier);
    if (blockExpiry && now < blockExpiry) {
      return { allowed: false, remaining: 0, blocked: true, newlyBlocked: false };
    }
    if (blockExpiry) {
      blockedIPs.delete(identifier);
    }
  }

  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    const activeViolations = record && now <= record.violationResetAt ? record.violations : 0;
    const violationResetAt =
      record && now <= record.violationResetAt ? record.violationResetAt : now + VIOLATION_DECAY_MS;

    enforceMapCapacity(
      rateLimitMap,
      (value, t) => t > value.resetAt && (value.violations === 0 || t > value.violationResetAt),
      now,
    );
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
      violations: activeViolations,
      violationResetAt,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    record.violations++;
    record.violationResetAt = now + VIOLATION_DECAY_MS;

    // Never place shared "unknown" fallback keys into the 1-hour global blocklist.
    if (!isUnidentified && record.violations >= VIOLATION_THRESHOLD) {
      enforceMapCapacity(blockedIPs, (expiry, t) => t > expiry, now);
      blockedIPs.set(identifier, now + BLOCK_DURATION_MS);
      return { allowed: false, remaining: 0, blocked: true, newlyBlocked: true };
    }

    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

export function clearRateLimitStateForTests(): void {
  rateLimitMap.clear();
  blockedIPs.clear();
}

const CLEANUP_INTERVAL_MS = 60_000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt && (value.violations === 0 || now > value.violationResetAt)) {
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

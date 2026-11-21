import { z } from "astro/zod";
import { TRUSTED_HOSTS } from "@/lib/constants/hosts";
import { logger, sanitizeLogString } from "./logger";

/** Cloudflare Turnstile official testing secret key (development only). */
const DEV_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_AGE_MS = 5 * 60 * 1000;

function isDevEnv(metaEnv: { readonly DEV?: boolean } | undefined): boolean {
  return Boolean(metaEnv?.DEV);
}

const turnstileResponseSchema = z.object({
  action: z.string().optional(),
  challenge_ts: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
  hostname: z.string().optional(),
  success: z.boolean(),
});

export type TurnstileAction = "booking" | "contact" | "newsletter";

export interface VerifyTurnstileOptions {
  readonly expectedAction: TurnstileAction;
  readonly fetchImpl?: typeof fetch;
  readonly isDev?: boolean;
  readonly remoteip?: string;
  readonly secret?: string;
  readonly token: string;
  readonly trustedHosts?: ReadonlySet<string>;
}

/**
 * Verifies a single-use Cloudflare Turnstile token server-side with hostname, action, and freshness
 * checks. Enforces hostname and action binding whenever a real `TURNSTILE_SECRET_KEY` is configured
 * (bypassed only when falling back to Cloudflare's dev test secret), and fails closed in production
 * if `TURNSTILE_SECRET_KEY` is missing.
 */
export async function verifyTurnstile({
  expectedAction,
  fetchImpl = fetch,
  isDev = isDevEnv(import.meta.env),
  remoteip,
  secret,
  token,
  trustedHosts = TRUSTED_HOSTS,
}: VerifyTurnstileOptions): Promise<boolean> {
  if (!token || typeof token !== "string" || token.length < 10 || token.length > 2048) {
    return false;
  }

  const configuredSecret = (secret ?? process.env["TURNSTILE_SECRET_KEY"] ?? "").trim();
  const usingDevTestSecret =
    isDev && (configuredSecret.length === 0 || configuredSecret === DEV_TEST_SECRET_KEY);
  const resolvedSecret = configuredSecret || (usingDevTestSecret ? DEV_TEST_SECRET_KEY : "");
  if (!resolvedSecret) {
    logger.error("[turnstile] TURNSTILE_SECRET_KEY not configured — rejecting in production");
    return false;
  }

  const payload: Record<string, string> = {
    idempotency_key: crypto.randomUUID(),
    response: token,
    secret: resolvedSecret,
  };
  if (remoteip && remoteip !== "unknown") {
    payload["remoteip"] = remoteip;
  }

  try {
    const response = await fetchImpl(TURNSTILE_VERIFY_URL, {
      body: JSON.stringify(payload),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      logger.error("[turnstile] siteverify returned non-OK status", { status: response.status });
      return false;
    }

    const rawJson: unknown = await response.json();
    const parseResult = turnstileResponseSchema.safeParse(rawJson);
    if (!parseResult.success) {
      logger.error("[turnstile] siteverify returned invalid schema", parseResult.error);
      return false;
    }

    const data = parseResult.data;
    if (!data.success) {
      if (data["error-codes"] && data["error-codes"].length > 0) {
        logger.warn("[turnstile] verification failed", { errorCodes: data["error-codes"] });
      }
      return false;
    }

    // Enforce strict hostname & action binding whenever using a real secret so tokens cannot be
    // replayed across domains or across different forms (e.g., newsletter token reused on booking).
    // Bypass only when falling back to Cloudflare's official dev test secret.
    if (!usingDevTestSecret) {
      if (!data.hostname || !trustedHosts.has(data.hostname.toLowerCase())) {
        logger.warn("[turnstile] untrusted or missing hostname", {
          hostname: sanitizeLogString(data.hostname ?? "none", 128),
        });
        return false;
      }
      if (data.action !== expectedAction) {
        logger.warn("[turnstile] action mismatch", {
          expected: expectedAction,
          actual: sanitizeLogString(data.action ?? "none", 64),
        });
        return false;
      }
    }

    if (!data.challenge_ts) {
      logger.warn("[turnstile] missing challenge_ts");
      return false;
    }

    const challengeTime = Date.parse(data.challenge_ts);
    const ageMs = Date.now() - challengeTime;
    if (Number.isNaN(challengeTime) || ageMs < -60_000 || ageMs > MAX_TOKEN_AGE_MS) {
      logger.warn("[turnstile] token is stale or invalid challenge_ts");
      return false;
    }

    return true;
  } catch (error) {
    logger.error("[turnstile] verification error", error);
    return false;
  }
}

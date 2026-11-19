import { z } from "astro/zod";
import { TRUSTED_HOSTS } from "@/lib/constants/hosts";
import { env } from "@/lib/env";

/** Cloudflare Turnstile official testing secret key (development only). */
const DEV_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_AGE_MS = 5 * 60 * 1000;

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
  readonly remoteip?: string;
  readonly token: string;
}

/**
 * Verifies a single-use Cloudflare Turnstile token server-side with hostname, action, and freshness
 * checks. Fails closed in production if `TURNSTILE_SECRET_KEY` is missing.
 */
export async function verifyTurnstile({
  expectedAction,
  remoteip,
  token,
}: VerifyTurnstileOptions): Promise<boolean> {
  if (!token || typeof token !== "string" || token.length < 10 || token.length > 2048) {
    return false;
  }

  const configuredSecret = env.TURNSTILE_SECRET_KEY.trim();
  const secret = configuredSecret || (import.meta.env.DEV ? DEV_TEST_SECRET_KEY : "");
  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY not configured — rejecting in production");
    return false;
  }

  const payload: Record<string, string> = {
    idempotency_key: crypto.randomUUID(),
    response: token,
    secret,
  };
  if (remoteip && remoteip !== "unknown") {
    payload["remoteip"] = remoteip;
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      body: JSON.stringify(payload),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error("[turnstile] siteverify returned non-OK status:", response.status);
      return false;
    }

    const rawJson: unknown = await response.json();
    const parseResult = turnstileResponseSchema.safeParse(rawJson);
    if (!parseResult.success) {
      console.error("[turnstile] siteverify returned invalid schema:", parseResult.error);
      return false;
    }

    const data = parseResult.data;
    if (!data.success) {
      if (data["error-codes"] && data["error-codes"].length > 0) {
        console.warn("[turnstile] verification failed:", data["error-codes"]);
      }
      return false;
    }

    // In production, enforce strict hostname & action binding so tokens cannot be replayed across
    // domains or across different forms (e.g., newsletter token reused on booking).
    if (!import.meta.env.DEV) {
      if (!data.hostname || !TRUSTED_HOSTS.has(data.hostname.toLowerCase())) {
        console.warn(`[turnstile] untrusted or missing hostname: ${data.hostname ?? "none"}`);
        return false;
      }
      if (data.action !== expectedAction) {
        console.warn(
          `[turnstile] action mismatch: expected=${expectedAction} actual=${data.action ?? "none"}`,
        );
        return false;
      }
    }

    if (!data.challenge_ts) {
      console.warn("[turnstile] missing challenge_ts");
      return false;
    }

    const challengeTime = Date.parse(data.challenge_ts);
    const ageMs = Date.now() - challengeTime;
    if (Number.isNaN(challengeTime) || ageMs < -60_000 || ageMs > MAX_TOKEN_AGE_MS) {
      console.warn("[turnstile] token is stale or invalid challenge_ts");
      return false;
    }

    return true;
  } catch (error) {
    console.error("[turnstile] verification error:", error);
    return false;
  }
}

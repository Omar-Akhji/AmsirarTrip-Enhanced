import { z } from "astro/zod";
import { env } from "@/lib/env";

const recaptchaResponseSchema = z.object({
  success: z.boolean(),
  errorCodes: z.array(z.string()).optional(),
  "error-codes": z.array(z.string()).optional(),
  hostname: z.string().optional(),
  challengeTs: z.string().optional(),
  challenge_ts: z.string().optional(),
});

import { TRUSTED_HOSTS } from "@/lib/constants/hosts";

interface VerifyOptions {
  readonly token: string;
  readonly hostname?: string | undefined;
  readonly remoteip?: string | undefined;
}

/**
 * Verifies a reCAPTCHA token against Google's siteverify API. Returns true only if verification
 * succeeds, hostname matches, and token is fresh.
 */
export async function verifyRecaptcha({ token, remoteip }: VerifyOptions): Promise<boolean> {
  // Guard: no secret configured = fail-closed in production, skip in dev
  if (!env.RECAPTCHA_SECRET_KEY) {
    const isDev = import.meta.env.DEV || process.env["NODE_ENV"] === "development";
    if (isDev) {
      console.warn("[recaptcha] RECAPTCHA_SECRET_KEY not set — skipping verification in dev");
      return true;
    }
    console.error("[recaptcha] RECAPTCHA_SECRET_KEY not set — rejecting in production");
    return false;
  }

  // Guard: invalid token shape
  if (!token || typeof token !== "string" || token.length < 10 || token.length > 4096) {
    return false;
  }

  try {
    const body = new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token });
    if (remoteip && remoteip !== "unknown") {
      body.set("remoteip", remoteip);
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error("[recaptcha] API returned non-OK status:", response.status);
      return false;
    }

    const rawJson: unknown = await response.json();
    const parseResult = recaptchaResponseSchema.safeParse(rawJson);
    if (!parseResult.success) {
      console.error("[recaptcha] API returned invalid schema:", parseResult.error);
      return false;
    }

    const data = parseResult.data;
    const errorCodes = data.errorCodes ?? data["error-codes"];

    if (!data.success) {
      if (errorCodes && errorCodes.length > 0) {
        console.warn("[recaptcha] verification failed:", errorCodes);
      }
      return false;
    }

    const challengeTs = data.challengeTs ?? data.challenge_ts;

    // Hostname check: enforce server-side trusted domain allowlist (never trust client Host header)
    if (!data.hostname || !TRUSTED_HOSTS.has(data.hostname.toLowerCase())) {
      console.warn(`[recaptcha] untrusted or missing hostname: ${data.hostname ?? "none"}`);
      return false;
    }

    // Stale token check: reject if older than 5 minutes
    if (challengeTs) {
      const challengeTime = Date.parse(challengeTs);
      if (Number.isNaN(challengeTime) || Date.now() - challengeTime > 5 * 60 * 1000) {
        console.warn("[recaptcha] token is stale or missing challenge timestamp");
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("[recaptcha] verification error:", error);
    return false;
  }
}

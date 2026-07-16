/** ReCAPTCHA verification service — single place for bot verification logic. */
import { env } from "@/lib/env";

interface RecaptchaResult {
  success: boolean;
  errorCodes?: string[];
  hostname?: string;
  challengeTs?: string;
}

interface VerifyOptions {
  token: string;
  hostname?: string;
}

/**
 * Verifies a reCAPTCHA token against Google's siteverify API. Returns true only if verification
 * succeeds, hostname matches, and token is fresh.
 */
export async function verifyRecaptcha({ token, hostname }: VerifyOptions): Promise<boolean> {
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
  if (!token || typeof token !== "string" || token.length < 10) {
    return false;
  }

  try {
    const body = new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token });

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[recaptcha] API returned non-OK status:", response.status);
      return false;
    }

    const data = (await response.json()) as RecaptchaResult;

    if (!data.success) {
      if (data.errorCodes?.length) {
        console.warn("[recaptcha] verification failed:", data.errorCodes);
      }
      return false;
    }

    // Hostname check: ensure token came from our domain
    if (hostname && data.hostname) {
      const allowed = new Set([hostname, `www.${hostname}`, "localhost", "127.0.0.1"]);
      if (!allowed.has(data.hostname)) {
        console.warn(`[recaptcha] hostname mismatch: expected ${hostname}, got ${data.hostname}`);
        return false;
      }
    }

    // Stale token check: reject if older than 5 minutes
    if (data.challengeTs) {
      const challengeTime = Date.parse(data.challengeTs);
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

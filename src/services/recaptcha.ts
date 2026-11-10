import { z } from "astro/zod";
import { PUBLIC_CAP_API_ENDPOINT } from "astro:env/client";
import { env } from "@/lib/env";
import { TRUSTED_HOSTS } from "@/lib/constants/hosts";

const recaptchaResponseSchema = z.object({
  success: z.boolean(),
  errorCodes: z.array(z.string()).optional(),
  "error-codes": z.array(z.string()).optional(),
  hostname: z.string().optional(),
  challengeTs: z.string().optional(),
  challenge_ts: z.string().optional(),
});

interface VerifyOptions {
  readonly token: string;
  readonly remoteip?: string | undefined;
}

/** Verifies a CAPTCHA token using Cap (trycap.dev) if configured, or Google reCAPTCHA as fallback. */
export async function verifyRecaptcha({ token, remoteip }: VerifyOptions): Promise<boolean> {
  // Guard: invalid token shape
  if (!token || typeof token !== "string" || token.length < 5 || token.length > 4096) {
    return false;
  }

  // 1. Cap (trycap.dev) verification
  if (env.CAP_SECRET_KEY && PUBLIC_CAP_API_ENDPOINT) {
    try {
      const endpoint =
        PUBLIC_CAP_API_ENDPOINT.endsWith("/") ? PUBLIC_CAP_API_ENDPOINT : (
          `${PUBLIC_CAP_API_ENDPOINT}/`
        );
      const verifyUrl = `${endpoint}siteverify`;

      const body = new URLSearchParams({ secret: env.CAP_SECRET_KEY, response: token });
      if (remoteip && remoteip !== "unknown") {
        body.set("remoteip", remoteip);
      }

      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.error("[cap] API returned non-OK status:", response.status);
        return false;
      }

      const rawJson = (await response.json()) as { success?: boolean };
      return Boolean(rawJson.success);
    } catch (error) {
      console.error("[cap] verification error:", error);
      return false;
    }
  }

  // 2. Google reCAPTCHA verification fallback
  if (env.RECAPTCHA_SECRET_KEY) {
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

  // Guard: no secret configured = fail-closed in production, skip in dev
  const isDev = import.meta.env.DEV || process.env["NODE_ENV"] === "development";
  if (isDev) {
    console.warn("[captcha] Neither CAP_SECRET_KEY nor RECAPTCHA_SECRET_KEY set — skipping in dev");
    return true;
  }
  console.error("[captcha] No captcha secret configured — rejecting in production");
  return false;
}

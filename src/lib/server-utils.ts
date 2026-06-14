import nodemailer from "nodemailer";
import { env } from "@/lib/env";

export async function verifyRecaptcha(token: string, expectedHostname?: string): Promise<boolean> {
  try {
    if (!token || typeof token !== "string" || !env.RECAPTCHA_SECRET_KEY) {
      return false;
    }

    const body = new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token });

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("CAPTCHA API returned non-OK status:", response.status);
      return false;
    }

    const data = (await response.json()) as {
      success?: boolean;
      hostname?: string;
      challenge_ts?: string;
      "error-codes"?: string[];
    };

    if (data.success !== true) {
      if (data["error-codes"]?.length) {
        console.warn("CAPTCHA verification failed:", data["error-codes"]);
      }
      return false;
    }

    if (data.hostname && expectedHostname) {
      const allowedHostnames = new Set([
        expectedHostname,
        `www.${expectedHostname}`,
        "localhost",
        "127.0.0.1",
      ]);

      if (!allowedHostnames.has(data.hostname)) {
        console.warn(
          `CAPTCHA hostname mismatch: expected ${expectedHostname}, got ${data.hostname}`,
        );
        return false;
      }
    }

    const challengeTs = data.challenge_ts ? Date.parse(data.challenge_ts) : Number.NaN;
    if (Number.isNaN(challengeTs) || Date.now() - challengeTs > 5 * 60 * 1000) {
      console.warn("CAPTCHA token is stale or missing challenge timestamp");
      return false;
    }

    return true;
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return false;
  }
}

let _transporter: nodemailer.Transporter<any> | null = null;

export function createMailer(): nodemailer.Transporter<any> {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_PASS },
    pool: true,
    maxConnections: 3,
  });
  return _transporter;
}

export function escapeHtml(string_: string = ""): string {
  return String(string_)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function logSuspiciousActivity(ip: string, type: string, details: string) {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] ${timestamp} IP: ${ip} Type: ${type} Details: ${details}`);
}

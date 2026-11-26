import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { checkRateLimit, clearRateLimitStateForTests, extractClientIp } from "@/lib/api-utils";
import { isTrustedGoogleMapsEmbedUrl } from "@/lib/maps";
import { logger, redactPiiString } from "@/services/logger";

void describe("extractClientIp", () => {
  void it("ignores spoofed cf-connecting-ip when Cloudflare verification is false", () => {
    const request = new Request("https://amsirartrip.com/contact", {
      headers: { "cf-connecting-ip": "198.51.100.99" },
    });
    assert.equal(
      extractClientIp({ clientAddress: "203.0.113.10", isCloudflareVerified: false, request }),
      "203.0.113.10",
    );
    assert.equal(
      extractClientIp({ clientAddress: "invalid-ip", isCloudflareVerified: false, request }),
      "unknown",
    );
  });

  void it("trusts valid cf-connecting-ip when isCloudflareVerified is true", () => {
    const request = new Request("https://amsirartrip.com/contact", {
      headers: { "cf-connecting-ip": "198.51.100.42" },
    });
    assert.equal(
      extractClientIp({ clientAddress: "203.0.113.10", isCloudflareVerified: true, request }),
      "198.51.100.42",
    );
  });
});

void describe("checkRateLimit", () => {
  afterEach(() => {
    clearRateLimitStateForTests();
  });

  void it("allows requests within quota and blocks after exceeding maxRequests", () => {
    const identifier = "booking:198.51.100.7";
    assert.deepEqual(checkRateLimit({ identifier, maxRequests: 2, windowMs: 10_000 }), {
      allowed: true,
      remaining: 1,
    });
    assert.deepEqual(checkRateLimit({ identifier, maxRequests: 2, windowMs: 10_000 }), {
      allowed: true,
      remaining: 0,
    });
    assert.deepEqual(checkRateLimit({ identifier, maxRequests: 2, windowMs: 10_000 }), {
      allowed: false,
      remaining: 0,
    });
  });

  void it("blocks repeated violators on the third violation while exempting unknown keys", () => {
    const identifier = "contact:198.51.100.8";
    assert.equal(checkRateLimit({ identifier, maxRequests: 1, windowMs: 10_000 }).allowed, true);
    assert.equal(
      checkRateLimit({ identifier, maxRequests: 1, windowMs: 10_000 }).blocked,
      undefined,
    );
    assert.equal(
      checkRateLimit({ identifier, maxRequests: 1, windowMs: 10_000 }).blocked,
      undefined,
    );
    const blocked = checkRateLimit({ identifier, maxRequests: 1, windowMs: 10_000 });
    assert.deepEqual(blocked, { allowed: false, remaining: 0, blocked: true, newlyBlocked: true });

    const unknownKey = "contact:unknown";
    assert.equal(
      checkRateLimit({ identifier: unknownKey, maxRequests: 1, windowMs: 10_000 }).allowed,
      true,
    );
    for (let i = 0; i < 4; i++) {
      assert.equal(
        checkRateLimit({ identifier: unknownKey, maxRequests: 1, windowMs: 10_000 }).blocked,
        undefined,
      );
    }
  });
});

void describe("isTrustedGoogleMapsEmbedUrl", () => {
  void it("accepts trusted HTTPS Google Maps query and embed URLs", () => {
    assert.equal(
      isTrustedGoogleMapsEmbedUrl("https://www.google.com/maps?q=Marrakech,Morocco&output=embed"),
      true,
    );
    assert.equal(isTrustedGoogleMapsEmbedUrl("https://www.google.com/maps/embed?pb=!1m18"), true);
  });

  void it("rejects non-HTTPS schemes, spoofed hosts, and untrusted paths", () => {
    const httpUrl = new URL("https://www.google.com/maps/embed?pb=1");
    httpUrl.protocol = "http:";
    assert.equal(isTrustedGoogleMapsEmbedUrl(httpUrl.href), false);
    assert.equal(isTrustedGoogleMapsEmbedUrl("javascript:alert(1)"), false);
    assert.equal(isTrustedGoogleMapsEmbedUrl("https://www.google.com.evil.test/maps/embed"), false);
    assert.equal(isTrustedGoogleMapsEmbedUrl("https://www.google.com/search?q=maps"), false);
    assert.equal(isTrustedGoogleMapsEmbedUrl("not a url"), false);
  });
});

void describe("logger PII redaction", () => {
  void it("redacts inline emails, auth schemes, and cookies in strings", () => {
    const redacted = redactPiiString(
      "Failed sending to traveler@example.com with Bearer secret_tok_123 and Cookie: sid=abc",
    );
    assert.ok(!redacted.includes("traveler@example.com"));
    assert.ok(!redacted.includes("secret_tok_123"));
    assert.ok(!redacted.includes("sid=abc"));
    assert.ok(redacted.includes("[REDACTED_EMAIL]"));
    assert.ok(redacted.includes("Bearer [REDACTED]"));
    assert.ok(redacted.includes("Cookie: [REDACTED]"));
  });

  void it("redacts sensitive meta keys and error messages while preserving non-PII diagnostics", () => {
    const tempLogDir = path.join(tmpdir(), `amsirar-pii-test-${Date.now()}`);
    process.env["LOG_DIR"] = tempLogDir;
    const captured: string[] = [];
    const origWarn = console.warn;
    const origError = console.error;
    console.warn = (...args: unknown[]) => {
      captured.push(args.map(String).join(" "));
    };
    console.error = (...args: unknown[]) => {
      captured.push(args.map(String).join(" "));
    };

    try {
      logger.warn("Contact attempt", {
        email: "guest@example.com",
        phone: "+212600000000",
        recaptchaToken: "cf-turnstile-token",
        authorization: "Bearer topsecret",
        ip: "198.51.100.20",
      });
      logger.error("SMTP error", new Error("Rejected recipient <vip@example.com>"));
    } finally {
      console.warn = origWarn;
      console.error = origError;
      rmSync(tempLogDir, { force: true, recursive: true });
    }

    const combined = captured.join("\n");
    assert.ok(!combined.includes("guest@example.com"));
    assert.ok(!combined.includes("+212600000000"));
    assert.ok(!combined.includes("cf-turnstile-token"));
    assert.ok(!combined.includes("topsecret"));
    assert.ok(!combined.includes("vip@example.com"));
    assert.ok(combined.includes("198.51.100.20"));
    assert.ok(combined.includes("[REDACTED]"));
    assert.ok(combined.includes("[REDACTED_EMAIL]"));
  });
});

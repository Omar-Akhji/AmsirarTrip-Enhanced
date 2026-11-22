import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { checkRateLimit, clearRateLimitStateForTests, extractClientIp } from "@/lib/api-utils";
import { isTrustedGoogleMapsEmbedUrl } from "@/lib/maps";

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

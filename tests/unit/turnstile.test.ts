import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { verifyTurnstile } from "@/services/turnstile";

const DEV_TEST_SECRET = "1x0000000000000000000000000000000AA";
const PROD_TRUSTED_HOSTS = new Set(["amsirartrip.com", "www.amsirartrip.com"]);

interface CapturedFetchRequest {
  readonly body: Record<string, string>;
  readonly headers: Headers;
  readonly method: string;
  readonly url: string;
}

function createJsonFetchMock(
  payload: unknown,
  status = 200,
): { readonly fetchImpl: typeof fetch; readonly requests: CapturedFetchRequest[] } {
  const requests: CapturedFetchRequest[] = [];
  const impl = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    await Promise.resolve();
    const url =
      typeof input === "string" ? input
      : input instanceof URL ? input.href
      : input.url;
    const rawBody = typeof init?.body === "string" ? init.body : "{}";
    const parsedBody = JSON.parse(rawBody) as Record<string, string>;
    requests.push({
      body: parsedBody,
      headers: new Headers(init?.headers),
      method: init?.method ?? "GET",
      url,
    });
    return Response.json(payload, { status });
  };
  return { fetchImpl: impl, requests };
}

void describe("verifyTurnstile", () => {
  let savedLogDir: string | undefined;
  let savedTurnstileSecret: string | undefined;
  let tempLogDir = "";

  beforeEach(() => {
    savedLogDir = process.env["LOG_DIR"];
    savedTurnstileSecret = process.env["TURNSTILE_SECRET_KEY"];
    tempLogDir = path.join(tmpdir(), `amsirar-turnstile-test-${Date.now()}-${Math.random()}`);
    process.env["LOG_DIR"] = tempLogDir;
    delete process.env["TURNSTILE_SECRET_KEY"];
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
    if (savedLogDir === undefined) {
      delete process.env["LOG_DIR"];
    } else {
      process.env["LOG_DIR"] = savedLogDir;
    }
    if (savedTurnstileSecret === undefined) {
      delete process.env["TURNSTILE_SECRET_KEY"];
    } else {
      process.env["TURNSTILE_SECRET_KEY"] = savedTurnstileSecret;
    }
    if (tempLogDir) {
      rmSync(tempLogDir, { force: true, recursive: true });
    }
  });

  void it("accepts a valid token and sends canonical JSON payload to siteverify", async () => {
    const mock = createJsonFetchMock({
      action: "booking",
      challenge_ts: new Date().toISOString(),
      hostname: "amsirartrip.com",
      success: true,
    });

    const ok = await verifyTurnstile({
      expectedAction: "booking",
      fetchImpl: mock.fetchImpl,
      isDev: false,
      remoteip: "198.51.100.42",
      secret: "0x4AAAAA-real-secret-value",
      token: "valid-turnstile-token-12345",
      trustedHosts: PROD_TRUSTED_HOSTS,
    });

    assert.equal(ok, true);
    assert.equal(mock.requests.length, 1);
    const req = mock.requests[0];
    assert.ok(req);
    assert.equal(req.url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    assert.equal(req.method, "POST");
    assert.equal(req.headers.get("content-type"), "application/json");
    assert.equal(req.body["secret"], "0x4AAAAA-real-secret-value");
    assert.equal(req.body["response"], "valid-turnstile-token-12345");
    assert.equal(req.body["remoteip"], "198.51.100.42");
    assert.ok(
      typeof req.body["idempotency_key"] === "string" && req.body["idempotency_key"].length > 0,
    );
  });

  void it("omits remoteip from payload when remoteip is unknown", async () => {
    const mock = createJsonFetchMock({
      action: "contact",
      challenge_ts: new Date().toISOString(),
      hostname: "www.amsirartrip.com",
      success: true,
    });

    const ok = await verifyTurnstile({
      expectedAction: "contact",
      fetchImpl: mock.fetchImpl,
      isDev: false,
      remoteip: "unknown",
      secret: "0x4AAAAA-real-secret-value",
      token: "valid-turnstile-token-12345",
      trustedHosts: PROD_TRUSTED_HOSTS,
    });

    assert.equal(ok, true);
    assert.equal(mock.requests[0]?.body["remoteip"], undefined);
  });

  void it("rejects replayed or failed siteverify responses", async () => {
    const mock = createJsonFetchMock({ "error-codes": ["timeout-or-duplicate"], success: false });

    const ok = await verifyTurnstile({
      expectedAction: "booking",
      fetchImpl: mock.fetchImpl,
      isDev: false,
      secret: "0x4AAAAA-real-secret-value",
      token: "replayed-turnstile-token-123",
      trustedHosts: PROD_TRUSTED_HOSTS,
    });

    assert.equal(ok, false);
  });

  void it("enforces production hostname allowlist and action binding", async () => {
    const localhostMock = createJsonFetchMock({
      action: "booking",
      challenge_ts: new Date().toISOString(),
      hostname: "localhost",
      success: true,
    });
    assert.equal(
      await verifyTurnstile({
        expectedAction: "booking",
        fetchImpl: localhostMock.fetchImpl,
        isDev: false,
        secret: "0x4AAAAA-real-secret-value",
        token: "valid-turnstile-token-12345",
        trustedHosts: PROD_TRUSTED_HOSTS,
      }),
      false,
    );

    const evilHostMock = createJsonFetchMock({
      action: "booking",
      challenge_ts: new Date().toISOString(),
      hostname: "evil.example",
      success: true,
    });
    assert.equal(
      await verifyTurnstile({
        expectedAction: "booking",
        fetchImpl: evilHostMock.fetchImpl,
        isDev: false,
        secret: "0x4AAAAA-real-secret-value",
        token: "valid-turnstile-token-12345",
        trustedHosts: PROD_TRUSTED_HOSTS,
      }),
      false,
    );

    const wrongActionMock = createJsonFetchMock({
      action: "newsletter",
      challenge_ts: new Date().toISOString(),
      hostname: "amsirartrip.com",
      success: true,
    });
    assert.equal(
      await verifyTurnstile({
        expectedAction: "booking",
        fetchImpl: wrongActionMock.fetchImpl,
        isDev: false,
        secret: "0x4AAAAA-real-secret-value",
        token: "valid-turnstile-token-12345",
        trustedHosts: PROD_TRUSTED_HOSTS,
      }),
      false,
    );
  });

  void it("enforces hostname and action in dev when a real secret is configured", async () => {
    const validLocalMock = createJsonFetchMock({
      action: "contact",
      challenge_ts: new Date().toISOString(),
      hostname: "localhost",
      success: true,
    });
    assert.equal(
      await verifyTurnstile({
        expectedAction: "contact",
        fetchImpl: validLocalMock.fetchImpl,
        isDev: true,
        secret: "0x4AAAAA-real-test-secret",
        token: "valid-turnstile-token-12345",
      }),
      true,
    );

    const mismatchActionMock = createJsonFetchMock({
      action: "newsletter",
      challenge_ts: new Date().toISOString(),
      hostname: "localhost",
      success: true,
    });
    assert.equal(
      await verifyTurnstile({
        expectedAction: "contact",
        fetchImpl: mismatchActionMock.fetchImpl,
        isDev: true,
        secret: "0x4AAAAA-real-test-secret",
        token: "valid-turnstile-token-12345",
      }),
      false,
    );

    const untrustedHostMock = createJsonFetchMock({
      action: "contact",
      challenge_ts: new Date().toISOString(),
      hostname: "example.com",
      success: true,
    });
    assert.equal(
      await verifyTurnstile({
        expectedAction: "contact",
        fetchImpl: untrustedHostMock.fetchImpl,
        isDev: true,
        secret: "0x4AAAAA-real-test-secret",
        token: "valid-turnstile-token-12345",
      }),
      false,
    );
  });

  void it("uses Cloudflare test secret fallback in dev when secret is unset", async () => {
    const devFallbackMock = createJsonFetchMock({
      action: "",
      challenge_ts: new Date().toISOString(),
      hostname: "example.com",
      success: true,
    });

    const ok = await verifyTurnstile({
      expectedAction: "newsletter",
      fetchImpl: devFallbackMock.fetchImpl,
      isDev: true,
      secret: "",
      token: "dummy-dev-token-12345",
    });

    assert.equal(ok, true);
    assert.equal(devFallbackMock.requests[0]?.body["secret"], DEV_TEST_SECRET);
  });

  void it("fails closed on missing secret in prod, malformed tokens, stale timestamps, and bad responses", async () => {
    const uncalledMock = createJsonFetchMock({ success: true });

    assert.equal(
      await verifyTurnstile({
        expectedAction: "booking",
        fetchImpl: uncalledMock.fetchImpl,
        isDev: false,
        secret: "",
        token: "valid-turnstile-token-12345",
        trustedHosts: PROD_TRUSTED_HOSTS,
      }),
      false,
    );
    assert.equal(
      await verifyTurnstile({
        expectedAction: "booking",
        fetchImpl: uncalledMock.fetchImpl,
        isDev: false,
        secret: "0x4AAAAA-real-secret-value",
        token: "short",
        trustedHosts: PROD_TRUSTED_HOSTS,
      }),
      false,
    );
    assert.equal(
      await verifyTurnstile({
        expectedAction: "booking",
        fetchImpl: uncalledMock.fetchImpl,
        isDev: false,
        secret: "0x4AAAAA-real-secret-value",
        token: "a".repeat(2049),
        trustedHosts: PROD_TRUSTED_HOSTS,
      }),
      false,
    );
    assert.equal(uncalledMock.requests.length, 0);

    const staleMock = createJsonFetchMock({
      action: "booking",
      challenge_ts: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      hostname: "amsirartrip.com",
      success: true,
    });
    assert.equal(
      await verifyTurnstile({
        expectedAction: "booking",
        fetchImpl: staleMock.fetchImpl,
        isDev: false,
        secret: "0x4AAAAA-real-secret-value",
        token: "valid-turnstile-token-12345",
        trustedHosts: PROD_TRUSTED_HOSTS,
      }),
      false,
    );

    const missingTsMock = createJsonFetchMock({
      action: "booking",
      hostname: "amsirartrip.com",
      success: true,
    });
    assert.equal(
      await verifyTurnstile({
        expectedAction: "booking",
        fetchImpl: missingTsMock.fetchImpl,
        isDev: false,
        secret: "0x4AAAAA-real-secret-value",
        token: "valid-turnstile-token-12345",
        trustedHosts: PROD_TRUSTED_HOSTS,
      }),
      false,
    );

    const http500Mock = createJsonFetchMock({ error: "upstream" }, 500);
    assert.equal(
      await verifyTurnstile({
        expectedAction: "booking",
        fetchImpl: http500Mock.fetchImpl,
        isDev: false,
        secret: "0x4AAAAA-real-secret-value",
        token: "valid-turnstile-token-12345",
        trustedHosts: PROD_TRUSTED_HOSTS,
      }),
      false,
    );

    const invalidSchemaMock = createJsonFetchMock({ ok: true });
    assert.equal(
      await verifyTurnstile({
        expectedAction: "booking",
        fetchImpl: invalidSchemaMock.fetchImpl,
        isDev: false,
        secret: "0x4AAAAA-real-secret-value",
        token: "valid-turnstile-token-12345",
        trustedHosts: PROD_TRUSTED_HOSTS,
      }),
      false,
    );
  });
});

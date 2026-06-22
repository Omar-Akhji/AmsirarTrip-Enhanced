import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "./api-utils";

vi.mock("./server-utils", () => ({ logSuspiciousActivity: vi.fn() }));

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within the limit", () => {
    const result = checkRateLimit("ip-1", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests over the limit", () => {
    for (let index = 0; index < 5; index++) {
      checkRateLimit("ip-2", 5, 60_000);
    }
    const result = checkRateLimit("ip-2", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the window expires", () => {
    checkRateLimit("ip-3", 2, 60_000);
    checkRateLimit("ip-3", 2, 60_000);
    const blocked = checkRateLimit("ip-3", 2, 60_000);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(60_001);
    const allowed = checkRateLimit("ip-3", 2, 60_000);
    expect(allowed.allowed).toBe(true);
  });

  it("blocks IP after repeated violations", () => {
    for (let v = 0; v < 3; v++) {
      checkRateLimit("ip-repeat", 1, 60_000);
      checkRateLimit("ip-repeat", 1, 60_000);
      vi.advanceTimersByTime(60_001);
    }
    const result = checkRateLimit("ip-repeat", 1, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.blocked).toBe(true);
  });
});

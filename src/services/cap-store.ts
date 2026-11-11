import { createHash } from "node:crypto";

interface StoredToken {
  readonly expires: number;
}

interface StoredNonce {
  readonly expires: number;
}

class CapMemoryStore {
  private readonly tokens = new Map<string, StoredToken>();
  private readonly nonces = new Map<string, StoredNonce>();
  private readonly cleanupTimer: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupTimer = setInterval(() => this.pruneExpired(), 2 * 60 * 1000);
    if (this.cleanupTimer && typeof this.cleanupTimer.unref === "function") {
      this.cleanupTimer.unref();
    }
  }

  /** Consume a nonce. Returns true if nonce is fresh, false if already consumed (replay attack). */
  public consumeNonce = async (sigHex: string, ttlMs: number): Promise<boolean> => {
    const now = Date.now();
    const existing = this.nonces.get(sigHex);
    if (existing && existing.expires > now) {
      return false;
    }
    this.nonces.set(sigHex, { expires: now + ttlMs });
    return true;
  };

  /** Store a validated tokenKey with its expiration timestamp. */
  public saveToken = (tokenKey: string, expiresMs: number): void => {
    this.tokens.set(tokenKey, { expires: expiresMs });
  };

  /**
   * Re-derive tokenKey and consume it (atomic delete-on-read). Follows exact recipe from Cap Core
   * docs: const [id, secret] = token.split(":"); const tokenKey =
   * `${id}:${createHash("sha256").update(secret).digest("hex")}`;
   */
  public consumeToken = (token: string): boolean => {
    if (!token || typeof token !== "string") return false;
    const parts = token.split(":");
    if (parts.length !== 2) return false;
    const [id, secret] = parts;
    if (!id || !secret) return false;

    const tokenKey = `${id}:${createHash("sha256").update(secret).digest("hex")}`;
    const item = this.tokens.get(tokenKey);
    if (!item) return false;

    // Single-use: delete immediately to prevent replay
    this.tokens.delete(tokenKey);

    return item.expires >= Date.now();
  };

  /** Prune expired tokens and nonces to avoid memory leaks. */
  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.tokens.entries()) {
      if (item.expires < now) {
        this.tokens.delete(key);
      }
    }
    for (const [sig, item] of this.nonces.entries()) {
      if (item.expires < now) {
        this.nonces.delete(sig);
      }
    }
  }
}

export const capStore = new CapMemoryStore();

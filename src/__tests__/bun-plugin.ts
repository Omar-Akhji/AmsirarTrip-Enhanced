// Bun module mocks for Astro virtual modules
// Loaded via bunfig.toml [test].preload
import { mock } from "bun:test";

void mock.module("astro:env/server", () => ({
  GMAIL_USER: "test@example.com",
  GMAIL_PASS: "test-password",
  MAIL_TO: "",
  RECAPTCHA_SECRET_KEY: "",
}));

void mock.module("astro:actions", () => ({
  defineAction: (config: Record<string, unknown>) => config,
}));

void mock.module("astro/zod", async () => {
  const { z } = await import("zod");
  return { z };
});

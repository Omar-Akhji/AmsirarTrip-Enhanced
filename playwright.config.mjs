// playwright.config.mjs
import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env["CI"]);
const PORT = 4325;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**", "**/components/**"],
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  timeout: 30_000,
  expect: { timeout: 5000 },

  reporter: [[isCI ? "github" : "list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    locale: "en-US",
    timezoneId: "Africa/Casablanca",
  },

  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],

  webServer: {
    command: isCI ? "bun run build && bun run start" : "bun run start",
    env: { PORT: String(PORT) },
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});

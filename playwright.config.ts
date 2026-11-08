import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] ? 2 : 0,
  workers: process.env["CI"] ? 1 : "100%",
  reporter: "html",
  use: { baseURL: "http://localhost:4321", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: {
    command: "bun run preview",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env["CI"],
    timeout: 120 * 1000,
  },
});

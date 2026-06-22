import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "astro:env/server": path.resolve(__dirname, "src/__tests__/__mocks__/astro-env-server.ts"),
      "astro:actions": path.resolve(__dirname, "src/__tests__/__mocks__/astro-actions.ts"),
      "astro/zod": path.resolve(__dirname, "src/__tests__/__mocks__/astro-zod.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/i18n/**"],
      exclude: ["src/lib/env.ts", "src/lib/client-env.ts"],
    },
  },
});

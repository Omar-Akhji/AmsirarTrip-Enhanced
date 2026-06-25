import node from "@astrojs/node";
import react from "@astrojs/react";
import compress from "@playform/compress";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, memoryCache } from "astro/config";

export default defineConfig({
  // ─── Site ────────────────────────────────────────────────────────────────
  site: "https://amsirartrip.com",

  // ─── Output & Adapter ────────────────────────────────────────────────────
  output: "server",
  adapter: node({ mode: "standalone" }),

  // ─── Integrations ────────────────────────────────────────────────────────
  integrations: [
    react({ babel: { plugins: [["babel-plugin-react-compiler", { target: "19" }]] } }),
    compress({
      CSS: true,
      HTML: true,
      Image: false, // handled by Astro's built-in <Image /> + Bun.Image
      JavaScript: true,
      SVG: true,
    }),
  ],

  // ─── Vite ────────────────────────────────────────────────────────────────
  vite: { plugins: [tailwindcss()], resolve: { alias: { "@": "/src" } } },

  // ─── Image ───────────────────────────────────────────────────────────────
  image: { service: { entrypoint: "@/services/bun-image" }, domains: [], remotePatterns: [] },

  // ─── Security ────────────────────────────────────────────────────────────
  security: { checkOrigin: true },

  // ─── Cache (Astro 7+) ───────────────────────────────────────────────────
  cache: { provider: memoryCache() },

  // ─── Route Rules (Astro 7+) ──────────────────────────────────────────────
  routeRules: {
    "/": { maxAge: 60, swr: 300 },
    "/trips/[...slug]": { maxAge: 300, swr: 600 },
    "/excursions/[...slug]": { maxAge: 300, swr: 600 },
    "/about": { maxAge: 600, swr: 3600 },
    "/api/[...path]": { maxAge: 0 },
  },

  // ─── Dev ─────────────────────────────────────────────────────────────────
  server: { port: 4321, host: true },

  // ─── i18n ────────────────────────────────────────────────────────────────
  i18n: {
    locales: ["en", "fr", "de", "es"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },

  // ─── Type-safe environment variables (Astro 5+) ──────────────────────────
  env: {
    schema: {
      GMAIL_USER: envField.string({ context: "server", access: "secret" }),
      GMAIL_PASS: envField.string({ context: "server", access: "secret" }),
      MAIL_TO: envField.string({ context: "server", access: "secret", optional: true }),
      RECAPTCHA_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      PUBLIC_RECAPTCHA_SITE_KEY: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },

  // ─── Prefetch ────────────────────────────────────────────────────────────
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
});

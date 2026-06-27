import node from "@astrojs/node";
import react from "@astrojs/react";
import compress from "@playform/compress";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, memoryCache } from "astro/config";

export default defineConfig({
  // ─── Site ────────────────────────────────────────────────────────────────
  site: "https://amsirartrip.com",
  compressHTML: "jsx",

  // ─── Output & Adapter ────────────────────────────────────────────────────
  output: "server",
  adapter: node({ mode: "standalone" }),

  // ─── Integrations ────────────────────────────────────────────────────────
  integrations: [
    react({ babel: { plugins: [["babel-plugin-react-compiler", { target: "19" }]] } }),
    compress({ CSS: false, HTML: false, Image: true, JavaScript: false, SVG: true }),
  ],

  // ─── Vite ────────────────────────────────────────────────────────────────
  vite: { plugins: [tailwindcss()], resolve: { alias: { "@": "/src" } } },

  // ─── Image ───────────────────────────────────────────────────────────────
  image: { domains: [], remotePatterns: [] },

  // ─── Security ────────────────────────────────────────────────────────────
  security: { checkOrigin: true },

  // ─── Cache (Astro 7+) ───────────────────────────────────────────────────
  cache: { provider: memoryCache() },

  // ─── Route Rules (Astro 7+) ──────────────────────────────────────────────
  routeRules: {
    "/": { maxAge: 600, swr: 3600 },
    "/[...locale]": { maxAge: 600, swr: 3600 },
    "/[...locale]/about": { maxAge: 1800, swr: 86_400 },
    "/[...locale]/contact": { maxAge: 300, swr: 1800 },
    "/[...locale]/excursions": { maxAge: 900, swr: 3600 },
    "/[...locale]/excursions/[slug]": { maxAge: 1800, swr: 86_400 },
    "/[...locale]/privacy-policy": { maxAge: 86_400, swr: 604_800 },
    "/[...locale]/terms-of-service": { maxAge: 86_400, swr: 604_800 },
    "/[...locale]/tours": { maxAge: 900, swr: 3600 },
    "/[...locale]/tours/[slug]": { maxAge: 1800, swr: 86_400 },
    "/robots.txt": { maxAge: 3600, swr: 86_400 },
    "/sitemap-index.xml": { maxAge: 3600, swr: 86_400 },
    "/_actions/[...path]": { maxAge: 0 },
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
  prefetch: { defaultStrategy: "viewport" },
});

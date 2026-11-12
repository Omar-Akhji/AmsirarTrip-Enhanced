// astro.config.mjs
import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig, envField, memoryCache } from "astro/config";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import vue from "@astrojs/vue";
import compress from "@playform/compress";
import tailwindcss from "@tailwindcss/vite";
import htmlValidate from "astro-html-validate";
import { DEFAULT_LOCALE, LOCALES } from "./src/i18n/locales.ts";

const isVercel = Boolean(process.env["VERCEL"] || process.env["VERCEL_ENV"]);
const srcDir = fileURLToPath(new URL("src", import.meta.url));

export default defineConfig({
  // ─── 1. Site & Core HTML Optimization ─────────────────────────────────────
  site: "https://amsirartrip.com",
  trailingSlash: "never",
  compressHTML: true,

  // ─── 2. Build Options ─────────────────────────────────────────────────────
  build: { inlineStylesheets: "always", format: "directory" },

  // ─── 3. Output & Runtime Adapter ──────────────────────────────────────────
  output: "server",
  adapter:
    isVercel ? vercel({ maxDuration: 30, imageService: true }) : node({ mode: "standalone" }),

  // ─── 4. Integrations ──────────────────────────────────────────────────────
  integrations: [
    vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("cap-") } } }),
    htmlValidate(),
    compress({ CSS: false, HTML: false, Image: false, JavaScript: false, SVG: true }),
  ],

  // ─── 5. Vite & Tailwind CSS v4 ────────────────────────────────────────────
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { "@": srcDir } },
    build: { cssMinify: "lightningcss" },
  },

  // ─── 6. Image Optimization ────────────────────────────────────────────────
  image: { domains: [], remotePatterns: [] },

  // ─── 7. Security & Origin Protection ──────────────────────────────────────
  security: {
    checkOrigin: true,
    allowedDomains: [
      { hostname: "amsirartrip.com", protocol: "https" },
      { hostname: "*.amsirartrip.com", protocol: "https" },
      { hostname: "*.vercel.app", protocol: "https" },
    ],
    actionBodySizeLimit: 65_536,
  },

  // ─── 8. Cache & Route Rules (Astro 7+) ────────────────────────────────────
  cache: { provider: memoryCache() },

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
    "/llms.txt": { maxAge: 3600, swr: 86_400 },
    "/llms-full.txt": { maxAge: 3600, swr: 86_400 },
    "/robots.txt": { maxAge: 3600, swr: 86_400 },
    "/sitemap.xml": { maxAge: 3600, swr: 86_400 },
    "/sitemap-index.xml": { maxAge: 3600, swr: 86_400 },
    "/api/cap/[...path]": { maxAge: 0 },
    "/api/[...path]": { maxAge: 900, swr: 3600 },
    "/_actions/[...path]": { maxAge: 0 },
  },

  // ─── 9. Development Server ────────────────────────────────────────────────
  server: { port: 4321, host: true },

  // ─── 10. Internationalization (i18n) ──────────────────────────────────────
  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: { prefixDefaultLocale: false },
  },

  // ─── 11. Type-Safe Environment Variables ──────────────────────────────────
  env: {
    schema: {
      GMAIL_USER: envField.string({ context: "server", access: "secret", optional: true }),
      GMAIL_PASS: envField.string({ context: "server", access: "secret", optional: true }),
      MAIL_TO: envField.string({ context: "server", access: "secret", optional: true }),
      CAP_SECRET_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      PUBLIC_CAP_API_ENDPOINT: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      PUBLIC_WHATSAPP_NUMBER: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },

  // ─── 12. Client Prefetching ───────────────────────────────────────────────
  prefetch: { defaultStrategy: "viewport", prefetchAll: false },
});

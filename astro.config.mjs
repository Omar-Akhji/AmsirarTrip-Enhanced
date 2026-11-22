// astro.config.mjs
import { fileURLToPath } from "node:url";
import { defineConfig, envField, fontProviders, memoryCache } from "astro/config";
import node from "@astrojs/node";
import vue from "@astrojs/vue";
import compress from "@playform/compress";
import tailwindcss from "@tailwindcss/vite";
import htmlValidate from "astro-html-validate";
import { DEFAULT_LOCALE, LOCALES } from "./src/i18n/locales.ts";

const srcDir = fileURLToPath(new URL("src", import.meta.url));

export default defineConfig({
  // ─── 1. Site & Core HTML Optimization ─────────────────────────────────────
  site: "https://amsirartrip.com",
  trailingSlash: "never",
  compressHTML: "jsx",
  markdown: { syntaxHighlight: false },

  fonts: [
    {
      name: "Montserrat",
      cssVariable: "--font-montserrat",
      provider: fontProviders.local(),
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: [
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "sans-serif",
      ],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/Montserrat-VariableFont_wght.woff2"],
            weight: "100 900",
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      provider: fontProviders.local(),
      weights: ["100 800"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/JetBrainsMono-Variable.woff2"],
            weight: "100 800",
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
    {
      name: "Yellowtail",
      cssVariable: "--font-yellowtail",
      provider: fontProviders.local(),
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["cursive"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/Yellowtail-Regular.woff2"],
            weight: "400",
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
  ],

  // ─── 2. Build Options ─────────────────────────────────────────────────────
  build: { inlineStylesheets: "always", format: "directory" },

  // ─── 3. Output & Runtime Adapter ──────────────────────────────────────────
  output: "server",
  session: false,
  adapter: node({ mode: "standalone", bodySizeLimit: 65_536, staticHeaders: true }),

  // ─── 4. Integrations ──────────────────────────────────────────────────────
  integrations: [
    vue(),
    htmlValidate(),
    compress({ CSS: false, HTML: false, Image: false, JavaScript: false, SVG: true }),
  ],

  // ─── 5. Vite & Tailwind CSS v4 ────────────────────────────────────────────
  vite: {
    build: { cssMinify: false },
    plugins: [tailwindcss({ optimize: { minify: true } })],
    resolve: { alias: { "@": srcDir } },
  },

  // ─── 6. Image Optimization ────────────────────────────────────────────────
  image: { domains: [], remotePatterns: [] },

  // ─── 7. Security & Origin Protection ──────────────────────────────────────
  security: {
    checkOrigin: true,
    allowedDomains: [
      { hostname: "amsirartrip.com", protocol: "https" },
      { hostname: "www.amsirartrip.com", protocol: "https" },
    ],
    actionBodySizeLimit: 65_536,
    csp: {
      algorithm: "SHA-256",
      directives: [
        "default-src 'self'",
        "font-src 'self'",
        "img-src 'self' blob: data:",
        "media-src 'self' blob: data:",
        "frame-src 'self' https://challenges.cloudflare.com https://www.google.com/maps https://www.google.com/maps/ https://maps.google.com",
        "frame-ancestors 'self'",
        "connect-src 'self' https://challenges.cloudflare.com",
        "manifest-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ],
      scriptDirective: { resources: ["'self'", "https://challenges.cloudflare.com"] },
      styleDirective: {
        resources: [
          { resource: "'self'", kind: "element" },
          { resource: "'unsafe-inline'", kind: "attribute" },
        ],
      },
    },
  },

  // ─── 8. Cache & Route Rules (Astro 7+) ────────────────────────────────────
  cache: { provider: memoryCache({ query: { include: [] } }) },

  routeRules: {
    "/robots.txt": { maxAge: 3600, swr: 86_400 },
    "/llms.txt": { maxAge: 3600, swr: 86_400 },
    "/llms-full.txt": { maxAge: 3600, swr: 86_400 },
    "/sitemap.xml": { maxAge: 3600, swr: 86_400 },
    "/sitemap-index.xml": { maxAge: 3600, swr: 86_400 },
    ...Object.fromEntries(
      LOCALES.map((locale) => [
        locale === DEFAULT_LOCALE ? "/" : `/${locale}`,
        { maxAge: 600, swr: 3600 },
      ]),
    ),
    "/[...locale]/about": { maxAge: 1800, swr: 86_400 },
    "/[...locale]/contact": { maxAge: 300, swr: 1800 },
    "/[...locale]/excursions": { maxAge: 900, swr: 3600 },
    "/[...locale]/excursions/[slug]": { maxAge: 1800, swr: 86_400 },
    "/[...locale]/privacy-policy": { maxAge: 86_400, swr: 604_800 },
    "/[...locale]/terms-of-service": { maxAge: 86_400, swr: 604_800 },
    "/[...locale]/tours": { maxAge: 900, swr: 3600 },
    "/[...locale]/tours/[slug]": { maxAge: 1800, swr: 86_400 },
    "/api/[...path]": { maxAge: 0 },
    "/_actions/[...path]": { maxAge: 0 },
    "/_image": { maxAge: 0 },
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
      LOG_DIR: envField.string({ context: "server", access: "secret", optional: true }),
      MAIL_TO: envField.string({ context: "server", access: "secret", optional: true }),
      ORIGIN_VERIFY_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
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

  // ─── 12. Client Prefetching & Speculation Rules Prerendering ──────────────
  prefetch: { defaultStrategy: "hover", prefetchAll: true },
  experimental: { clientPrerender: true },
});

import type { MiddlewareHandler } from "astro";
import { generateNonce } from "./lib/csp";
import { getSecurityHeaders } from "./lib/security-headers";
import { DEFAULT_LOCALE, isLocale } from "./i18n/locales";
import { getLocalizedPath } from "./i18n/core";

const STATIC_PATH_PREFIXES = [
  "/_astro/",
  "/.well-known/",
  "/favicon",
  "/icons/",
  "/fonts/",
  "/images/",
];

const DISCOVERY_PATHS = new Set([
  "/robots.txt",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
  "/sitemap-index.xml",
]);

export const onRequest: MiddlewareHandler = async (context, next) => {
  const pathname = new URL(context.request.url).pathname;
  const isStaticAsset = STATIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isDiscoveryAsset =
    DISCOVERY_PATHS.has(pathname) ||
    (pathname.startsWith("/sitemap-") && pathname.endsWith(".xml"));

  if (isDiscoveryAsset) {
    const response = await next();
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
    newResponse.headers.set("X-Content-Type-Options", "nosniff");
    return newResponse;
  }

  if (isStaticAsset) {
    const response = await next();
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-Content-Type-Options", "nosniff");
    newResponse.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    if (pathname.startsWith("/_astro/")) {
      newResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      newResponse.headers.set("Cache-Control", "public, max-age=2592000");
    }
    return newResponse;
  }

  // Handle i18n routing validation & locale resolution
  const localeParam = context.params["locale"];
  if (localeParam === undefined) {
    context.locals.locale = DEFAULT_LOCALE;
  } else if (localeParam === DEFAULT_LOCALE) {
    const canonicalPath = getLocalizedPath(pathname, DEFAULT_LOCALE);
    const search = new URL(context.request.url).search;
    return context.redirect(canonicalPath + search, 301);
  } else if (isLocale(localeParam)) {
    context.locals.locale = localeParam;
  } else {
    return context.rewrite("/404");
  }

  // Generate a unique nonce per request for CSP script-src
  const nonce = generateNonce();

  // Store nonce in locals so Layout.astro can access it
  context.locals.cspNonce = nonce;

  const response = await next();

  const host = new URL(context.request.url).hostname;
  const headers = getSecurityHeaders(nonce, host);

  for (const { key, value } of headers) {
    response.headers.set(key, value);
  }

  // Set standard Content-Language response header
  response.headers.set("Content-Language", context.locals.locale);

  // For HTML responses, inject the nonce onto every <script> tag so that
  // Astro's bundled scripts are allowed by CSP (strict-dynamic requires
  // a nonce or hash on each script).  This avoids the `is:inline` trap
  // where adding `nonce` to the template causes Astro to skip TypeScript
  // compilation.
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    const html = await response.text();
    const nonceAttr = `nonce="${nonce}"`;
    // Add nonce to any <script tag that does not already carry one.
    // Match <script followed by whitespace OR '>' (bare <script> tags from
    // is:inline directives and <astro-island> hydration scripts).
    const processed = html.replaceAll(
      /<script(?![^>]*\bnonce=)(\s|>)/g,
      (_match, space) => `<script ${nonceAttr}${space}`,
    );
    const customHeaders = new Headers(response.headers);
    customHeaders.delete("content-length");
    return new Response(processed, {
      status: response.status,
      statusText: response.statusText,
      headers: customHeaders,
    });
  }

  return response;
};

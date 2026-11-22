import type { APIContext } from "astro";
import { defineMiddleware } from "astro:middleware";
import { getLocalizedPath } from "./i18n/core";
import { DEFAULT_LOCALE, isLocale } from "./i18n/locales";
import { checkRateLimit, extractClientIp, isValidOriginSecret } from "./lib/api-utils";
import { env } from "./lib/env";
import {
  applySecurityHeaders,
  getBaselineSecurityHeaders,
  getSecurityHeaders,
} from "./lib/security-headers";

const STATIC_PATH_PREFIXES = [
  "/_astro/",
  "/.well-known/",
  "/favicon",
  "/icons/",
  "/fonts/",
  "/images/",
  "/videos/",
  "/patterns/",
];

const DISCOVERY_PATHS = new Set([
  "/robots.txt",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
  "/sitemap-index.xml",
]);

function createMissingAssetResponse(): Response {
  const notFoundHeaders = new Headers({
    "Cache-Control": "no-store, max-age=0, must-revalidate",
    "Content-Type": "text/plain; charset=utf-8",
  });
  applySecurityHeaders(notFoundHeaders, getSecurityHeaders());
  return new Response("Not Found", { status: 404, headers: notFoundHeaders });
}

let localhostCachePurged = false;

function resolveClientAddress(context: APIContext): string | undefined {
  try {
    return context.clientAddress;
  } catch {
    return undefined;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) {
    return next();
  }

  const configuredOriginSecret = env.ORIGIN_VERIFY_SECRET;
  if (import.meta.env.PROD && configuredOriginSecret.length > 0) {
    const providedSecret = context.request.headers.get("x-origin-verify");
    if (!isValidOriginSecret(providedSecret, configuredOriginSecret)) {
      context.cache.set(false);
      const forbiddenHeaders = new Headers({ "Cache-Control": "no-store" });
      applySecurityHeaders(forbiddenHeaders, getBaselineSecurityHeaders());
      return new Response("Forbidden", { status: 403, headers: forbiddenHeaders });
    }
    context.locals.isCloudflareVerified = true;
  } else {
    context.locals.isCloudflareVerified = false;
  }

  const requestUrl = new URL(context.request.url);
  const pathname = requestUrl.pathname;

  if (pathname.startsWith("/api/")) {
    const ip = extractClientIp({
      clientAddress: resolveClientAddress(context),
      isCloudflareVerified: context.locals.isCloudflareVerified,
      request: context.request,
    });
    context.locals.isApiRateLimitChecked = true;
    const rateLimit = checkRateLimit({
      identifier: `api:${ip}`,
      maxRequests: 60,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      context.cache.set(false);
      const rateHeaders = new Headers({
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "Retry-After": "60",
      });
      applySecurityHeaders(rateHeaders, getBaselineSecurityHeaders());
      return Response.json({ error: "Too many requests" }, { status: 429, headers: rateHeaders });
    }
  }
  const isStaticAsset = STATIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isDiscoveryAsset =
    DISCOVERY_PATHS.has(pathname)
    || (pathname.startsWith("/sitemap-") && pathname.endsWith(".xml"));

  // In production, any static asset that missed @astrojs/node's static handler does not exist;
  // short-circuit immediately instead of letting [...locale]/index.astro render a full SSR page.
  if (isStaticAsset && import.meta.env.PROD) {
    context.cache.set(false);
    return createMissingAssetResponse();
  }

  if (isDiscoveryAsset || isStaticAsset) {
    context.locals.locale = DEFAULT_LOCALE;
    const response = await next();
    const contentType = response.headers.get("content-type") ?? "";
    const isMissingAssetFallback = response.status >= 400 || contentType.includes("text/html");

    if (isMissingAssetFallback) {
      context.cache.set(false);
      return createMissingAssetResponse();
    }

    const newResponse = new Response(response.body, response);

    applySecurityHeaders(newResponse.headers, getBaselineSecurityHeaders());
    if (isDiscoveryAsset) {
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      newResponse.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
      return newResponse;
    }

    newResponse.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    if (pathname.startsWith("/videos/")) {
      newResponse.headers.set("Accept-Ranges", "bytes");
    }
    newResponse.headers.set(
      "Cache-Control",
      pathname.startsWith("/_astro/") || pathname.startsWith("/videos/") ?
        "public, max-age=31536000, immutable"
      : "public, max-age=2592000",
    );
    return newResponse;
  }

  const localeParam = context.params["locale"];
  if (localeParam === undefined) {
    if (!isLocale(context.locals.locale)) {
      context.locals.locale = DEFAULT_LOCALE;
    }
  } else if (localeParam === DEFAULT_LOCALE) {
    context.cache.set(false);
    const canonicalPath = getLocalizedPath(pathname, DEFAULT_LOCALE);
    const redirectResponse = context.redirect(canonicalPath + requestUrl.search, 301);
    const hardenedRedirect = new Response(redirectResponse.body, redirectResponse);
    applySecurityHeaders(hardenedRedirect.headers, getBaselineSecurityHeaders());
    return hardenedRedirect;
  } else if (isLocale(localeParam)) {
    context.locals.locale = localeParam;
  } else {
    context.cache.set(false);
    return context.rewrite("/404");
  }

  const response = await next();
  applySecurityHeaders(response.headers, getSecurityHeaders());
  response.headers.set("Content-Language", context.locals.locale);

  if (
    !localhostCachePurged
    && pathname !== "/_image"
    && requestUrl.hostname === "localhost"
    && import.meta.env.DEV
  ) {
    localhostCachePurged = true;
    response.headers.set("Clear-Site-Data", '"cache"');
  }

  return response;
});

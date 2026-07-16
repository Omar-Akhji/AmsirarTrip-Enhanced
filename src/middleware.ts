import type { MiddlewareHandler } from "astro";
import { generateNonce } from "./lib/csp";
import { getSecurityHeaders } from "./lib/security-headers";

const STATIC_PATH_PREFIXES = ["/_astro/", "/favicon", "/icons/", "/fonts/", "/images/"];

export const onRequest: MiddlewareHandler = async (context, next) => {
  const pathname = new URL(context.request.url).pathname;
  const isStaticAsset = STATIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Generate a unique nonce per request for CSP script-src
  const nonce = generateNonce();

  // Store nonce in locals so Layout.astro can access it
  context.locals.cspNonce = nonce;

  const response = await next();

  if (!isStaticAsset) {
    const host = new URL(context.request.url).hostname;
    const headers = getSecurityHeaders(nonce, host);

    for (const { key, value } of headers) {
      response.headers.set(key, value);
    }

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
      return new Response(processed, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
  } else if (isStaticAsset) {
    const newResponse = new Response(response.body, response);
    if (pathname.startsWith("/_astro/")) {
      newResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      newResponse.headers.set("Cache-Control", "public, max-age=2592000");
    }
    return newResponse;
  }

  return response;
};

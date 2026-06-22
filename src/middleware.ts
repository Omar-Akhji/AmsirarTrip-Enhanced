import type { MiddlewareHandler } from "astro";
import { getSecurityHeaders } from "./lib/security-headers";

const STATIC_PATH_PREFIXES = ["/_astro/", "/favicon", "/icons/", "/fonts/", "/images/"];

export const onRequest: MiddlewareHandler = async (context, next) => {
  const pathname = new URL(context.request.url).pathname;
  const isStaticAsset = STATIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const response = await next();

  if (!isStaticAsset) {
    const headers = getSecurityHeaders();
    for (const { key, value } of headers) {
      response.headers.set(key, value);
    }
  }

  return response;
};

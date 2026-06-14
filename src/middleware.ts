import type { MiddlewareHandler } from "astro";
import { getSecurityHeaders } from "./lib/security-headers";

export const onRequest: MiddlewareHandler = async (_context, next) => {
  const response = await next();

  const headers = getSecurityHeaders();
  for (const { key, value } of headers) {
    response.headers.set(key, value);
  }

  return response;
};

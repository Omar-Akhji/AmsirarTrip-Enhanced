import type { APIRoute } from "astro";
import { getCollection, type DataEntryMap } from "astro:content";
import { checkRateLimit, extractClientIp } from "@/lib/api-utils";
import { logger } from "@/services/logger";

export function createCollectionApiRoute(collection: keyof DataEntryMap): APIRoute {
  return async ({ cache, clientAddress, locals, request }) => {
    const ip = extractClientIp(request, clientAddress, locals.isCloudflareVerified);
    const rateLimit = checkRateLimit(`api:${ip}`, 60, 60_000);
    if (!rateLimit.allowed) {
      cache.set(false);
      return Response.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "Cache-Control": "no-store, max-age=0, must-revalidate",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }

    try {
      const entries = await getCollection(collection);
      const data = entries.map((entry) => ({ id: entry.id, ...entry.data }));
      return Response.json(data, {
        headers: {
          "Cache-Control": "public, max-age=900, s-maxage=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (error) {
      logger.error(`Failed to load collection "${collection}"`, error);
      cache.set(false);
      return Response.json(
        { error: "Internal server error" },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }
  };
}

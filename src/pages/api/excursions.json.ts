import { extractClientIp } from "@/actions/helpers/action-guards";
import { checkRateLimit } from "@/lib/api-utils";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ clientAddress, request }) => {
  const ip = extractClientIp(request, clientAddress);
  const rateLimit = checkRateLimit(`api:${ip}`, 60, 60_000);
  if (!rateLimit.allowed) {
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

  const excursions = await getCollection("excursions");
  const data = excursions.map((excursion) => ({ id: excursion.id, ...excursion.data }));
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, max-age=900, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

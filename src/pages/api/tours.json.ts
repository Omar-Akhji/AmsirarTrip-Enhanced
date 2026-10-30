import { checkRateLimit } from "@/lib/api-utils";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ clientAddress }) => {
  const ip = clientAddress || "unknown";
  const rateLimit = checkRateLimit(`api:${ip}`, 60, 60_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60", "X-Content-Type-Options": "nosniff" } },
    );
  }

  const tours = await getCollection("tours");
  const data = tours.map((tour) => ({ id: tour.id, ...tour.data }));
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, max-age=900, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

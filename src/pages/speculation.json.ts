import type { APIRoute } from "astro";

const SPECULATION_RULES_PAYLOAD = JSON.stringify({
  prerender: [
    {
      source: "document",
      where: {
        and: [
          { href_matches: "/*" },
          { not: { href_matches: "/api/*" } },
          { not: { href_matches: "/_actions/*" } },
          {
            not: {
              selector_matches: "[data-astro-prefetch='false'], [download], [target='_blank']",
            },
          },
        ],
      },
      eagerness: "moderate",
    },
  ],
  prefetch: [
    {
      source: "document",
      where: {
        and: [
          { href_matches: "/*" },
          { not: { href_matches: "/api/*" } },
          { not: { href_matches: "/_actions/*" } },
          {
            not: {
              selector_matches: "[data-astro-prefetch='false'], [download], [target='_blank']",
            },
          },
        ],
      },
      eagerness: "moderate",
    },
  ],
});

export const GET: APIRoute = () =>
  new Response(SPECULATION_RULES_PAYLOAD, {
    headers: {
      "Content-Type": "application/speculationrules+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });

import type { APIRoute } from "astro";

const LAST_MOD = "2026-10-27";

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL("https://amsirartrip.com");
  const sitemapUrl = new URL("/sitemap.xml", baseUrl).href;

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    `  <sitemap>`,
    `    <loc>${sitemapUrl}</loc>`,
    `    <lastmod>${LAST_MOD}</lastmod>`,
    `  </sitemap>`,
    `</sitemapindex>`,
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};

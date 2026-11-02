import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL("https://amsirartrip.com");
  const sitemapUrl = new URL("/sitemap.xml", baseUrl).href;
  const lastMod = new Date().toISOString().slice(0, 10);

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    `  <sitemap>`,
    `    <loc>${sitemapUrl}</loc>`,
    `    <lastmod>${lastMod}</lastmod>`,
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

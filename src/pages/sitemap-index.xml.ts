import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const LOCALES = ["en", "fr", "de", "es"] as const;
const DEFAULT_LOCALE = "en";
const CONTENT_LAST_MODIFIED = "2026-05-08";

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site || new URL("https://amsirartrip.com");
  const tours = await getCollection("tours");
  const excursions = await getCollection("excursions");

  const tourRoutes = tours.map((tour) => `tours/${tour.id}`);
  const excursionRoutes = excursions.map((excursion) => `excursions/${excursion.id}`);

  const staticRoutes = ["", "/tours", "/excursions", "/about", "/contact"];
  const dynamicRoutes = [
    ...tourRoutes.map((route) => `/${route}`),
    ...excursionRoutes.map((route) => `/${route}`),
  ];
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  for (const route of allRoutes) {
    const depth = route === "" ? 0 : route.split("/").length;
    const priority =
      depth === 0 ? "1.0"
      : depth <= 2 ? "0.9"
      : "0.8";
    const changefreq = depth === 0 ? "daily" : "weekly";

    for (const locale of LOCALES) {
      const localePath = locale === DEFAULT_LOCALE ? route : `/${locale}${route}`;
      const url = new URL(localePath, baseUrl).href;

      xml += `  <url>\n`;
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <lastmod>${CONTENT_LAST_MODIFIED}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;

      for (const altLocale of LOCALES) {
        const altPath = altLocale === DEFAULT_LOCALE ? route : `/${altLocale}${route}`;
        const altUrl = new URL(altPath, baseUrl).href;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altUrl}" />\n`;
      }
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${new URL(route, baseUrl).href}" />\n`;

      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

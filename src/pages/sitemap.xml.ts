import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/locales";
import { getLocalizedPath } from "@/i18n/core";

function escapeXml(unsafe: string): string {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

interface RouteEntry {
  route: string;
  lastmod: string;
  imageLoc?: string;
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL("https://amsirartrip.com");
  const tours = await getCollection("tours");
  const excursions = await getCollection("excursions");

  const routes: RouteEntry[] = [
    {
      route: "",
      lastmod: "2026-10-27",
      imageLoc: new URL("/images/hero/marrakech-medina.webp", baseUrl).href,
    },
    {
      route: "/tours",
      lastmod: "2026-10-25",
      imageLoc: new URL("/images/hero/merzouga-desert.webp", baseUrl).href,
    },
    {
      route: "/excursions",
      lastmod: "2026-10-24",
      imageLoc: new URL("/images/hero/ouzoud-falls.webp", baseUrl).href,
    },
    { route: "/about", lastmod: "2026-10-15" },
    { route: "/contact", lastmod: "2026-10-15" },
    { route: "/privacy-policy", lastmod: "2026-09-01" },
    { route: "/terms-of-service", lastmod: "2026-09-01" },
  ];

  const sortedTours = [...tours].toSorted((a, b) => a.data.bookingId - b.data.bookingId);
  for (const tour of sortedTours) {
    const dayOffset = String(Math.max(10, 26 - tour.data.bookingId)).padStart(2, "0");
    routes.push({
      route: `/tours/${tour.id}`,
      lastmod: `2026-10-${dayOffset}`,
      imageLoc: new URL(tour.data.image.src, baseUrl).href,
    });
  }

  const sortedExcursions = [...excursions].toSorted((a, b) => a.data.bookingId - b.data.bookingId);
  for (const excursion of sortedExcursions) {
    const dayOffset = String(Math.max(10, 20 - excursion.data.bookingId)).padStart(2, "0");
    routes.push({
      route: `/excursions/${excursion.id}`,
      lastmod: `2026-10-${dayOffset}`,
      imageLoc: new URL(excursion.data.image.src, baseUrl).href,
    });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const entry of routes) {
    for (const locale of LOCALES) {
      const url = new URL(getLocalizedPath(entry.route, locale), baseUrl).href;

      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(url)}</loc>\n`;
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;

      for (const altLocale of LOCALES) {
        const altUrl = new URL(getLocalizedPath(entry.route, altLocale), baseUrl).href;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${escapeXml(altUrl)}" />\n`;
      }
      const xDefaultUrl = new URL(getLocalizedPath(entry.route, DEFAULT_LOCALE), baseUrl).href;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(xDefaultUrl)}" />\n`;

      if (entry.imageLoc) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(entry.imageLoc)}</image:loc>\n`;
        xml += `    </image:image>\n`;
      }

      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};

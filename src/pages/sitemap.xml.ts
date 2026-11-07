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
  imageTitle?: string;
  imageCaption?: string;
  hasVideo?: boolean;
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL("https://amsirartrip.com");
  const tours = await getCollection("tours");
  const excursions = await getCollection("excursions");
  const today = new Date().toISOString().slice(0, 10);

  const routes: RouteEntry[] = [
    {
      route: "",
      lastmod: today,
      imageLoc: new URL("/images/hero/marrakech-medina.webp", baseUrl).href,
      imageTitle: "Amsirar Trip Marrakech Medina & Sahara Desert Tours",
      imageCaption:
        "Licensed Morocco travel operator in Marrakech offering private desert tours and day trips.",
      hasVideo: true,
    },
    {
      route: "/tours",
      lastmod: today,
      imageLoc: new URL("/images/hero/merzouga-desert.webp", baseUrl).href,
      imageTitle: "Multi-Day Morocco Sahara Desert Tours",
      imageCaption:
        "Private Sahara desert tours from Marrakech, Casablanca, and Fes to Erg Chebbi dunes.",
    },
    {
      route: "/excursions",
      lastmod: today,
      imageLoc: new URL("/images/hero/ouzoud-falls.webp", baseUrl).href,
      imageTitle: "Marrakech Day Trips & Atlas Mountain Excursions",
      imageCaption:
        "Guided day excursions from Marrakech to Ouzoud Waterfalls, Essaouira, Ourika Valley, and Agafay Desert.",
    },
    { route: "/about", lastmod: today },
    { route: "/contact", lastmod: today },
    { route: "/privacy-policy", lastmod: "2026-09-01" },
    { route: "/terms-of-service", lastmod: "2026-09-01" },
  ];

  const sortedTours = [...tours].toSorted((a, b) => a.data.bookingId - b.data.bookingId);
  for (const tour of sortedTours) {
    routes.push({
      route: `/tours/${tour.id}`,
      lastmod: today,
      imageLoc: new URL(tour.data.image.src, baseUrl).href,
      imageTitle: tour.data.seo.title,
      imageCaption: tour.data.seo.imageAlt ?? tour.data.seo.metaDescription,
    });
  }

  const sortedExcursions = [...excursions].toSorted((a, b) => a.data.bookingId - b.data.bookingId);
  for (const excursion of sortedExcursions) {
    routes.push({
      route: `/excursions/${excursion.id}`,
      lastmod: today,
      imageLoc: new URL(excursion.data.image.src, baseUrl).href,
      imageTitle: excursion.data.seo.title,
      imageCaption: excursion.data.seo.imageAlt ?? excursion.data.jsonLd.description,
    });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

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
        if (entry.imageTitle) {
          xml += `      <image:title>${escapeXml(entry.imageTitle)}</image:title>\n`;
        }
        if (entry.imageCaption) {
          xml += `      <image:caption>${escapeXml(entry.imageCaption)}</image:caption>\n`;
        }
        xml += `    </image:image>\n`;
      }

      if (entry.hasVideo) {
        const videoThumb = new URL("/images/hero/marrakech-medina.webp", baseUrl).href;
        const videoContent = new URL("/videos/Morocco-Video.mp4", baseUrl).href;
        xml += `    <video:video>\n`;
        xml += `      <video:thumbnail_loc>${escapeXml(videoThumb)}</video:thumbnail_loc>\n`;
        xml += `      <video:title>Morocco Sahara Desert Tours &amp; Cultural Expeditions</video:title>\n`;
        xml += `      <video:description>Experience private Sahara desert camel treks, Atlas mountain passes, and historic Moroccan medinas with Amsirar Trip.</video:description>\n`;
        xml += `      <video:content_loc>${escapeXml(videoContent)}</video:content_loc>\n`;
        xml += `      <video:duration>79</video:duration>\n`;
        xml += `    </video:video>\n`;
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

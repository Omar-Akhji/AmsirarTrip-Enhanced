import type { APIRoute } from "astro";

import { getCollection } from "astro:content";
import { getLocalizedExcursionContent } from "@/features/excursions/data/excursions-data";
import { getLocalizedTourSeo } from "@/features/tours/data/tours-data";
import { getLocalizedPath } from "@/i18n/core";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
import { ui } from "@/i18n/ui";

function escapeXml(unsafe: string): string {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

interface RouteEntry {
  hasVideo?: boolean;
  imageCaption?: string | ((locale: Locale) => string);
  imageLoc?: string;
  imageTitle?: string | ((locale: Locale) => string);
  lastmod: string;
  route: string;
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL("https://amsirartrip.com");
  const [tours, excursions] = await Promise.all([
    getCollection("tours"),
    getCollection("excursions"),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  const routes: RouteEntry[] = [
    {
      route: "",
      lastmod: today,
      imageLoc: new URL("/images/hero/marrakech-medina.webp", baseUrl).href,
      imageTitle: (locale) => ui[locale].home.meta.title,
      imageCaption: (locale) => ui[locale].home.meta.description,
      hasVideo: true,
    },
    {
      route: "/tours",
      lastmod: today,
      imageLoc: new URL("/images/hero/merzouga-desert.webp", baseUrl).href,
      imageTitle: (locale) => ui[locale].tours.meta.title,
      imageCaption: (locale) => ui[locale].tours.meta.description,
    },
    {
      route: "/excursions",
      lastmod: today,
      imageLoc: new URL("/images/hero/ouzoud-falls.webp", baseUrl).href,
      imageTitle: (locale) => ui[locale].excursion.meta.title,
      imageCaption: (locale) => ui[locale].excursion.meta.description,
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
      imageTitle: (locale) => getLocalizedTourSeo(tour.data, locale).title,
      imageCaption: (locale) => getLocalizedTourSeo(tour.data, locale).imageAlt,
    });
  }

  const sortedExcursions = [...excursions].toSorted((a, b) => a.data.bookingId - b.data.bookingId);
  for (const excursion of sortedExcursions) {
    routes.push({
      route: `/excursions/${excursion.id}`,
      lastmod: today,
      imageLoc: new URL(excursion.data.image.src, baseUrl).href,
      imageTitle: (locale) => getLocalizedExcursionContent(excursion.data, locale).seo.title,
      imageCaption: (locale) => getLocalizedExcursionContent(excursion.data, locale).seo.imageAlt,
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
        const resolvedTitle =
          typeof entry.imageTitle === "function" ? entry.imageTitle(locale) : entry.imageTitle;
        const resolvedCaption =
          typeof entry.imageCaption === "function" ?
            entry.imageCaption(locale)
          : entry.imageCaption;
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(entry.imageLoc)}</image:loc>\n`;
        if (resolvedTitle) {
          xml += `      <image:title>${escapeXml(resolvedTitle)}</image:title>\n`;
        }
        if (resolvedCaption) {
          xml += `      <image:caption>${escapeXml(resolvedCaption)}</image:caption>\n`;
        }
        xml += `    </image:image>\n`;
      }

      if (entry.hasVideo) {
        const videoThumb = new URL("/images/hero/marrakech-medina.webp", baseUrl).href;
        const videoContent = new URL("/videos/Morocco-Video.mp4", baseUrl).href;
        const videoTitle = ui[locale].video.name;
        const videoDescription = ui[locale].video.description;
        xml += `    <video:video>\n`;
        xml += `      <video:thumbnail_loc>${escapeXml(videoThumb)}</video:thumbnail_loc>\n`;
        xml += `      <video:title>${escapeXml(videoTitle)}</video:title>\n`;
        xml += `      <video:description>${escapeXml(videoDescription)}</video:description>\n`;
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
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
};

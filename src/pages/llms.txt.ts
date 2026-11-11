import agencyProfile from "@/data/agency-profile.json";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL("https://amsirartrip.com");
  const tours = await getCollection("tours");
  const excursions = await getCollection("excursions");

  const sortedTours = [...tours].toSorted((a, b) => a.data.bookingId - b.data.bookingId);
  const sortedExcursions = [...excursions].toSorted((a, b) => a.data.bookingId - b.data.bookingId);

  const lines: string[] = [
    `# ${agencyProfile.name}`,
    "",
    "> Licensed Morocco tour operator specializing in private Sahara desert expeditions, High Atlas treks, and imperial city tours in English, French, German, and Spanish.",
    "",
    "## Docs",
    "",
    `- [All Morocco Tours](${new URL("/tours", baseUrl).href}): Catalog of handcrafted multi-day Sahara desert circuits, imperial city routes, and mountain treks.`,
    `- [Marrakech Day Excursions](${new URL("/excursions", baseUrl).href}): Private day trips to Agafay Desert, Essaouira, Ouzoud Waterfalls, Imlil & Toubkal, and Ourika Valley.`,
    `- [About Us](${new URL("/about", baseUrl).href}): Over 20 years of local Berber heritage, licensed mountain guides, and modern air-conditioned vehicle fleet.`,
    `- [Contact & Booking Inquiries](${new URL("/contact", baseUrl).href}): Direct WhatsApp and email booking consultation for custom private Morocco travel itineraries.`,
    "",
    "## Multi-Day Tours",
    "",
  ];

  for (const tour of sortedTours) {
    const url = new URL(`/tours/${tour.id}`, baseUrl).href;
    const priceInfo =
      tour.data.jsonLd.price ?
        `From ${tour.data.jsonLd.price} ${tour.data.jsonLd.currency ?? "EUR"}`
      : tour.data.seo.price.label;
    lines.push(
      `- [${tour.data.seo.title}](${url}): ${tour.data.durationDays}-day tour from ${tour.data.startLocation} to ${tour.data.endLocation} (${priceInfo}). ${tour.data.seo.metaDescription}`,
    );
  }

  lines.push("", "## Marrakech Day Excursions", "");

  for (const excursion of sortedExcursions) {
    const url = new URL(`/excursions/${excursion.id}`, baseUrl).href;
    const priceInfo =
      excursion.data.jsonLd.price ?
        `From ${excursion.data.jsonLd.price} ${excursion.data.jsonLd.currency ?? "EUR"}`
      : "Full-day private excursion";
    lines.push(
      `- [${excursion.data.jsonLd.name}](${url}): ${excursion.data.location} (${priceInfo}). ${excursion.data.jsonLd.description}`,
    );
  }

  lines.push(
    "",
    "## Key Facts",
    "",
    `- Legal Entity: ${agencyProfile.legalName}`,
    `- Tourism License: ${agencyProfile.licenseNumber}`,
    `- Founded: ${agencyProfile.foundingDate}`,
    `- Headquarters: ${agencyProfile.address.fullAddress}`,
    `- WhatsApp / Phone: ${agencyProfile.contact.phones.map((p) => p.display).join(" / ")}`,
    `- Email: ${agencyProfile.contact.emails.join(", ")}`,
    `- Operating Hours: ${agencyProfile.contact.workingHours}`,
    `- Supported Languages: English, French, German, Spanish`,
    "",
    "## Optional",
    "",
    `- [Full Content Catalog (/llms-full.txt)](${new URL("/llms-full.txt", baseUrl).href}): Extended documentation index with full itinerary schedules and details.`,
    `- [Terms of Service](${new URL("/terms-of-service", baseUrl).href}): Booking policies, payment procedures, cancellation timeline, and operator responsibilities.`,
    `- [Privacy Policy](${new URL("/privacy-policy", baseUrl).href}): Data protection, cookie policies, and customer privacy commitments.`,
    `- [XML Sitemap](${new URL("/sitemap.xml", baseUrl).href}): Full multilingual XML sitemap with hreflang annotations.`,
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
};

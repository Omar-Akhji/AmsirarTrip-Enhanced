import agencyProfile from "@/data/agency-profile.json";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL("https://amsirartrip.com");
  const tours = await getCollection("tours");
  const excursions = await getCollection("excursions");

  const sortedTours = [...tours].toSorted((a, b) => a.data.bookingId - b.data.bookingId);
  const sortedExcursions = [...excursions].toSorted((a, b) => a.data.bookingId - b.data.bookingId);

  const lines: string[] = [
    `# ${agencyProfile.name}: Specialist Morocco Travel Agency`,
    "",
    `> ${agencyProfile.name} (${agencyProfile.legalName}) is a licensed Morocco tour operator (${agencyProfile.licenseNumber}) founded in ${agencyProfile.foundingDate} and headquartered in Marrakech, Morocco. We organize private Sahara desert tours, High Atlas Mountain treks, imperial city circuits, and Marrakech day excursions in English, French, German, and Spanish.`,
    "",
    "## Agency Credentials & Contact",
    "",
    `- Official website: ${new URL("/", baseUrl).href}`,
    `- Legal name: ${agencyProfile.legalName}`,
    `- Tourism license: ${agencyProfile.licenseNumber}`,
    `- Headquarters: ${agencyProfile.address.fullAddress}`,
    `- Phone / WhatsApp: ${agencyProfile.contact.phones.map((p) => p.display).join(" / ")}`,
    `- Email: ${agencyProfile.contact.emails.join(", ")}`,
    `- Operating hours: ${agencyProfile.contact.workingHours}`,
    `- Supported languages: English (\`/...\`), French (\`/fr/...\`), German (\`/de/...\`), Spanish (\`/es/...\`)`,
    "",
    "## Multi-Day Morocco Tours",
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
    "## Core Pages & Sitemaps",
    "",
    `- [Home](${new URL("/", baseUrl).href}): Overview of Morocco desert tours, day trips, destinations, and traveler reviews.`,
    `- [All Morocco Tours](${new URL("/tours", baseUrl).href}): Complete catalog of multi-day Morocco circuits from Marrakech, Casablanca, Fes, Tangier, and Agadir.`,
    `- [Marrakech Excursions](${new URL("/excursions", baseUrl).href}): Day trips from Marrakech to Ouzoud Waterfalls, Essaouira, Imlil & Toubkal, Ourika Valley, Agafay Desert, and Hot Air Ballooning.`,
    `- [About Amsirar Trip](${new URL("/about", baseUrl).href}): Our local Berber heritage, fleet safety standards, and licensed guides.`,
    `- [Contact & Custom Itinerary Quote](${new URL("/contact", baseUrl).href}): Direct WhatsApp, phone, and email inquiry form for custom Morocco itineraries.`,
    `- [XML Sitemap](${new URL("/sitemap.xml", baseUrl).href}): Full multilingual XML sitemap with hreflang and image extensions.`,
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};

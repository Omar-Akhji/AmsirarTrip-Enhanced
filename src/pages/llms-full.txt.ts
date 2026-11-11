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
    `# ${agencyProfile.name}: Full Content Catalog & Travel Guide`,
    "",
    "> Complete guide to private Morocco Sahara desert tours, Atlas Mountain treks, imperial city circuits, and Marrakech day excursions organized by Amsirar Trip SARL.",
    "",
    "## Docs",
    "",
    `- [All Morocco Tours](${new URL("/tours", baseUrl).href}): Comprehensive directory of multi-day Sahara desert circuits, imperial city itineraries, and cultural routes.`,
    `- [Marrakech Day Excursions](${new URL("/excursions", baseUrl).href}): Full catalog of private day trips to Agafay Desert, Essaouira, Ouzoud Waterfalls, Imlil & Toubkal, and Ourika Valley.`,
    `- [About Us](${new URL("/about", baseUrl).href}): Over 20 years of local Berber heritage, licensed mountain guides, and modern air-conditioned vehicle fleet.`,
    `- [Contact & Custom Itinerary](${new URL("/contact", baseUrl).href}): Direct WhatsApp and email booking consultation for custom private Morocco travel itineraries.`,
    "",
    "## Detailed Multi-Day Tours",
    "",
  ];

  for (const tour of sortedTours) {
    const url = new URL(`/tours/${tour.id}`, baseUrl).href;
    const priceInfo =
      tour.data.jsonLd.price ?
        `From ${tour.data.jsonLd.price} ${tour.data.jsonLd.currency ?? "EUR"}`
      : tour.data.seo.price.label;

    lines.push(`### [${tour.data.seo.title}](${url})`);
    lines.push(`- **Duration**: ${tour.data.durationDays} Days`);
    lines.push(`- **Route**: ${tour.data.startLocation} to ${tour.data.endLocation}`);
    lines.push(`- **Price**: ${priceInfo}`);
    lines.push(`- **Overview**: ${tour.data.seo.metaDescription}`);

    if (tour.data.seo.highlights && tour.data.seo.highlights.length > 0) {
      lines.push("- **Highlights**:");
      for (const h of tour.data.seo.highlights) {
        lines.push(`  - ${h}`);
      }
    }

    if (tour.data.seo.faqs && tour.data.seo.faqs.length > 0) {
      lines.push("- **Frequently Asked Questions**:");
      for (const faq of tour.data.seo.faqs) {
        lines.push(`  - **Q: ${faq.question}**`);
        lines.push(`    A: ${faq.answer}`);
      }
    }

    lines.push("");
  }

  lines.push("## Detailed Marrakech Day Excursions", "");

  for (const excursion of sortedExcursions) {
    const url = new URL(`/excursions/${excursion.id}`, baseUrl).href;
    const priceInfo =
      excursion.data.jsonLd.price ?
        `From ${excursion.data.jsonLd.price} ${excursion.data.jsonLd.currency ?? "EUR"}`
      : "Full-day private excursion";

    lines.push(`### [${excursion.data.jsonLd.name}](${url})`);
    lines.push(`- **Location**: ${excursion.data.location}`);
    lines.push(`- **Price**: ${priceInfo}`);
    lines.push(`- **Overview**: ${excursion.data.jsonLd.description}`);

    if (excursion.data.overview && excursion.data.overview.length > 0) {
      lines.push("- **Key Features**:");
      for (const item of excursion.data.overview) {
        lines.push(`  - ${item}`);
      }
    }

    if (excursion.data.seo.faqs && excursion.data.seo.faqs.length > 0) {
      lines.push("- **Frequently Asked Questions**:");
      for (const faq of excursion.data.seo.faqs) {
        lines.push(`  - **Q: ${faq.question}**`);
        lines.push(`    A: ${faq.answer}`);
      }
    }

    lines.push("");
  }

  lines.push(
    "## Agency Information & Credentials",
    "",
    `- Legal Entity: ${agencyProfile.legalName}`,
    `- Tourism License: ${agencyProfile.licenseNumber}`,
    `- Trade Register (RC): ${agencyProfile.rc}`,
    `- Fiscal Identifier (IF): ${agencyProfile.if}`,
    `- Common Business Identifier (ICE): ${agencyProfile.ice}`,
    `- Patente: ${agencyProfile.patente}`,
    `- Founded: ${agencyProfile.foundingDate}`,
    `- Headquarters: ${agencyProfile.address.fullAddress}`,
    `- WhatsApp / Phone: ${agencyProfile.contact.phones.map((p) => p.display).join(" / ")}`,
    `- Email: ${agencyProfile.contact.emails.join(", ")}`,
    `- Operating Hours: ${agencyProfile.contact.workingHours}`,
    `- Supported Languages: English, French, German, Spanish`,
    "",
    "## Departure Hubs & Gateways",
    "",
    "- Marrakech (RAK): Gateway to Erg Chebbi (Merzouga), Erg Chegaga, Dades Valley, Ait Ben Haddou, and Agafay Desert.",
    "- Fes (FEZ): Direct departures crossing the Middle Atlas, Ziz Valley, and Merzouga dunes toward Marrakech.",
    "- Casablanca (CMN): Grand tours connecting the Atlantic Coast, Imperial Cities (Rabat, Meknes, Fes), and the Sahara.",
    "- Tangier (TNG): Northern hub connecting ferry arrivals and flights to Chefchaouen, the Rif Mountains, and southward circuits.",
    "",
    "## Optional",
    "",
    `- [Concise Guide (/llms.txt)](${new URL("/llms.txt", baseUrl).href}): Standard concise llms.txt index.`,
    `- [Terms of Service](${new URL("/terms-of-service", baseUrl).href}): Booking policies, payment procedures, cancellation timeline, and operator responsibilities.`,
    `- [Privacy Policy](${new URL("/privacy-policy", baseUrl).href}): Data protection, cookie policies, and customer privacy commitments.`,
    `- [XML Sitemap Index](${new URL("/sitemap-index.xml", baseUrl).href}): Primary XML sitemap index.`,
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

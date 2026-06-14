type TripItineraryItem = { position: number; name: string; description?: string };

type TripStructuredData<TLocation> = {
  name: string;
  description: string;
  provider: string;
  image: string;
  price?: number | undefined;
  currency?: string | undefined;
  duration: string;
  location: TLocation;
  url: string;
  itinerary?: TripItineraryItem[];
};

type TourLocation = { start: string; end: string };

type ExcursionLocation = { point: string };

type TourStructuredData = TripStructuredData<TourLocation>;
type ExcursionStructuredData = TripStructuredData<ExcursionLocation>;

function sanitizeForJsonLd(value: string | undefined): string {
  if (!value) return "";
  return value
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll(/[<>]/g, "")
    .replaceAll(/javascript:/gi, "")
    .trim();
}

const BASE_URL = "https://amsirartrip.com";

function resolveUrl(raw: string): string {
  return raw.startsWith("http") ? raw : `${BASE_URL}${raw}`;
}

function buildTripJsonLd<TLocation>(
  data: TripStructuredData<TLocation>,
  fallbackItinerary: Record<string, unknown>[],
  touristType: string[],
  providerExtras?: Record<string, unknown>,
) {
  const itinerary =
    data.itinerary && data.itinerary.length > 0 ?
      data.itinerary.map((item) => ({
        "@type": "ListItem",
        position: item.position,
        item: {
          "@type": "TouristDestination",
          name: sanitizeForJsonLd(item.name),
          ...(item.description && { description: sanitizeForJsonLd(item.description) }),
        },
      }))
    : fallbackItinerary;

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: sanitizeForJsonLd(data.name),
    description: sanitizeForJsonLd(data.description),
    image: resolveUrl(data.image),
    provider: {
      "@type": "TravelAgency",
      name: sanitizeForJsonLd(data.provider),
      url: BASE_URL,
      ...providerExtras,
    },
    ...(data.price && {
      offers: {
        "@type": "Offer",
        price: data.price,
        priceCurrency: data.currency || "EUR",
        availability: "https://schema.org/InStock",
      },
    }),
    itinerary: { "@type": "ItemList", itemListElement: itinerary },
    touristType,
    duration: sanitizeForJsonLd(data.duration),
    url: resolveUrl(data.url),
  };
}

export function generateTourJsonLd(data: TourStructuredData) {
  return buildTripJsonLd(
    data,
    [
      { "@type": "TouristDestination", name: data.location.start },
      { "@type": "TouristDestination", name: data.location.end },
    ],
    ["Adventure", "Cultural", "Nature"],
    {
      logo: `${BASE_URL}/horse-head.svg`,
      address: { "@type": "PostalAddress", addressCountry: "MA", addressLocality: "Marrakech" },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+212-661-173-144",
        contactType: "Customer Service",
        availableLanguage: ["English", "French", "Spanish", "German"],
      },
    },
  );
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: sanitizeForJsonLd(faq.question),
      acceptedAnswer: { "@type": "Answer", text: sanitizeForJsonLd(faq.answer) },
    })),
  };
}

export function generateExcursionJsonLd(data: ExcursionStructuredData) {
  return buildTripJsonLd(
    data,
    [{ "@type": "TouristDestination", name: data.location.point }],
    ["Day Trip", "Cultural Experience"],
  );
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${BASE_URL}/#organization`,
    name: "Amsirar Trip",
    alternateName: ["Amsirar", "AmsirarTrip", "amsirartrip", "Amsirar Tours", "Amsirar Morocco"],
    url: "https://amsirartrip.com",
    logo: "https://amsirartrip.com/horse-head.svg",
    image: "https://amsirartrip.com/images/Header/header-1.webp",
    description:
      "Amsirar Trip is a specialist Morocco travel agency offering authentic Sahara desert tours, imperial city excursions, Atlas Mountains treks, and cultural experiences. Book your Morocco adventure with local experts.",
    legalName: "Amsirar Trip",
    foundingDate: "2004",
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: 10, maxValue: 50 },
    knowsAbout: [
      "Morocco Tourism",
      "Sahara Desert Tours",
      "Atlas Mountains Trekking",
      "Cultural Heritage",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Marrakech",
      addressLocality: "Marrakech",
      addressRegion: "Marrakech-Safi",
      postalCode: "40000",
      addressCountry: "MA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+212-661-173-144",
      contactType: "Customer Service",
      areaServed: "MA",
      availableLanguage: ["English", "French", "Spanish", "German"],
    },
    sameAs: [
      "https://facebook.com/amsirartrip",
      "https://instagram.com/amsirartrip",
      "https://twitter.com/amsirartrip",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "250",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Kevin B." },
        datePublished: "2023-11-15",
        reviewBody:
          "An unforgettable journey! From the bustling souks of Marrakech to the silent dunes of Merzouga. Amsirar Trip took care of everything.",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Ben L." },
        datePublished: "2024-02-10",
        reviewBody:
          "Professional, punctual, and passionate. Our driver was incredibly knowledgeable and made us feel safe throughout the entire Atlas Mountains trek.",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Sara M." },
        datePublished: "2024-03-22",
        reviewBody:
          "The luxury desert camp was beyond our expectations. Watching the sunrise over the Sahara while sipping traditional mint tea is a memory I'll cherish forever.",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      },
    ],
  };
}

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Amsirar Trip",
    alternateName: ["AmsirarTrip", "Amsirar"],
    url: "https://amsirartrip.com",
    description:
      "Amsirar Trip offers authentic Morocco tours, Sahara desert adventures, and cultural experiences with local experts.",
    publisher: { "@id": `${BASE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://amsirartrip.com/tours?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["en", "fr", "de", "es"],
  };
}

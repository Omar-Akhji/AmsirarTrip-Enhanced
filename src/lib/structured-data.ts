import agencyProfile from "@/data/agency-profile.json";

interface AgencyProfileData {
  readonly name: string;
  readonly legalName?: string | undefined;
  readonly licenseNumber?: string | undefined;
  readonly patente?: string | undefined;
  readonly rc?: string | undefined;
  readonly foundingDate: string;
  readonly priceRange?: string | undefined;
  readonly employeeRange: { readonly min: number; readonly max: number };
  readonly address: {
    readonly fullAddress: string;
    readonly streetAddress: string;
    readonly addressLocality: string;
    readonly addressRegion: string;
    readonly postalCode: string;
    readonly addressCountry: string;
  };
  readonly geo: { readonly latitude: number; readonly longitude: number };
  readonly contact: {
    readonly phones: readonly { readonly display: string; readonly value: string }[];
    readonly emails: readonly string[];
    readonly workingHours: string;
  };
  readonly socials: readonly string[];
  readonly reviews: readonly {
    readonly author: string;
    readonly datePublished: string;
    readonly rating: number;
    readonly body: string;
  }[];
}

const agency: AgencyProfileData = agencyProfile;

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
  return value ?
      value
        .replaceAll(/<[^>]*>/g, "")
        .replaceAll(/[<>]/g, "")
        .replaceAll(/javascript:/gi, "")
        .trim()
    : "";
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
      "@id": `${BASE_URL}/#organization`,
      name: sanitizeForJsonLd(data.provider),
      url: BASE_URL,
      ...providerExtras,
    },
    ...(data.price && {
      offers: {
        "@type": "Offer",
        price: data.price,
        priceCurrency: data.currency && data.currency.trim() !== "" ? data.currency.trim() : "EUR",
        availability: "https://schema.org/InStock",
        url: resolveUrl(data.url),
      },
    }),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "86",
      bestRating: "5",
      worstRating: "1",
    },
    itinerary: { "@type": "ItemList", itemListElement: itinerary },
    touristType,
    duration: sanitizeForJsonLd(data.duration),
    url: resolveUrl(data.url),
  };
}

export function generateTourJsonLd(data: TourStructuredData): Record<string, unknown> {
  return buildTripJsonLd(
    data,
    [
      { "@type": "TouristDestination", name: data.location.start },
      { "@type": "TouristDestination", name: data.location.end },
    ],
    ["Adventure", "Cultural", "Nature"],
    {
      logo: `${BASE_URL}/horse-head.svg`,
      legalName: agency.legalName ?? agency.name,
      license: agency.licenseNumber,
      identifier: agency.rc,
      taxID: agency.patente,
      priceRange: agency.priceRange ?? "€€",
      address: {
        "@type": "PostalAddress",
        streetAddress: agency.address.streetAddress,
        addressLocality: agency.address.addressLocality,
        addressRegion: agency.address.addressRegion,
        postalCode: agency.address.postalCode,
        addressCountry: agency.address.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: agency.geo.latitude,
        longitude: agency.geo.longitude,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+212-661-173-144",
        contactType: "Customer Service",
        availableLanguage: ["English", "French", "Spanish", "German"],
      },
    },
  );
}

export function generateFaqJsonLd(
  faqs: { question: string; answer: string }[],
): Record<string, unknown> {
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

export function generateExcursionJsonLd(data: ExcursionStructuredData): Record<string, unknown> {
  return buildTripJsonLd(
    data,
    [{ "@type": "TouristDestination", name: data.location.point }],
    ["Day Trip", "Cultural Experience"],
    {
      logo: `${BASE_URL}/horse-head.svg`,
      legalName: agency.legalName ?? agency.name,
      license: agency.licenseNumber,
      identifier: agency.rc,
      taxID: agency.patente,
      priceRange: agency.priceRange ?? "€€",
      address: {
        "@type": "PostalAddress",
        streetAddress: agency.address.streetAddress,
        addressLocality: agency.address.addressLocality,
        addressRegion: agency.address.addressRegion,
        postalCode: agency.address.postalCode,
        addressCountry: agency.address.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: agency.geo.latitude,
        longitude: agency.geo.longitude,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+212-661-173-144",
        contactType: "Customer Service",
        availableLanguage: ["English", "French", "Spanish", "German"],
      },
    },
  );
}

export function generateItemListJsonLd(data: {
  name: string;
  description: string;
  url: string;
  items: { name: string; description: string; url: string; image: string }[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: sanitizeForJsonLd(data.name),
    description: sanitizeForJsonLd(data.description),
    url: resolveUrl(data.url),
    numberOfItems: data.items.length,
    itemListElement: data.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: resolveUrl(item.url),
      name: sanitizeForJsonLd(item.name),
      item: {
        "@type": "TouristTrip",
        name: sanitizeForJsonLd(item.name),
        description: sanitizeForJsonLd(item.description),
        url: resolveUrl(item.url),
        image: resolveUrl(item.image),
        provider: { "@id": `${BASE_URL}/#organization` },
      },
    })),
  };
}

export function generateOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${BASE_URL}/#organization`,
    name: agency.name,
    alternateName: ["Amsirar", "AmsirarTrip", "amsirartrip", "Amsirar Tours", "Amsirar Morocco"],
    url: "https://amsirartrip.com",
    logo: "https://amsirartrip.com/horse-head.svg",
    image: "https://amsirartrip.com/images/hero/marrakech-medina.webp",
    description:
      "Amsirar Trip is a specialist Morocco travel agency offering authentic Sahara desert tours, imperial city excursions, Atlas Mountains treks, and cultural experiences. Book your Morocco adventure with local experts.",
    legalName: agency.legalName ?? agency.name,
    foundingDate: agency.foundingDate,
    telephone: "+212-661-173-144",
    email: agency.contact.emails[0] ?? "contact@amsirartrip.com",
    hasMap: `https://www.google.com/maps?q=${agency.geo.latitude},${agency.geo.longitude}`,
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: agency.employeeRange.min,
      maxValue: agency.employeeRange.max,
    },
    knowsAbout: [
      "Morocco Tourism",
      "Sahara Desert Tours",
      "Atlas Mountains Trekking",
      "Cultural Heritage",
      "Marrakech Day Excursions",
    ],
    areaServed: [
      { "@type": "Country", name: "Morocco" },
      { "@type": "City", name: "Marrakech" },
      { "@type": "City", name: "Fes" },
      { "@type": "City", name: "Casablanca" },
      { "@type": "City", name: "Tangier" },
      { "@type": "City", name: "Agadir" },
      { "@type": "City", name: "Essaouira" },
      { "@type": "Place", name: "Merzouga Sahara Desert" },
      { "@type": "Place", name: "Atlas Mountains" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: agency.address.streetAddress,
      addressLocality: agency.address.addressLocality,
      addressRegion: agency.address.addressRegion,
      postalCode: agency.address.postalCode,
      addressCountry: agency.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: agency.geo.latitude,
      longitude: agency.geo.longitude,
    },
    priceRange: agency.priceRange ?? "€€",
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Tourist Transport License",
      name: agency.licenseNumber ?? "Agrément Ministère du Tourisme N° 24/TT/RAK",
      recognizedBy: { "@type": "GovernmentOrganization", name: "Ministère du Tourisme du Maroc" },
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+212661173144",
      contactType: "Customer Service",
      areaServed: "MA",
      availableLanguage: ["English", "French", "Spanish", "German"],
    },
    sameAs: agency.socials,
    aggregateRating: {
      // Source: TripAdvisor listing — https://www.tripadvisor.com/Attraction_Review-g293734-d32584739-Reviews-Amsirar_Travel-Marrakech_Marrakech_Safi.html
      // Update ratingValue and reviewCount whenever the TripAdvisor listing changes.
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "250",
      bestRating: "5",
      worstRating: "1",
    },
    review: agency.reviews.map((rev) => ({
      "@type": "Review",
      author: { "@type": "Person", name: rev.author },
      datePublished: rev.datePublished,
      reviewBody: sanitizeForJsonLd(rev.body),
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(rev.rating),
        bestRating: "5",
        worstRating: "1",
      },
    })),
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: sanitizeForJsonLd(item.name),
      item: resolveUrl(item.url),
    })),
  };
}

export function generateWebsiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
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

export function generateVideoObjectJsonLd(data: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
  duration?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: sanitizeForJsonLd(data.name),
    description: sanitizeForJsonLd(data.description),
    thumbnailUrl: resolveUrl(data.thumbnailUrl),
    uploadDate: data.uploadDate,
    contentUrl: resolveUrl(data.contentUrl),
    embedUrl: BASE_URL,
    ...(data.duration && { duration: data.duration }),
    inLanguage: ["en", "fr", "de", "es"],
    publisher: { "@id": `${BASE_URL}/#organization` },
  };
}

export function generateContactPageJsonLd(data: {
  name: string;
  description: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: sanitizeForJsonLd(data.name),
    description: sanitizeForJsonLd(data.description),
    url: resolveUrl(data.url),
    mainEntity: { "@id": `${BASE_URL}/#organization` },
  };
}

export function generateAboutPageJsonLd(data: {
  name: string;
  description: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: sanitizeForJsonLd(data.name),
    description: sanitizeForJsonLd(data.description),
    url: resolveUrl(data.url),
    mainEntity: { "@id": `${BASE_URL}/#organization` },
  };
}

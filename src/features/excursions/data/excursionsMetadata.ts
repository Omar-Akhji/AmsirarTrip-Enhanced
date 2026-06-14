import type { BaseTripMetadata } from "@/lib/types";

type ExcursionSpecific = {
  excursionKey: string;
  i18nKeyPrefix: string;
  location: string;
  jsonLd: { name: string; description: string };
};

type ExcursionMetadata = BaseTripMetadata & ExcursionSpecific;

const EXCURSIONS_METADATA: Record<string, ExcursionMetadata> = {
  "ouzoud-waterfalls-day-trip": {
    slug: "ouzoud-waterfalls-day-trip",
    excursionKey: "excursion1",
    i18nKeyPrefix: "ouzoud",
    bookingId: 1,
    image: "/images/Excursions/Ouzoud_Waterfalls.webp",
    duration: "P1D",
    location: "Ouzoud, Morocco",
    keywords: [
      "Ouzoud Waterfalls",
      "Morocco waterfalls",
      "Ouzoud day trip",
      "Middle Atlas waterfalls",
      "Marrakech to Ouzoud",
      "Morocco nature tour",
      "Ouzoud macaques",
    ],
    jsonLd: {
      name: "Ouzoud Waterfalls Day Trip",
      description:
        "Journey to Morocco's tallest waterfalls, meet playful macaques, and cool off by the cascades.",
    },
  },
  "essaouira-coastal-escape": {
    slug: "essaouira-coastal-escape",
    excursionKey: "excursion2",
    i18nKeyPrefix: "essaouira",
    bookingId: 2,
    image: "/images/Excursions/Essaouira.webp",
    duration: "P1D",
    location: "Essaouira, Morocco",
    keywords: [
      "Essaouira day trip",
      "Essaouira from Marrakech",
      "Morocco coastal tour",
      "Essaouira medina",
      "Atlantic coast Morocco",
      "Essaouira beach",
      "Morocco port city",
    ],
    jsonLd: {
      name: "Essaouira Coastal Escape",
      description:
        "Stroll the fortified medina, watch blue fishing boats in the harbor, and enjoy ocean-fresh seafood.",
    },
  },
  "imlil-toubkal-adventure": {
    slug: "imlil-toubkal-adventure",
    excursionKey: "excursion3",
    i18nKeyPrefix: "imlil",
    bookingId: 3,
    image: "/images/Excursions/Imlil_Toubkal.webp",
    duration: "P1D",
    location: "Imlil, Morocco",
    keywords: [
      "Imlil day trip",
      "Toubkal base camp",
      "Atlas Mountains hike",
      "Berber village tour",
      "Marrakech mountain tour",
      "High Atlas excursion",
      "Morocco trekking",
    ],
    jsonLd: {
      name: "Imlil & Toubkal Adventure",
      description:
        "Hike through Berber villages in the High Atlas Mountains and reach the base camp of Mount Toubkal.",
    },
  },
  "ourika-valley-discovery": {
    slug: "ourika-valley-discovery",
    excursionKey: "excursion4",
    i18nKeyPrefix: "ourika",
    bookingId: 4,
    image: "/images/Excursions/Ourika_Valley.webp",
    duration: "P1D",
    location: "Ourika Valley, Morocco",
    keywords: [
      "Ourika Valley tour",
      "Ourika waterfalls",
      "Atlas day trip",
      "Marrakech valley tour",
      "Berber market Ourika",
      "Morocco nature excursion",
      "Setti Fatma waterfalls",
    ],
    jsonLd: {
      name: "Ourika Valley Discovery",
      description:
        "Discover the lush Ourika Valley, visit traditional Berber markets, and hike to stunning waterfalls.",
    },
  },
  "agafay-desert-sunset": {
    slug: "agafay-desert-sunset",
    excursionKey: "excursion5",
    i18nKeyPrefix: "agafay",
    bookingId: 5,
    image: "/images/Excursions/Agafay.webp",
    duration: "P1D",
    location: "Agafay Desert, Morocco",
    keywords: [
      "Agafay desert tour",
      "Desert near Marrakech",
      "Agafay sunset",
      "Camel ride Marrakech",
      "Quad biking Agafay",
      "Morocco desert experience",
      "Agafay glamping",
    ],
    jsonLd: {
      name: "Agafay Desert Sunset Experience",
      description:
        "Experience the magic of the Agafay Desert at sunset with camel rides and stunning views of the Atlas Mountains.",
    },
  },
  "sunrise-hot-air-balloon": {
    slug: "sunrise-hot-air-balloon",
    excursionKey: "excursion6",
    i18nKeyPrefix: "balloon",
    bookingId: 6,
    image: "/images/Excursions/Hot_Air_Balloon_Ride.webp",
    duration: "P1D",
    location: "Marrakech, Morocco",
    keywords: [
      "Hot air balloon Marrakech",
      "Sunrise balloon ride",
      "Marrakech from above",
      "Morocco balloon experience",
      "Atlas Mountains view",
      "Romantic Marrakech tour",
      "Aerial tour Morocco",
    ],
    jsonLd: {
      name: "Sunrise Hot Air Balloon Ride",
      description:
        "Soar above Marrakech at sunrise in a hot air balloon for breathtaking views of the Atlas Mountains and palm groves.",
    },
  },
};

const EXCURSIONS_MAP = new Map<string, ExcursionMetadata>(Object.entries(EXCURSIONS_METADATA));

export function getExcursionSlugs(): string[] {
  return Object.keys(EXCURSIONS_METADATA);
}
export function getExcursionBySlug(slug: string): ExcursionMetadata | undefined {
  return EXCURSIONS_MAP.get(slug);
}

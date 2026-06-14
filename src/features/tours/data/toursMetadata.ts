import type { BaseTripMetadata } from "@/lib/types";

type TourSpecific = {
  tourKey: string;
  durationDays: number;
  startLocation: string;
  endLocation: string;
  seo: TourSeoContent;
  jsonLd: { name: string; description: string; price?: number; currency?: string };
};

type TourMetadata = BaseTripMetadata & TourSpecific;

type TourSeoFaq = { question: string; answer: string };

export type TourSeoContent = {
  title: string;
  metaDescription: string;
  lead: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  price: { label: string; note: string };
  imageAlt: string;
  highlights: string[];
  faqs: TourSeoFaq[];
};

const customQuotePricing = {
  label: "Custom quote",
  note: "Final pricing depends on travel dates, group size, accommodation level, and private or shared transport. Send your dates for an exact quote.",
};

const TOURS_METADATA: Record<string, TourMetadata> = {
  "merzouga-desert-adventure-3-days": {
    slug: "merzouga-desert-adventure-3-days",
    tourKey: "tour1",
    bookingId: 1,
    image: "/images/Tours/Tour1.webp",
    duration: "P3D",
    durationDays: 3,
    startLocation: "Marrakech",
    endLocation: "Marrakech",
    keywords: [
      "Merzouga desert tour",
      "3 day Sahara tour",
      "Marrakech to Merzouga",
      "Ait Ben Haddou tour",
      "Dades Valley tour",
      "Camel trekking Morocco",
      "Desert camping Merzouga",
      "Sahara adventure tour",
      "Morocco desert experience",
      "Atlas Mountains tour",
      "Todra Gorge excursion",
      "Morocco desert safari",
    ],
    seo: {
      title: "3-Day Merzouga Desert Tour from Marrakech",
      metaDescription:
        "Book a 3-day Sahara desert tour from Marrakech to Merzouga with camel trek, Erg Chebbi camp, Ait Ben Haddou, Dades Valley, and Todra Gorge.",
      lead: "A focused 3-day Sahara desert tour from Marrakech with High Atlas scenery, kasbah stops, Erg Chebbi camel trekking, and an overnight Merzouga desert camp.",
      primaryKeyword: "3 day Sahara desert tour Morocco",
      secondaryKeywords: [
        "Merzouga camel trek",
        "Erg Chebbi camping",
        "Marrakech to Merzouga desert tour",
        "Sahara desert trip from Marrakech",
      ],
      price: {
        label: "From EUR 295 per person",
        note: "Price is based on standard accommodation and shared transport. Private departures, luxury camps, and peak dates are quoted on request.",
      },
      imageAlt:
        "Camel trek at sunset on the Erg Chebbi dunes during a Merzouga desert tour from Marrakech",
      highlights: [
        "Cross the High Atlas Mountains via Tizi n'Tichka Pass",
        "Visit Ait Ben Haddou, Ouarzazate, Dades Valley, and Todra Gorge",
        "Ride camels into the Erg Chebbi dunes at sunset",
        "Sleep in a Sahara desert camp with dinner and Berber music",
      ],
      faqs: [
        {
          question: "Is this 3-day Sahara desert tour from Marrakech private?",
          answer:
            "The route can be arranged as a private tour or a small-group departure depending on your dates, group size, and preferred comfort level.",
        },
        {
          question: "How far is Merzouga from Marrakech?",
          answer:
            "Merzouga is a long desert route from Marrakech, so the itinerary breaks the journey with scenic stops in the High Atlas, Ait Ben Haddou, Dades Valley, and Todra Gorge.",
        },
        {
          question: "Do I need experience to ride camels in Erg Chebbi?",
          answer:
            "No previous experience is needed. Local camel handlers guide the caravan, and the ride is paced for first-time travelers.",
        },
        {
          question: "What should I pack for the Merzouga desert camp?",
          answer:
            "Bring sunglasses, sunscreen, a hat, comfortable shoes, a small overnight bag, and warm layers because Sahara nights can be cold.",
        },
        {
          question: "Can I upgrade to a luxury desert camp?",
          answer:
            "Yes. Standard and luxury desert camp options can be quoted based on availability and your preferred travel dates.",
        },
      ],
    },
    jsonLd: {
      name: "3 Day Merzouga Desert Tour from Marrakech",
      description:
        "Experience the magic of the Sahara Desert on this 3-day adventure from Marrakech to Merzouga. Explore Ait Ben Haddou, ride camels across golden dunes, camp under starlit skies, and discover the beauty of Morocco's desert wilderness.",
      price: 295,
      currency: "EUR",
    },
  },
  "coast-and-cities-explorer-6-days": {
    slug: "coast-and-cities-explorer-6-days",
    tourKey: "tour2",
    bookingId: 2,
    image: "/images/Tours/Tour2.webp",
    duration: "P6D",
    durationDays: 6,
    startLocation: "Casablanca",
    endLocation: "Marrakech",
    keywords: [
      "Morocco 6 day tour",
      "Coast and cities tour",
      "Casablanca to Marrakech",
      "Morocco coastal tour",
      "Imperial cities tour",
      "Essaouira tour",
      "Fes Meknes tour",
      "Morocco explorer tour",
    ],
    seo: {
      title: "6-Day Morocco Tour from Casablanca",
      metaDescription:
        "Plan a 6-day Morocco tour from Casablanca to Chefchaouen, Fes, Merzouga desert, Dades Valley, Ait Ben Haddou, and Marrakech.",
      lead: "A complete 6-day Morocco tour from Casablanca combining imperial cities, Chefchaouen, Fes, Erg Chebbi camel trekking, and a Marrakech finish.",
      primaryKeyword: "6 day Morocco tour itinerary",
      secondaryKeywords: [
        "Casablanca to Marrakech tour",
        "Morocco tour with Chefchaouen and Sahara",
        "Fes and Merzouga desert tour",
        "Morocco highlights tour package",
      ],
      price: customQuotePricing,
      imageAlt:
        "Morocco tour route from Casablanca through Chefchaouen, Fes, Merzouga desert, and Marrakech",
      highlights: [
        "Start in Casablanca with Rabat and Chefchaouen on the first day",
        "Explore Fes with a local guide through the old medina",
        "Camel trek and overnight camp in the Erg Chebbi dunes",
        "Finish through Todra Gorge, Dades Valley, and Ait Ben Haddou",
      ],
      faqs: [
        {
          question: "What does this 6-day Morocco tour from Casablanca include?",
          answer:
            "The route covers Casablanca, Rabat, Chefchaouen, Fes, Merzouga, Dades Valley, Ait Ben Haddou, and Marrakech with transport, accommodation, selected meals, and guided experiences.",
        },
        {
          question: "Is the tour suitable for first-time visitors to Morocco?",
          answer:
            "Yes. It is designed for travelers who want a balanced first Morocco itinerary with cities, mountains, Sahara desert, and kasbah landscapes.",
        },
        {
          question: "Can the tour start at Casablanca airport?",
          answer:
            "Yes. Pickup can be arranged from Casablanca airport, your hotel, or another meeting point in the city.",
        },
        {
          question: "Does the itinerary include a Sahara desert camp?",
          answer:
            "Yes. The tour includes a camel trek into the Erg Chebbi dunes and an overnight stay in a Merzouga desert camp.",
        },
        {
          question: "Can this Casablanca to Marrakech tour be customized?",
          answer:
            "Yes. You can adjust hotel level, camp category, pace, extra nights, or private stops based on your travel style.",
        },
      ],
    },
    jsonLd: {
      name: "Coast and Cities Explorer - 6 Days",
      description:
        "Explore Morocco's stunning coastline and vibrant cities on this comprehensive 6-day journey from Casablanca to Marrakech.",
    },
  },
  "caravan-and-kasbah-experience-3-days": {
    slug: "caravan-and-kasbah-experience-3-days",
    tourKey: "tour3",
    bookingId: 3,
    image: "/images/Tours/Tour3.webp",
    duration: "P3D",
    durationDays: 3,
    startLocation: "Fes",
    endLocation: "Marrakech",
    keywords: [
      "Fes to Marrakech tour",
      "3 day desert tour",
      "Caravan experience Morocco",
      "Kasbah tour",
      "Merzouga from Fes",
      "Sahara desert tour",
      "Morocco 3 day adventure",
      "Atlas Mountains crossing",
    ],
    seo: {
      title: "3-Day Fes to Marrakech Desert Tour",
      metaDescription:
        "Take a 3-day Fes to Marrakech desert tour via Ifrane, Ziz Valley, Merzouga camel trek, Todra Gorge, Dades Valley, and Ait Ben Haddou.",
      lead: "A practical 3-day Fes to Marrakech desert tour that crosses the Middle Atlas, reaches the Erg Chebbi dunes, and continues through southern Morocco's kasbah valleys.",
      primaryKeyword: "Fes to Marrakech desert tour 3 days",
      secondaryKeywords: [
        "3 day desert tour from Fes",
        "Fes to Merzouga camel trek",
        "Merzouga to Marrakech tour",
        "Sahara desert tour from Fes",
      ],
      price: customQuotePricing,
      imageAlt: "Camel caravan in Erg Chebbi on a 3-day Fes to Marrakech desert tour",
      highlights: [
        "Travel from Fes through Ifrane, Azrou, Midelt, and Ziz Valley",
        "Ride camels into Erg Chebbi for sunset and desert camping",
        "Visit Todra Gorge, Dades Valley, Ouarzazate, and Ait Ben Haddou",
        "End in Marrakech after crossing the High Atlas Mountains",
      ],
      faqs: [
        {
          question: "Can this desert tour start in Fes and end in Marrakech?",
          answer:
            "Yes. This itinerary is designed as a point-to-point route from Fes to Marrakech with a Sahara desert night in Merzouga.",
        },
        {
          question: "How long are the driving days?",
          answer:
            "Driving times vary by day, with the longest stretches on the Fes to Merzouga and Dades to Marrakech routes. The itinerary includes scenic breaks and visits along the way.",
        },
        {
          question: "Is luggage safe during the camel trek?",
          answer:
            "Your main luggage stays secure with the vehicle or camp team. Bring a small overnight bag for the desert camp.",
        },
        {
          question: "What desert dunes does this tour visit?",
          answer:
            "The tour visits the Erg Chebbi dunes near Merzouga, one of Morocco's most popular Sahara camel trekking areas.",
        },
        {
          question: "Can I choose a luxury camp for the Merzouga night?",
          answer:
            "Yes. Standard and luxury camp upgrades can be arranged depending on availability and your budget.",
        },
      ],
    },
    jsonLd: {
      name: "Caravan and Kasbah Experience - 3 Days",
      description:
        "Journey from Fes to Marrakech through ancient kasbahs and golden dunes on this unforgettable 3-day caravan experience.",
    },
  },
  "imperial-cities-and-coastline-5-days": {
    slug: "imperial-cities-and-coastline-5-days",
    tourKey: "tour4",
    bookingId: 4,
    image: "/images/Tours/Tour4.webp",
    duration: "P5D",
    durationDays: 5,
    startLocation: "Casablanca",
    endLocation: "Fes",
    keywords: [
      "Morocco 5 day tour",
      "Imperial cities tour",
      "Casablanca Fes Marrakech",
      "Morocco cultural tour",
      "Rabat Meknes tour",
      "Morocco heritage tour",
      "Best Morocco tour",
      "Morocco coastline tour",
    ],
    seo: {
      title: "5-Day Imperial Cities Tour from Casablanca",
      metaDescription:
        "Explore a 5-day imperial cities tour from Casablanca to Rabat, Chefchaouen, Volubilis, Meknes, and Fes with private Morocco transport.",
      lead: "A culture-first 5-day imperial cities tour from Casablanca through Rabat, Chefchaouen, Roman Volubilis, Meknes, and Fes.",
      primaryKeyword: "5 day Morocco imperial cities tour",
      secondaryKeywords: [
        "Casablanca to Fes tour",
        "Rabat Chefchaouen Fes itinerary",
        "Volubilis and Meknes tour",
        "Northern Morocco cultural tour",
      ],
      price: customQuotePricing,
      imageAlt:
        "Blue streets of Chefchaouen on a northern Morocco imperial cities tour from Casablanca",
      highlights: [
        "Begin in Casablanca with Hassan II Mosque and coastal city stops",
        "Visit Rabat, the capital of Morocco",
        "Spend time in Chefchaouen, the Blue Pearl of the Rif Mountains",
        "Explore Volubilis, Meknes, and Fes with cultural depth",
      ],
      faqs: [
        {
          question: "Is this 5-day Morocco tour focused on culture?",
          answer:
            "Yes. The itinerary focuses on northern Morocco, imperial cities, medinas, Roman heritage, and guided cultural visits.",
        },
        {
          question: "Does this tour include the Sahara desert?",
          answer:
            "No. This route is designed for Casablanca, Rabat, Chefchaouen, Meknes, Volubilis, and Fes. A Sahara extension can be added on request.",
        },
        {
          question: "Can the tour end in Fes or Casablanca?",
          answer:
            "Yes. The itinerary can end in Fes or return to Casablanca depending on your flight plans and preferred route.",
        },
        {
          question: "Is Chefchaouen included overnight?",
          answer:
            "Yes. The route includes time in Chefchaouen so you can enjoy the blue medina outside the busiest day-trip hours.",
        },
        {
          question: "Can hotels be upgraded?",
          answer:
            "Yes. Riads and hotels can be arranged in standard, comfort, or luxury categories based on your budget.",
        },
      ],
    },
    jsonLd: {
      name: "Imperial Cities and Coastline - 5 Days",
      description:
        "Discover northern Morocco on this 5-day route from Casablanca to Fes via Rabat, Chefchaouen, Volubilis, and Meknes.",
    },
  },
  "grand-moroccan-circuit-10-days": {
    slug: "grand-moroccan-circuit-10-days",
    tourKey: "tour5",
    bookingId: 5,
    image: "/images/Tours/Tour5.webp",
    duration: "P10D",
    durationDays: 10,
    startLocation: "Marrakech",
    endLocation: "Casablanca",
    keywords: [
      "Morocco 10 day tour",
      "Grand Morocco tour",
      "Complete Morocco tour",
      "Sahara Atlas tour",
      "Morocco epic adventure",
      "Imperial cities Sahara",
      "Morocco comprehensive tour",
      "Best Morocco tour",
    ],
    seo: {
      title: "10-Day Morocco Tour from Marrakech",
      metaDescription:
        "Book a 10-day Morocco tour from Marrakech with Sahara desert camping, Fes, Chefchaouen, Rabat, Casablanca, Atlas Mountains, and kasbahs.",
      lead: "A broad 10-day Morocco tour from Marrakech built for travelers who want desert, imperial cities, Chefchaouen, Atlas scenery, and Atlantic coast highlights in one circuit.",
      primaryKeyword: "10 day Morocco tour",
      secondaryKeywords: [
        "Morocco highlights tour package",
        "Marrakech Sahara Fes Chefchaouen tour",
        "Morocco grand circuit itinerary",
        "Imperial cities and Sahara tour",
      ],
      price: customQuotePricing,
      imageAlt:
        "Grand Morocco circuit route with Sahara dunes, imperial cities, Atlas Mountains, and Chefchaouen",
      highlights: [
        "Start in Marrakech with a guided city experience",
        "Camp in the Sahara after crossing the High Atlas and kasbah route",
        "Visit Fes, Meknes, Volubilis, Chefchaouen, Rabat, and Casablanca",
        "Combine desert, mountains, medinas, and Atlantic coast in one trip",
      ],
      faqs: [
        {
          question: "What is included in this 10-day Morocco tour?",
          answer:
            "The circuit includes private transport, accommodation, selected meals, camel trekking, desert camp, guided visits in key cities, and airport transfers as described in the itinerary.",
        },
        {
          question: "Is 10 days enough for Morocco?",
          answer:
            "Ten days is a strong length for a first Morocco trip because it allows time for Marrakech, the Sahara, Fes, Chefchaouen, Rabat, and Casablanca without making every day a rush.",
        },
        {
          question: "Can the circuit start and end in different cities?",
          answer:
            "Yes. The itinerary can be adjusted for Marrakech, Casablanca, Fes, or Tangier arrivals depending on your flights.",
        },
        {
          question: "Does the tour include local guides?",
          answer:
            "Local guides are included for selected city visits such as Marrakech and Fes, with additional guides available on request.",
        },
        {
          question: "Can this Morocco itinerary be made more relaxed?",
          answer:
            "Yes. Extra nights can be added in the desert, Fes, Chefchaouen, Marrakech, or Essaouira to slow the pace.",
        },
      ],
    },
    jsonLd: {
      name: "Grand Moroccan Circuit - 10 Days",
      description:
        "Traverse Sahara dunes, imperial cities, Atlas peaks, and coastal elegance in an epic 10-day adventure across Morocco!",
    },
  },
  "atlas-and-desert-escape-4-days": {
    slug: "atlas-and-desert-escape-4-days",
    tourKey: "tour6",
    bookingId: 6,
    image: "/images/Tours/Tour6.webp",
    duration: "P4D",
    durationDays: 4,
    startLocation: "Marrakech",
    endLocation: "Marrakech",
    keywords: [
      "Morocco 4 day tour",
      "Atlas Mountains tour",
      "Desert escape Morocco",
      "Marrakech desert tour",
      "Ouarzazate tour",
      "Dades Valley tour",
      "Sahara 4 days",
      "Morocco adventure tour",
    ],
    seo: {
      title: "4-Day Marrakech to Merzouga Desert Tour",
      metaDescription:
        "Join a 4-day Marrakech to Merzouga desert tour with Ait Ben Haddou, Dades Valley, Todra Gorge, Erg Chebbi camel trek, and Ouarzazate.",
      lead: "A slower 4-day Marrakech to Merzouga desert tour with more breathing room across the Atlas Mountains, Erg Chebbi dunes, Dades Valley, and Ouarzazate.",
      primaryKeyword: "4 day Marrakech to Merzouga desert tour",
      secondaryKeywords: [
        "Marrakech desert tour 4 days",
        "Atlas Mountains and Sahara tour",
        "Ouarzazate Dades Merzouga itinerary",
        "Erg Chebbi camel trekking tour",
      ],
      price: customQuotePricing,
      imageAlt: "Erg Chebbi dunes at sunrise on a 4-day Marrakech to Merzouga desert tour",
      highlights: [
        "Cross the High Atlas and visit Ait Ben Haddou",
        "Spend one night in Dades Valley and one night in a Merzouga camp",
        "Ride camels across the Erg Chebbi dunes",
        "Return through Draa Valley and Ouarzazate at a smoother pace",
      ],
      faqs: [
        {
          question: "Why choose a 4-day desert tour instead of 3 days?",
          answer:
            "Four days gives the route more balance, with shorter return pacing and more time around Ouarzazate, Dades Valley, and the Sahara.",
        },
        {
          question: "Does this tour include Erg Chebbi?",
          answer:
            "Yes. The route reaches Merzouga and includes camel trekking in the Erg Chebbi dunes.",
        },
        {
          question: "Can this trip start or end in Fes?",
          answer:
            "Yes. The route can be adjusted to start or end in Fes depending on your broader Morocco itinerary.",
        },
        {
          question: "Are dinners and breakfasts included?",
          answer:
            "Breakfasts and dinners are included as listed in the itinerary, while lunches and drinks are usually paid separately.",
        },
        {
          question: "Is the tour available year-round?",
          answer:
            "Yes. The desert route runs year-round, although winter nights are colder and summer midday heat requires a slower rhythm.",
        },
      ],
    },
    jsonLd: {
      name: "Atlas and Desert Escape - 4 Days",
      description:
        "Escape to the Atlas Mountains and Sahara Desert on this perfectly balanced 4-day adventure from Marrakech.",
    },
  },
  "coastal-and-desert-odyssey-4-days": {
    slug: "coastal-and-desert-odyssey-4-days",
    tourKey: "tour7",
    bookingId: 7,
    image: "/images/Tours/Tour7.webp",
    duration: "P4D",
    durationDays: 4,
    startLocation: "Agadir",
    endLocation: "Marrakech",
    keywords: [
      "Morocco 4 day tour",
      "Coastal desert tour",
      "Agadir to Marrakech",
      "Morocco odyssey",
      "Desert coast tour",
      "Agadir tour",
      "Anti-Atlas Morocco",
      "Morocco beach desert tour",
    ],
    seo: {
      title: "4-Day Agadir to Marrakech Desert Tour",
      metaDescription:
        "Travel from Agadir to Marrakech on a 4-day desert tour via Taroudant, Dades Valley, Merzouga camel trek, Erg Chebbi, and Ouarzazate.",
      lead: "A 4-day Agadir to Marrakech desert tour for travelers who want to connect Morocco's Atlantic coast, Anti-Atlas landscapes, Sahara dunes, and the Red City.",
      primaryKeyword: "Agadir to Marrakech desert tour",
      secondaryKeywords: [
        "4 day Morocco tour from Agadir",
        "Agadir to Merzouga tour",
        "Coastal and desert Morocco tour",
        "Anti-Atlas desert itinerary",
      ],
      price: customQuotePricing,
      imageAlt:
        "Agadir to Marrakech desert tour route through Anti-Atlas valleys and Merzouga dunes",
      highlights: [
        "Depart from Agadir and travel through Taroudant",
        "Cross Anti-Atlas scenery toward Ouarzazate and Dades Valley",
        "Camel trek and overnight camp in Merzouga",
        "Finish in Marrakech after the High Atlas crossing",
      ],
      faqs: [
        {
          question: "Can I start this Morocco desert tour in Agadir?",
          answer:
            "Yes. This route is built for travelers starting in Agadir and ending in Marrakech after visiting the desert.",
        },
        {
          question: "Does the tour visit Merzouga?",
          answer:
            "Yes. The itinerary reaches Merzouga for a camel trek, sunset, desert camp, and Sahara sunrise.",
        },
        {
          question: "Is this tour good after a beach stay in Agadir?",
          answer:
            "Yes. It is a practical way to turn an Agadir beach stay into a desert and Marrakech itinerary without backtracking.",
        },
        {
          question: "What should I bring for the desert night?",
          answer:
            "Pack warm layers, sunglasses, sunscreen, a hat, comfortable shoes, and a small bag for the camp night.",
        },
        {
          question: "Can the itinerary be extended?",
          answer:
            "Yes. Extra nights can be added in Merzouga, Dades Valley, Ouarzazate, or Marrakech.",
        },
      ],
    },
    jsonLd: {
      name: "Coastal and Desert Odyssey - 4 Days",
      description:
        "Experience the best of Morocco's coast and desert on this 4-day odyssey from Agadir to Marrakech via the Anti-Atlas Mountains and Sahara Desert.",
    },
  },
  "chegaga-wilderness-expedition-3-days": {
    slug: "chegaga-wilderness-expedition-3-days",
    tourKey: "tour8",
    bookingId: 8,
    image: "/images/Tours/Tour8.webp",
    duration: "P3D",
    durationDays: 3,
    startLocation: "Marrakech",
    endLocation: "Marrakech",
    keywords: [
      "Chegaga desert tour",
      "3 day wilderness tour",
      "Morocco expedition",
      "Chegaga dunes",
      "Remote desert Morocco",
      "Off-road Morocco tour",
      "Zagora tour",
      "Draa Valley tour",
    ],
    seo: {
      title: "3-Day Chegaga Desert Tour from Marrakech",
      metaDescription:
        "Book a 3-day Chegaga desert tour from Marrakech to Ait Ben Haddou, Draa Valley, M'Hamid, remote Sahara dunes, camel trek, and camp.",
      lead: "A remote 3-day Chegaga desert tour from Marrakech for travelers who want wilder Sahara dunes, the Draa Valley, M'Hamid, and a less crowded camp experience.",
      primaryKeyword: "Chegaga dunes tour",
      secondaryKeywords: [
        "3 day Chegaga desert tour",
        "remote Sahara expedition Morocco",
        "Marrakech to Chegaga tour",
        "M'Hamid desert camp tour",
      ],
      price: customQuotePricing,
      imageAlt: "Remote Chegaga desert dunes at sunset on a Sahara tour from Marrakech",
      highlights: [
        "Cross the High Atlas and visit Ait Ben Haddou",
        "Follow the Draa Valley toward Zagora and M'Hamid",
        "Ride camels into the remote Chegaga dunes",
        "Sleep in an authentic Sahara camp away from busier desert routes",
      ],
      faqs: [
        {
          question: "Is Chegaga more remote than Merzouga?",
          answer:
            "Yes. Chegaga is generally more remote and less developed, making it a strong choice for travelers who want a wilder desert feel.",
        },
        {
          question: "Can this Chegaga tour be done in 3 days?",
          answer:
            "Yes. Three days is possible from Marrakech, although the driving days are long because Chegaga sits deeper in the desert.",
        },
        {
          question: "Does the tour include M'Hamid?",
          answer:
            "Yes. The route passes through M'Hamid, the last village before the open desert tracks toward Chegaga.",
        },
        {
          question: "What is different about a Chegaga camp?",
          answer:
            "Chegaga camps usually feel more secluded, with darker skies, fewer crowds, and a stronger wilderness atmosphere.",
        },
        {
          question: "Can I add an extra night in the desert?",
          answer:
            "Yes. Adding an extra night is recommended if you want more time for desert walks, photography, or a slower return to Marrakech.",
        },
      ],
    },
    jsonLd: {
      name: "Chegaga Wilderness Expedition - 3 Days",
      description:
        "Venture into the remote Chegaga dunes on this 3-day wilderness expedition for an authentic Sahara experience.",
    },
  },
  "northern-heritage-trail-7-days": {
    slug: "northern-heritage-trail-7-days",
    tourKey: "tour9",
    bookingId: 9,
    image: "/images/Tours/Tour9.webp",
    duration: "P7D",
    durationDays: 7,
    startLocation: "Tangier",
    endLocation: "Marrakech",
    keywords: [
      "Morocco 7 day tour",
      "Northern Morocco tour",
      "Tangier to Marrakech",
      "Chefchaouen tour",
      "Rif Mountains tour",
      "Morocco heritage trail",
      "Fes Tangier tour",
      "Blue city Morocco tour",
    ],
    seo: {
      title: "7-Day Northern Morocco Tour from Tangier",
      metaDescription:
        "Explore a 7-day northern Morocco tour from Tangier to Chefchaouen, Fes, Meknes, Volubilis, Middle Atlas, and Marrakech.",
      lead: "A 7-day northern Morocco tour from Tangier that connects Mediterranean coast, Chefchaouen, Fes, Roman ruins, Middle Atlas scenery, and Marrakech.",
      primaryKeyword: "7 day northern Morocco tour",
      secondaryKeywords: [
        "Tangier Chefchaouen Fes tour",
        "Tangier to Marrakech tour",
        "Northern Morocco itinerary",
        "Chefchaouen and Fes tour package",
      ],
      price: customQuotePricing,
      imageAlt: "Chefchaouen blue medina street on a 7-day northern Morocco tour from Tangier",
      highlights: [
        "Start in Tangier with coast, caves, kasbah, and medina highlights",
        "Spend time in Chefchaouen, the Blue Pearl of Morocco",
        "Explore Fes, Meknes, and Volubilis with cultural stops",
        "Cross the Middle Atlas and finish in Marrakech",
      ],
      faqs: [
        {
          question: "Can this northern Morocco tour start in Tangier?",
          answer:
            "Yes. Pickup can be arranged from Tangier airport, ferry port, hotel, or another agreed meeting point.",
        },
        {
          question: "Does the route include Chefchaouen?",
          answer:
            "Yes. Chefchaouen is a core stop on this itinerary, with time to explore the blue medina and viewpoints.",
        },
        {
          question: "Is this tour a good alternative to a Sahara trip?",
          answer:
            "Yes. It is better for travelers focused on northern cities, culture, Roman heritage, and mountain scenery rather than desert camping.",
        },
        {
          question: "Can I add a Sahara desert extension?",
          answer:
            "Yes. The tour can be extended from Fes or Marrakech to include Merzouga or Chegaga desert routes.",
        },
        {
          question: "What pace should I expect on this 7-day route?",
          answer:
            "The itinerary mixes guided city time with transfer days. Comfortable walking shoes are recommended for medinas and hillside streets.",
        },
      ],
    },
    jsonLd: {
      name: "Northern Heritage Trail - 7 Days",
      description:
        "Explore Morocco's northern heritage from Tangier to Marrakech on this 7-day journey through the Rif Mountains and blue city of Chefchaouen.",
    },
  },
};

const TOURS_MAP = new Map<string, TourMetadata>(Object.entries(TOURS_METADATA));

export function getTourSlugs(): string[] {
  return Object.keys(TOURS_METADATA);
}

export function getTourBySlug(slug: string): TourMetadata | undefined {
  return TOURS_MAP.get(slug);
}

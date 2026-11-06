import type { RouteMapData, RouteWaypoint } from "../types";

export const MOROCCO_COORDINATES: Record<string, [number, number]> = {
  marrakech: [31.6295, -7.9811],
  casablanca: [33.5731, -7.5898],
  rabat: [34.0209, -6.8416],
  tangier: [35.7595, -5.834],
  tetouan: [35.5889, -5.3626],
  chefchaouen: [35.1688, -5.2684],
  volubilis: [34.0722, -5.5544],
  meknes: [33.8938, -5.5547],
  fes: [34.0331, -5.0003],
  ifrane: [33.5228, -5.11],
  azrou: [33.4344, -5.2213],
  benimellal: [32.3394, -6.3608],
  midelt: [32.6806, -4.7333],
  errachidia: [31.9319, -4.4244],
  erfoud: [31.4358, -4.2325],
  rissani: [31.2847, -4.2703],
  merzouga: [31.0991, -4.0118],
  alnif: [31.1167, -5.1667],
  todra: [31.5511, -5.5982],
  dades: [31.3719, -5.9869],
  rosesvalley: [31.2436, -6.1286],
  ouarzazate: [30.9335, -6.937],
  aitbenhaddou: [31.047, -7.1318],
  tichka: [31.2867, -7.3811],
  zagora: [30.3324, -5.8383],
  mhamid: [29.8272, -5.7267],
  chegaga: [29.83, -6.255],
  foumzguid: [30.0789, -6.8731],
  taznakht: [30.5786, -7.2033],
  taroudant: [30.4703, -8.877],
  agadir: [30.4278, -9.5981],
  essaouira: [31.5085, -9.7595],
  chichaoua: [31.5433, -8.7611],
  agafay: [31.4333, -8.1833],
  lallatakerkoust: [31.3622, -8.1256],
  asni: [31.2464, -7.9861],
  imlil: [31.136, -7.9184],
  aroumd: [31.1219, -7.9189],
  ourika: [31.3347, -7.76],
  settifatma: [31.2267, -7.6747],
  ouzoud: [32.0156, -6.7189],
  palmeraie: [31.67, -7.95],
};

interface TourRouteConfig {
  distance: string;
  waypoints: {
    key: string;
    name: string;
    dayOrTime: string;
    description: string;
    type: "start" | "waypoint" | "highlight" | "end";
  }[];
}

const TOURS_CONFIG: Record<string, TourRouteConfig> = {
  tour1: {
    distance: "~1,050 km round-trip",
    waypoints: [
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 1",
        description: "Departure via Tizi n'Tichka Pass (2,260 m)",
        type: "start",
      },
      {
        key: "aitbenhaddou",
        name: "Ait Ben Haddou",
        dayOrTime: "Day 1",
        description: "UNESCO World Heritage Ksar",
        type: "highlight",
      },
      {
        key: "ouarzazate",
        name: "Ouarzazate",
        dayOrTime: "Day 1",
        description: "Gateway to the Sahara & Atlas Film Studios",
        type: "waypoint",
      },
      {
        key: "dades",
        name: "Dades Valley",
        dayOrTime: "Day 1",
        description: "Scenic canyon gorges & overnight in traditional riad",
        type: "waypoint",
      },
      {
        key: "todra",
        name: "Todra Gorges",
        dayOrTime: "Day 2",
        description: "300 m sheer limestone canyon walk",
        type: "highlight",
      },
      {
        key: "erfoud",
        name: "Erfoud",
        dayOrTime: "Day 2",
        description: "Oasis town & fossil workshops",
        type: "waypoint",
      },
      {
        key: "merzouga",
        name: "Merzouga (Erg Chebbi)",
        dayOrTime: "Day 2",
        description: "Sunset camel trek & luxury desert camp",
        type: "highlight",
      },
      {
        key: "rissani",
        name: "Rissani",
        dayOrTime: "Day 3",
        description: "Ancient caravan capital & spice souk",
        type: "waypoint",
      },
      {
        key: "alnif",
        name: "Alnif",
        dayOrTime: "Day 3",
        description: "Scenic pre-Saharan plains drive",
        type: "waypoint",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 3",
        description: "Evening return to your hotel or riad",
        type: "end",
      },
    ],
  },
  tour2: {
    distance: "~1,650 km",
    waypoints: [
      {
        key: "casablanca",
        name: "Casablanca",
        dayOrTime: "Day 1",
        description: "Departure past Hassan II Mosque",
        type: "start",
      },
      {
        key: "rabat",
        name: "Rabat",
        dayOrTime: "Day 1",
        description: "Capital landmarks & Kasbah of the Udayas",
        type: "waypoint",
      },
      {
        key: "chefchaouen",
        name: "Chefchaouen",
        dayOrTime: "Day 1-2",
        description: "The iconic Blue Pearl in the Rif Mountains",
        type: "highlight",
      },
      {
        key: "volubilis",
        name: "Volubilis",
        dayOrTime: "Day 2",
        description: "Ancient Roman ruins & mosaic floors",
        type: "highlight",
      },
      {
        key: "fes",
        name: "Fes",
        dayOrTime: "Day 2-3",
        description: "World's largest car-free medieval medina",
        type: "highlight",
      },
      {
        key: "midelt",
        name: "Midelt",
        dayOrTime: "Day 4",
        description: "Middle Atlas crossing & apple capital",
        type: "waypoint",
      },
      {
        key: "merzouga",
        name: "Merzouga Desert",
        dayOrTime: "Day 4-5",
        description: "Erg Chebbi dunes & Berber camp",
        type: "highlight",
      },
      {
        key: "todra",
        name: "Todra Gorges",
        dayOrTime: "Day 5",
        description: "Dramatic canyon limestone walk",
        type: "waypoint",
      },
      {
        key: "dades",
        name: "Dades Valley",
        dayOrTime: "Day 5",
        description: "Valley of a Thousand Kasbahs",
        type: "waypoint",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 6",
        description: "End of expedition in the Red City",
        type: "end",
      },
    ],
  },
  tour3: {
    distance: "~1,000 km",
    waypoints: [
      {
        key: "fes",
        name: "Fes",
        dayOrTime: "Day 1",
        description: "Morning departure southward",
        type: "start",
      },
      {
        key: "ifrane",
        name: "Ifrane & Cedar Forest",
        dayOrTime: "Day 1",
        description: "Moroccan Switzerland & Barbary macaques",
        type: "waypoint",
      },
      {
        key: "midelt",
        name: "Midelt",
        dayOrTime: "Day 1",
        description: "High plateau lunch stop",
        type: "waypoint",
      },
      {
        key: "merzouga",
        name: "Merzouga (Erg Chebbi)",
        dayOrTime: "Day 1-2",
        description: "Sunset camel ride & night under Saharan stars",
        type: "highlight",
      },
      {
        key: "todra",
        name: "Todra Gorges",
        dayOrTime: "Day 2",
        description: "Towering red cliff canyon",
        type: "waypoint",
      },
      {
        key: "dades",
        name: "Dades Valley",
        dayOrTime: "Day 2",
        description: "Gorge switchbacks & kasbah riad",
        type: "waypoint",
      },
      {
        key: "rosesvalley",
        name: "Roses Valley",
        dayOrTime: "Day 3",
        description: "Kelaat M'Gouna rose distillation",
        type: "waypoint",
      },
      {
        key: "aitbenhaddou",
        name: "Ait Ben Haddou",
        dayOrTime: "Day 3",
        description: "Fortified clay village & film backdrop",
        type: "highlight",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 3",
        description: "Tizi n'Tichka pass crossing into Marrakech",
        type: "end",
      },
    ],
  },
  tour4: {
    distance: "~780 km",
    waypoints: [
      {
        key: "casablanca",
        name: "Casablanca",
        dayOrTime: "Day 1",
        description: "Arrival & Hassan II Mosque coastal view",
        type: "start",
      },
      {
        key: "rabat",
        name: "Rabat",
        dayOrTime: "Day 2",
        description: "Hassan Tower & royal necropolis",
        type: "waypoint",
      },
      {
        key: "chefchaouen",
        name: "Chefchaouen",
        dayOrTime: "Day 2-3",
        description: "Cobblestone alleys of the blue city",
        type: "highlight",
      },
      {
        key: "volubilis",
        name: "Volubilis",
        dayOrTime: "Day 3",
        description: "Roman archaeological site",
        type: "waypoint",
      },
      {
        key: "meknes",
        name: "Meknes",
        dayOrTime: "Day 3",
        description: "Bab El Mansour & imperial granaries",
        type: "waypoint",
      },
      {
        key: "fes",
        name: "Fes",
        dayOrTime: "Day 3-5",
        description: "Spiritual capital & Al-Qarawiyyin university",
        type: "end",
      },
    ],
  },
  tour5: {
    distance: "~2,400 km grand loop",
    waypoints: [
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 1-3",
        description: "Historic city exploration & departure",
        type: "start",
      },
      {
        key: "aitbenhaddou",
        name: "Ait Ben Haddou",
        dayOrTime: "Day 3",
        description: "Iconic fortified ksar",
        type: "waypoint",
      },
      {
        key: "dades",
        name: "Dades Valley",
        dayOrTime: "Day 3",
        description: "Rugged canyon landscape",
        type: "waypoint",
      },
      {
        key: "merzouga",
        name: "Merzouga",
        dayOrTime: "Day 4",
        description: "Erg Chebbi dunes & desert camp",
        type: "highlight",
      },
      {
        key: "midelt",
        name: "Midelt",
        dayOrTime: "Day 5",
        description: "Ziz Valley palm groves & mountain pass",
        type: "waypoint",
      },
      {
        key: "fes",
        name: "Fes",
        dayOrTime: "Day 5-7",
        description: "Full guided tour of medieval medina",
        type: "highlight",
      },
      {
        key: "volubilis",
        name: "Volubilis & Meknes",
        dayOrTime: "Day 7",
        description: "Imperial gates & roman mosaics",
        type: "waypoint",
      },
      {
        key: "chefchaouen",
        name: "Chefchaouen",
        dayOrTime: "Day 7-9",
        description: "Blue-washed streets in the Rif",
        type: "highlight",
      },
      {
        key: "rabat",
        name: "Rabat",
        dayOrTime: "Day 9",
        description: "Atlantic coast capital monuments",
        type: "waypoint",
      },
      {
        key: "casablanca",
        name: "Casablanca",
        dayOrTime: "Day 10",
        description: "Economic metropolis & tour conclusion",
        type: "end",
      },
    ],
  },
  tour6: {
    distance: "~1,120 km",
    waypoints: [
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 1",
        description: "High Atlas crossing via Tizi n'Tichka",
        type: "start",
      },
      {
        key: "aitbenhaddou",
        name: "Ait Ben Haddou",
        dayOrTime: "Day 1",
        description: "Guided tour of UNESCO kasbah",
        type: "waypoint",
      },
      {
        key: "dades",
        name: "Dades Valley",
        dayOrTime: "Day 1",
        description: "Valley of 1000 Kasbahs & gorge hotel",
        type: "waypoint",
      },
      {
        key: "todra",
        name: "Todra Gorges",
        dayOrTime: "Day 2",
        description: "Morning canyon walk",
        type: "waypoint",
      },
      {
        key: "merzouga",
        name: "Merzouga (Erg Chebbi)",
        dayOrTime: "Day 2",
        description: "Sunset camel trek & luxury bivouac",
        type: "highlight",
      },
      {
        key: "alnif",
        name: "Alnif & Draa Valley",
        dayOrTime: "Day 3",
        description: "Acacia plains & endless date palm oases",
        type: "waypoint",
      },
      {
        key: "ouarzazate",
        name: "Ouarzazate",
        dayOrTime: "Day 3",
        description: "Kasbah Taourirt & cinema museum",
        type: "waypoint",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 4",
        description: "Scenic return drive over the Atlas range",
        type: "end",
      },
    ],
  },
  tour7: {
    distance: "~1,250 km",
    waypoints: [
      {
        key: "agadir",
        name: "Agadir",
        dayOrTime: "Day 1",
        description: "Atlantic coast departure eastward",
        type: "start",
      },
      {
        key: "taroudant",
        name: "Taroudant",
        dayOrTime: "Day 1",
        description: "Little Marrakech mud-brick ramparts",
        type: "waypoint",
      },
      {
        key: "taznakht",
        name: "Taznakht",
        dayOrTime: "Day 1",
        description: "Berber carpet weaving cooperatives",
        type: "waypoint",
      },
      {
        key: "ouarzazate",
        name: "Ouarzazate",
        dayOrTime: "Day 1",
        description: "Gateway to the eastern valleys",
        type: "waypoint",
      },
      {
        key: "dades",
        name: "Dades Valley",
        dayOrTime: "Day 1",
        description: "Overnight in the panoramic gorge",
        type: "waypoint",
      },
      {
        key: "todra",
        name: "Todra Gorges",
        dayOrTime: "Day 2",
        description: "Cliff walls walk",
        type: "waypoint",
      },
      {
        key: "merzouga",
        name: "Merzouga Desert",
        dayOrTime: "Day 2",
        description: "Erg Chebbi dune camel caravan",
        type: "highlight",
      },
      {
        key: "aitbenhaddou",
        name: "Ait Ben Haddou",
        dayOrTime: "Day 3",
        description: "UNESCO fortified village",
        type: "waypoint",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 4",
        description: "High Atlas descent into Marrakech",
        type: "end",
      },
    ],
  },
  tour8: {
    distance: "~950 km 4x4 expedition",
    waypoints: [
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 1",
        description: "Departure over Tizi n'Tichka pass",
        type: "start",
      },
      {
        key: "aitbenhaddou",
        name: "Ait Ben Haddou",
        dayOrTime: "Day 1",
        description: "Historical ksar exploration",
        type: "waypoint",
      },
      {
        key: "zagora",
        name: "Zagora",
        dayOrTime: "Day 1",
        description: "Historic 'Tombouctou 52 Jours' gateway",
        type: "waypoint",
      },
      {
        key: "mhamid",
        name: "M'Hamid El Ghizlane",
        dayOrTime: "Day 2",
        description: "End of the paved road into true Sahara",
        type: "waypoint",
      },
      {
        key: "chegaga",
        name: "Erg Chegaga",
        dayOrTime: "Day 2",
        description: "Wild 300 m sand dunes & off-road 4x4",
        type: "highlight",
      },
      {
        key: "foumzguid",
        name: "Lake Iriki & Foum Zguid",
        dayOrTime: "Day 3",
        description: "Paris-Dakar rally tracks & fossil beds",
        type: "waypoint",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 3",
        description: "Return via Taznakht & High Atlas",
        type: "end",
      },
    ],
  },
  tour9: {
    distance: "~1,400 km",
    waypoints: [
      {
        key: "tangier",
        name: "Tangier",
        dayOrTime: "Day 1",
        description: "Strait of Gibraltar & Medina of Tangier",
        type: "start",
      },
      {
        key: "tetouan",
        name: "Tetouan",
        dayOrTime: "Day 2",
        description: "Andalusian heritage medina",
        type: "waypoint",
      },
      {
        key: "chefchaouen",
        name: "Chefchaouen",
        dayOrTime: "Day 2-3",
        description: "The Blue Pearl of the Rif",
        type: "highlight",
      },
      {
        key: "volubilis",
        name: "Volubilis & Meknes",
        dayOrTime: "Day 3",
        description: "Ancient Roman ruins & imperial gates",
        type: "waypoint",
      },
      {
        key: "fes",
        name: "Fes",
        dayOrTime: "Day 3-4",
        description: "Full guided tour of spiritual capital",
        type: "highlight",
      },
      {
        key: "benimellal",
        name: "Beni Mellal & Middle Atlas",
        dayOrTime: "Day 5",
        description: "Cedar forests & Ain Asserdoun spring",
        type: "waypoint",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "Day 5-7",
        description: "Jemaa el-Fnaa, souks & departure",
        type: "end",
      },
    ],
  },
};

const EXCURSIONS_CONFIG: Record<string, TourRouteConfig> = {
  excursion1: {
    // Ouzoud Waterfalls
    distance: "~300 km round-trip",
    waypoints: [
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "08:00 AM",
        description: "Hotel or riad pickup in air-conditioned vehicle",
        type: "start",
      },
      {
        key: "ouzoud",
        name: "Ouzoud Waterfalls",
        dayOrTime: "10:45 AM",
        description: "110-meter cascades, wild monkeys & boat ride",
        type: "highlight",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "18:30 PM",
        description: "Return drop-off in Marrakech",
        type: "end",
      },
    ],
  },
  excursion2: {
    // Essaouira Coastal Escape
    distance: "~380 km round-trip",
    waypoints: [
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "07:30 AM",
        description: "Private transfer west toward the Atlantic",
        type: "start",
      },
      {
        key: "chichaoua",
        name: "Chichaoua Plains",
        dayOrTime: "09:00 AM",
        description: "Coffee break & Argan oil tree groves",
        type: "waypoint",
      },
      {
        key: "essaouira",
        name: "Essaouira (Mogador)",
        dayOrTime: "11:30 AM",
        description: "Historic ramparts, fishing port & fresh seafood",
        type: "highlight",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "19:00 PM",
        description: "Return transfer to your accommodation",
        type: "end",
      },
    ],
  },
  excursion3: {
    // Imlil & Toubkal Adventure
    distance: "~140 km round-trip",
    waypoints: [
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "08:00 AM",
        description: "Morning pickup towards High Atlas Mountains",
        type: "start",
      },
      {
        key: "asni",
        name: "Asni Valley",
        dayOrTime: "09:00 AM",
        description: "Moulay Brahim gorge & weekly Berber market",
        type: "waypoint",
      },
      {
        key: "imlil",
        name: "Imlil Village (1,740 m)",
        dayOrTime: "10:00 AM",
        description: "Base camp for Mount Toubkal (4,167 m)",
        type: "highlight",
      },
      {
        key: "aroumd",
        name: "Aroumd Hamlet",
        dayOrTime: "11:30 AM",
        description: "Scenic mountain hike & traditional Berber lunch",
        type: "highlight",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "17:00 PM",
        description: "Descent and return to Marrakech",
        type: "end",
      },
    ],
  },
  excursion4: {
    // Ourika Valley & Setti Fatma
    distance: "~130 km round-trip",
    waypoints: [
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "09:00 AM",
        description: "Departure along the Ourika river valley",
        type: "start",
      },
      {
        key: "ourika",
        name: "Ourika Valley",
        dayOrTime: "10:00 AM",
        description: "Argan cooperative & terraced Berber villages",
        type: "waypoint",
      },
      {
        key: "settifatma",
        name: "Setti Fatma Waterfalls",
        dayOrTime: "11:30 AM",
        description: "Guided hike up the 7 waterfalls & riverside lunch",
        type: "highlight",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "16:30 PM",
        description: "Relaxed afternoon return to Marrakech",
        type: "end",
      },
    ],
  },
  excursion5: {
    // Agafay Desert Sunset
    distance: "~80 km round-trip",
    waypoints: [
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "15:30 PM",
        description: "Afternoon hotel pickup in 4x4 or private van",
        type: "start",
      },
      {
        key: "lallatakerkoust",
        name: "Lalla Takerkoust Lake",
        dayOrTime: "16:15 PM",
        description: "Scenic reservoir view against Atlas backdrop",
        type: "waypoint",
      },
      {
        key: "agafay",
        name: "Agafay Desert Camp",
        dayOrTime: "17:00 PM",
        description: "Sunset camel ride, candlelit dinner & campfire music",
        type: "highlight",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "22:00 PM",
        description: "Comfortable night transfer back to Marrakech",
        type: "end",
      },
    ],
  },
  excursion6: {
    // Sunrise Hot Air Balloon
    distance: "~50 km flight zone",
    waypoints: [
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "05:00 AM",
        description: "Early morning pickup before dawn",
        type: "start",
      },
      {
        key: "palmeraie",
        name: "Palmeraie / Jbilet Launch Site",
        dayOrTime: "06:00 AM",
        description: "Pre-flight mint tea & balloon inflation",
        type: "waypoint",
      },
      {
        key: "palmeraie",
        name: "Sunrise Flight",
        dayOrTime: "06:45 AM",
        description: "1-hour flight over desert valleys with Atlas views",
        type: "highlight",
      },
      {
        key: "marrakech",
        name: "Marrakech",
        dayOrTime: "10:30 AM",
        description: "Berber breakfast in caidal tent & return",
        type: "end",
      },
    ],
  },
};

const MARRAKECH_DEFAULT: [number, number] = [31.6295, -7.9811];

function buildGoogleMapsUrls(waypoints: readonly RouteWaypoint[]): {
  embedUrl: string;
  appUrl: string;
} {
  const firstWp = waypoints.at(0);
  if (!firstWp) {
    return {
      embedUrl: "https://www.google.com/maps?q=Marrakech,Morocco&output=embed",
      appUrl: "https://www.google.com/maps",
    };
  }

  const originName = `${firstWp.name}, Morocco`;
  const saddr = encodeURIComponent(originName);

  if (waypoints.length === 1) {
    return {
      embedUrl: `https://www.google.com/maps?q=${saddr}&output=embed`,
      appUrl: `https://www.google.com/maps/search/?api=1&query=${saddr}`,
    };
  }

  const destinationWaypoints = waypoints.slice(1).map((w) => `${w.name}, Morocco`);
  const daddr = encodeURIComponent(destinationWaypoints.join(" to: "));
  const embedUrl = `https://www.google.com/maps?saddr=${saddr}&daddr=${daddr}&output=embed`;

  const appWaypointsPath = waypoints.map((w) => encodeURIComponent(`${w.name}, Morocco`)).join("/");
  const appUrl = `https://www.google.com/maps/dir/${appWaypointsPath}`;

  return { embedUrl, appUrl };
}

function buildRouteMap(
  normalizedKey: string,
  config: TourRouteConfig,
  title: string,
  cities: Pick<RouteMapData, "subtitle" | "startCity" | "endCity">,
  waypoints: RouteWaypoint[],
): RouteMapData {
  const { embedUrl, appUrl } = buildGoogleMapsUrls(waypoints);
  return {
    id: `map-${normalizedKey}`,
    title: `${title} - Route Map`,
    ...cities,
    distance: config.distance,
    waypoints,
    routeCoordinates: waypoints.map((w) => [w.lat, w.lng] as [number, number]),
    googleMapsEmbedUrl: embedUrl,
    googleMapsAppUrl: appUrl,
  };
}

const toWaypoints = (config: TourRouteConfig): RouteWaypoint[] =>
  config.waypoints.map(({ key, ...wp }) => {
    const [lat, lng] = MOROCCO_COORDINATES[key] ?? MARRAKECH_DEFAULT;
    return { ...wp, lat, lng };
  });

export function getTourRouteMap(
  tourKey: string,
  startLocation: string,
  endLocation: string,
  title: string,
): RouteMapData | undefined {
  const normalizedKey = tourKey.toLowerCase().trim();
  const config = TOURS_CONFIG[normalizedKey];
  if (!config) return undefined;

  const waypoints = toWaypoints(config);
  const isRoundtrip = startLocation.toLowerCase() === endLocation.toLowerCase();
  const mainHighlight = waypoints.find((w) => w.type === "highlight")?.name;
  const subtitle =
    !isRoundtrip ? `${startLocation} ? ${endLocation}`
    : mainHighlight ? `${startLocation} ? ${mainHighlight}`
    : `${startLocation} Expedition`;

  return buildRouteMap(
    normalizedKey,
    config,
    title,
    { subtitle, startCity: startLocation, endCity: endLocation },
    waypoints,
  );
}

export function getExcursionRouteMap(
  excursionKey: string,
  locationName: string,
  title: string,
): RouteMapData | undefined {
  const normalizedKey = excursionKey.toLowerCase().trim();
  const config = EXCURSIONS_CONFIG[normalizedKey];
  if (!config) return undefined;

  const waypoints = toWaypoints(config);
  return buildRouteMap(
    normalizedKey,
    config,
    title,
    { subtitle: locationName, startCity: "Marrakech", endCity: waypoints.at(-1)?.name ?? "Marrakech" },
    waypoints,
  );
}

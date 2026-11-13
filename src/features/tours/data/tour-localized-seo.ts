export interface TourSeoMeta {
  readonly title: string;
  readonly metaDescription: string;
}

export const TOUR_LOCALIZED_SEO: Record<string, Record<string, TourSeoMeta>> = {
  tour1: {
    fr: {
      title: "Circuit Désert Marrakech Merzouga 3 Jours | Erg Chebbi (2026)",
      metaDescription:
        "Dès 295€ par pers. Circuit 3 jours dans le désert de Marrakech à Merzouga (4x4 privé ou groupe). Balade en dromadaire à Erg Chebbi et nuit en bivouac de luxe.",
    },
    es: {
      title: "Tour al Desierto de Marrakech a Merzouga 3 Días | Erg Chebbi (2026)",
      metaDescription:
        "Desde 295€ por pers. Tour de 3 días al desierto de Marrakech a Merzouga (4x4 privado o grupo). Paseo en camello en Erg Chebbi y noche en campamento de lujo.",
    },
    de: {
      title: "3-Tage Wüstentour von Marrakesch nach Merzouga | Erg Chebbi (2026)",
      metaDescription:
        "Ab 295€ p.P. 3-tägige Wüstentour von Marrakesch nach Merzouga (privat im 4x4 oder Kleingruppe). Kamelritt in Erg Chebbi und Übernachtung im Wüstencamp.",
    },
  },
  tour2: {
    fr: {
      title: "Circuit Maroc 6 Jours depuis Casablanca | Chefchaouen, Fès & Désert (2026)",
      metaDescription:
        "Dès 590€ par pers. Circuit de 6 jours depuis Casablanca jusqu'à Marrakech. Chefchaouen, médina de Fès, dunes de Merzouga et gorges du Dadès.",
    },
    es: {
      title: "Tour por Marruecos 6 Días desde Casablanca | Chefchaouen, Fez y Desierto (2026)",
      metaDescription:
        "Desde 590€ por pers. Tour de 6 días por Marruecos desde Casablanca hasta Marrakech. Chefchaouen, medina de Fez, dunas de Merzouga y gargantas del Dades.",
    },
    de: {
      title: "6-Tage Marokko Rundreise ab Casablanca | Chefchaouen, Fès & Wüste (2026)",
      metaDescription:
        "Ab 590€ p.P. 6-tägige Marokko-Rundreise von Casablanca nach Marrakesch. Chefchaouen, Fès-Medina, Sahara-Dünen in Merzouga und Dades-Schlucht.",
    },
  },
  tour3: {
    fr: {
      title: "Circuit Désert de Fès à Marrakech 3 Jours | Erg Chebbi & Atlas (2026)",
      metaDescription:
        "Dès 310€ par pers. Circuit désert de 3 jours reliant Fès à Marrakech via les dunes de Merzouga. Bivouac sous les étoiles, gorges du Todra et Aït Ben Haddou.",
    },
    es: {
      title: "Tour al Desierto de Fez a Marrakech 3 Días | Erg Chebbi y Atlas (2026)",
      metaDescription:
        "Desde 310€ por pers. Tour de 3 días desde Fez a Marrakech pasando por el desierto de Merzouga. Campamento en el Sáhara, gargantas del Todra y Ait Ben Haddou.",
    },
    de: {
      title: "3-Tage Wüstentour von Fès nach Marrakesch | Erg Chebbi & Atlas (2026)",
      metaDescription:
        "Ab 310€ p.P. 3-Tage Wüstentrip von Fès nach Marrakesch über Merzouga. Kamelritt in Erg Chebbi, Todra-Schlucht und Kasbah Ait Ben Haddou.",
    },
  },
  tour4: {
    fr: {
      title: "Circuit Villes Impériales Maroc 5 Jours | Casablanca, Chefchaouen & Fès (2026)",
      metaDescription:
        "Dès 490€ par pers. Circuit culturel de 5 jours de Casablanca à Fès. Mosquée Hassan II, ville bleue de Chefchaouen, ruines de Volubilis et médina de Fès.",
    },
    es: {
      title: "Tour Ciudades Imperiales de Marruecos 5 Días | Casablanca, Chefchaouen y Fez (2026)",
      metaDescription:
        "Desde 490€ por pers. Tour cultural privado de 5 días de Casablanca a Fez. Mezquita Hassan II, Chefchaouen, ruinas de Volúbilis y medina de Fez.",
    },
    de: {
      title: "5-Tage Marokko Königsstädte Rundreise ab Casablanca (2026)",
      metaDescription:
        "Ab 490€ p.P. 5-tägige Kulturreise von Casablanca nach Fès. Hassan-II.-Moschee, Chefchaouen, römische Ruinen von Volubilis und UNESCO-Altstadt Fès.",
    },
  },
  tour5: {
    fr: {
      title: "Grand Tour du Maroc 10 Jours | Marrakech, Fès, Sahara & Chefchaouen (2026)",
      metaDescription:
        "Dès 980€ par pers. Le grand circuit complet de 10 jours au Maroc. Villes impériales, désert du Sahara à Erg Chebbi, Chefchaouen et côte atlantique.",
    },
    es: {
      title: "Gran Circuito por Marruecos 10 Días | Marrakech, Fez, Sáhara y Chefchaouen (2026)",
      metaDescription:
        "Desde 980€ por pers. Gran circuito de 10 días por Marruecos. Montañas del Atlas, dunas de Merzouga, ciudades imperiales, Chefchaouen y Casablanca.",
    },
    de: {
      title: "10-Tage Marokko Große Rundreise | Marrakesch, Fès, Sahara & Chefchaouen (2026)",
      metaDescription:
        "Ab 980€ p.P. 10-tägige Marokko-Erlebnisreise. Hoher Atlas, Merzouga-Sahara, Königsstädte Fès & Meknès, blaue Stadt Chefchaouen und Casablanca.",
    },
  },
  tour6: {
    fr: {
      title: "Circuit Désert Marrakech Merzouga 4 Jours | Erg Chebbi & Dadès (2026)",
      metaDescription:
        "Dès 360€ par pers. Circuit désert de 4 jours de Marrakech à Merzouga à un rythme serein. Kasbah Aït Ben Haddou, gorges du Todra, vallée du Drâa et bivouac.",
    },
    es: {
      title: "Tour al Desierto Marrakech a Merzouga 4 Días | Dades y Erg Chebbi (2026)",
      metaDescription:
        "Desde 360€ por pers. Tour relajado de 4 días al desierto de Marrakech a Merzouga. Ait Ben Haddou, gargantas del Todra, valle del Draa y dunas de Merzouga.",
    },
    de: {
      title: "4-Tage Wüstentour von Marrakesch nach Merzouga | Dades & Erg Chebbi (2026)",
      metaDescription:
        "Ab 360€ p.P. 4-tägige entspannte Sahara-Tour ab Marrakesch nach Merzouga. Ait Ben Haddou, Dades-Tal, Todra-Schlucht und Wüstencamp unter Sternen.",
    },
  },
  tour7: {
    fr: {
      title: "Circuit Désert d'Agadir à Marrakech 4 Jours | Merzouga & Taroudant (2026)",
      metaDescription:
        "Dès 395€ par pers. Circuit privé de 4 jours d'Agadir à Marrakech. Traversée de l'Anti-Atlas, safran de Taliouine, dunes de Merzouga et kasbahs du Sud.",
    },
    es: {
      title: "Tour al Desierto de Agadir a Marrakech 4 Días | Merzouga y Taroudant (2026)",
      metaDescription:
        "Desde 395€ por pers. Tour privado de 4 días desde Agadir hasta Marrakech pasando por el desierto de Merzouga, Taroudant, Taliouine y valle del Draa.",
    },
    de: {
      title: "4-Tage Wüstentour von Agadir nach Marrakesch | Merzouga (2026)",
      metaDescription:
        "Ab 395€ p.P. 4-tägige Reiseroute von Agadir über Merzouga nach Marrakesch. Taroudant, Safranfelder von Taliouine, Erg Chebbi und Hoher Atlas.",
    },
  },
  tour8: {
    fr: {
      title: "Circuit Désert Erg Chegaga 3 Jours depuis Marrakech en 4x4 (2026)",
      metaDescription:
        "Dès 340€ par pers. Expédition 3 jours dans le désert sauvage d'Erg Chegaga en 4x4. Vallée du Drâa, Zagora, lac asséché d'Iriqui et dunes géantes.",
    },
    es: {
      title: "Tour al Desierto de Erg Chegaga 3 Días desde Marrakech en 4x4 (2026)",
      metaDescription:
        "Desde 340€ por pers. Expedición en 4x4 de 3 días a las dunas salvajes de Erg Chegaga desde Marrakech. Valle del Draa, Zagora y lago Iriqui.",
    },
    de: {
      title: "3-Tage Erg Chegaga Wüstentour ab Marrakesch im 4x4 (2026)",
      metaDescription:
        "Ab 340€ p.P. 3-tägige 4x4-Wüstenexpedition ab Marrakesch zu den unberührten Dünen von Erg Chegaga über das Draa-Tal und den Iriqui-See.",
    },
  },
  tour9: {
    fr: {
      title: "Circuit Nord du Maroc 7 Jours de Tanger à Marrakech (2026)",
      metaDescription:
        "Dès 690€ par pers. Circuit de 7 jours de Tanger à Marrakech via Chefchaouen, Volubilis, la médina de Fès, les forêts de cèdres d'Azrou et la ville rouge.",
    },
    es: {
      title: "Tour del Norte de Marruecos 7 Días de Tánger a Marrakech (2026)",
      metaDescription:
        "Desde 690€ por pers. Viaje de 7 días de Tánger a Marrakech pasando por Chefchaouen, ruinas romanas de Volúbilis, Fez y el Medio Atlas.",
    },
    de: {
      title: "7-Tage Nordmarokko Rundreise von Tanger nach Marrakesch (2026)",
      metaDescription:
        "Ab 690€ p.P. 7-tägige Rundreise von Tanger nach Marrakesch über Chefchaouen, Volubilis, Fès und den Mittleren Atlas.",
    },
  },
};

export function getTourLocalizedSeo(
  tourKey: string,
  locale: string,
  defaultSeo: { title: string; metaDescription: string },
): TourSeoMeta {
  if (locale === "en") {
    return defaultSeo;
  }
  const byTour = TOUR_LOCALIZED_SEO[tourKey];
  return byTour?.[locale] ?? defaultSeo;
}

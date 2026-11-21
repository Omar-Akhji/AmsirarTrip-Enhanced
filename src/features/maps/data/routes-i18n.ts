export interface LocalizedWaypointText {
  readonly description: string;
  readonly name: string;
}

export interface LocalizedRouteConfig {
  readonly distance: string;
  readonly waypoints: readonly LocalizedWaypointText[];
}

export type NonDefaultLocale = "fr" | "de" | "es";

export const TOURS_I18N: Record<string, Record<NonDefaultLocale, LocalizedRouteConfig>> = {
  tour1: {
    fr: {
      distance: "~1 050 km aller-retour",
      waypoints: [
        { name: "Marrakech", description: "Départ via le col du Tizi n'Tichka (2 260 m)" },
        { name: "Aït Ben Haddou", description: "Ksar classé au patrimoine mondial de l'UNESCO" },
        { name: "Ouarzazate", description: "Porte du Sahara & studios de cinéma Atlas" },
        { name: "Vallée du Dadès", description: "Gorges panoramiques & nuit en riad traditionnel" },
        { name: "Gorges du Todra", description: "Marche dans un canyon calcaire de 300 m" },
        { name: "Erfoud", description: "Ville-oasis & ateliers de fossiles" },
        {
          name: "Merzouga (Erg Chebbi)",
          description: "Balade à dromadaire au coucher du soleil & bivouac de luxe",
        },
        { name: "Rissani", description: "Ancienne cité caravanière & souk aux épices" },
        { name: "Alnif", description: "Traversée des plaines pré-sahariennes" },
        { name: "Marrakech", description: "Retour en soirée à votre hôtel ou riad" },
      ],
    },
    de: {
      distance: "~1.050 km Rundstrecke",
      waypoints: [
        { name: "Marrakesch", description: "Abfahrt über den Tizi-n'Tichka-Pass (2.260 m)" },
        { name: "Ait Ben Haddou", description: "UNESCO-Weltkulturerbe Ksar" },
        { name: "Ouarzazate", description: "Tor zur Sahara & Atlas Film Studios" },
        {
          name: "Dades-Tal",
          description: "Felsenschluchten & Übernachtung im traditionellen Riad",
        },
        { name: "Todra-Schlucht", description: "Spaziergang zwischen 300 m hohen Kalkwänden" },
        { name: "Erfoud", description: "Oasenstadt & Fossilienwerkstätten" },
        {
          name: "Merzouga (Erg Chebbi)",
          description: "Kamelritt zum Sonnenuntergang & Luxus-Wüstencamp",
        },
        { name: "Rissani", description: "Historische Karawanenstadt & Gewürzmarkt" },
        { name: "Alnif", description: "Fahrt durch weite Vorsahara-Ebenen" },
        { name: "Marrakesch", description: "Abendliche Rückkehr zu Ihrem Hotel oder Riad" },
      ],
    },
    es: {
      distance: "~1.050 km ida y vuelta",
      waypoints: [
        { name: "Marrakech", description: "Salida por el puerto de Tizi n'Tichka (2.260 m)" },
        { name: "Ait Ben Haddou", description: "Ksar Patrimonio Mundial de la UNESCO" },
        { name: "Ouarzazate", description: "Puerta del Sáhara y estudios de cine Atlas" },
        {
          name: "Valle del Dadès",
          description: "Gargantas panorámicas y noche en riad tradicional",
        },
        { name: "Gargantas del Todra", description: "Paseo bajo paredes calizas de 300 m" },
        { name: "Erfoud", description: "Ciudad oasis y talleres de fósiles" },
        {
          name: "Merzouga (Erg Chebbi)",
          description: "Paseo en dromedario al atardecer y campamento de lujo",
        },
        { name: "Rissani", description: "Antigua capital caravanera y zoco de especias" },
        { name: "Alnif", description: "Ruta por llanuras presaharianas" },
        { name: "Marrakech", description: "Regreso por la tarde-noche a tu hotel o riad" },
      ],
    },
  },
  tour2: {
    fr: {
      distance: "~1 650 km",
      waypoints: [
        { name: "Casablanca", description: "Départ devant la mosquée Hassan II" },
        { name: "Rabat", description: "Monuments de la capitale & kasbah des Oudayas" },
        { name: "Chefchaouen", description: "La célèbre Perle Bleue dans le Rif" },
        { name: "Volubilis", description: "Vestiges romains antiques & mosaïques" },
        { name: "Fès", description: "Plus grande médina piétonne médiévale au monde" },
        { name: "Midelt", description: "Traversée du Moyen Atlas & capitale des pommes" },
        { name: "Désert de Merzouga", description: "Dunes de l'Erg Chebbi & campement berbère" },
        { name: "Gorges du Todra", description: "Promenade dans le canyon de calcaire" },
        { name: "Vallée du Dadès", description: "Vallée des Mille Kasbahs" },
        { name: "Marrakech", description: "Fin de l'expédition dans la Ville Rouge" },
      ],
    },
    de: {
      distance: "~1.650 km",
      waypoints: [
        { name: "Casablanca", description: "Abfahrt vorbei an der Hassan-II.-Moschee" },
        { name: "Rabat", description: "Wahrzeichen der Hauptstadt & Kasbah des Oudaias" },
        { name: "Chefchaouen", description: "Die blaue Perle im Rif-Gebirge" },
        { name: "Volubilis", description: "Antike römische Ruinen & Mosaikböden" },
        { name: "Fès", description: "Größte autofreie mittelalterliche Medina der Welt" },
        { name: "Midelt", description: "Mittlerer Atlas & Hochplateau der Äpfel" },
        { name: "Wüste Merzouga", description: "Erg-Chebbi-Dünen & Berbercamp" },
        { name: "Todra-Schlucht", description: "Spaziergang durch die Kalksteinschlucht" },
        { name: "Dades-Tal", description: "Tal der tausend Kasbahs" },
        { name: "Marrakesch", description: "Tourende in der Roten Stadt" },
      ],
    },
    es: {
      distance: "~1.650 km",
      waypoints: [
        { name: "Casablanca", description: "Salida junto a la mezquita Hassan II" },
        { name: "Rabat", description: "Monumentos de la capital y alcazaba de los Udayas" },
        { name: "Chefchaouen", description: "La emblemática Perla Azul en el Rif" },
        { name: "Volúbilis", description: "Ruinas romanas antiguas y mosaicos" },
        { name: "Fez", description: "La mayor medina peatonal medieval del mundo" },
        { name: "Midelt", description: "Cruce del Medio Atlas y meseta de los manzanos" },
        { name: "Desierto de Merzouga", description: "Dunas de Erg Chebbi y campamento bereber" },
        { name: "Gargantas del Todra", description: "Paseo por el cañón de piedra caliza" },
        { name: "Valle del Dadès", description: "Valle de las Mil Kasbahs" },
        { name: "Marrakech", description: "Fin de la ruta en la Ciudad Roja" },
      ],
    },
  },
  tour3: {
    fr: {
      distance: "~1 000 km",
      waypoints: [
        { name: "Fès", description: "Départ le matin vers le sud" },
        {
          name: "Ifrane & Forêt de cèdres",
          description: "Petite Suisse marocaine & macaques de Barbarie",
        },
        { name: "Midelt", description: "Halte déjeuner sur le haut plateau" },
        {
          name: "Merzouga (Erg Chebbi)",
          description: "Balade à dromadaire au coucher du soleil & nuit sous les étoiles",
        },
        { name: "Gorges du Todra", description: "Canyon aux hautes falaises ocre rouge" },
        { name: "Vallée du Dadès", description: "Lacets des gorges & riad-kasbah" },
        { name: "Vallée des Roses", description: "Distillation des roses à Kelaat M'Gouna" },
        { name: "Aït Ben Haddou", description: "Village fortifié en pisé & décor de cinéma" },
        { name: "Marrakech", description: "Passage du col du Tizi n'Tichka vers Marrakech" },
      ],
    },
    de: {
      distance: "~1.000 km",
      waypoints: [
        { name: "Fès", description: "Morgendliche Abfahrt Richtung Süden" },
        { name: "Ifrane & Zedernwald", description: "Marokkanische Schweiz & wilde Berberaffen" },
        { name: "Midelt", description: "Mittagspause auf der Hochebene" },
        {
          name: "Merzouga (Erg Chebbi)",
          description: "Kamelritt zum Sonnenuntergang & Nacht unter Sternen",
        },
        { name: "Todra-Schlucht", description: "Aufragende rote Felsschlucht" },
        { name: "Dades-Tal", description: "Schluchtserpentinen & Kasbah-Riad" },
        { name: "Rosental", description: "Rosenverarbeitung in Kelaat M'Gouna" },
        { name: "Ait Ben Haddou", description: "Lehm-Zitadelle & historische Filmkulisse" },
        { name: "Marrakesch", description: "Über den Tizi-n'Tichka-Pass nach Marrakesch" },
      ],
    },
    es: {
      distance: "~1.000 km",
      waypoints: [
        { name: "Fez", description: "Salida matinal hacia el sur" },
        {
          name: "Ifrane y Bosque de Cedros",
          description: "La Suiza marroquí y macacos de Berbería",
        },
        { name: "Midelt", description: "Parada para almorzar en el altiplano" },
        {
          name: "Merzouga (Erg Chebbi)",
          description: "Paseo en dromedario al atardecer y noche bajo las estrellas",
        },
        { name: "Gargantas del Todra", description: "Imponente cañón de roca rojiza" },
        { name: "Valle del Dadès", description: "Curvas del cañón y riad en kasbah" },
        { name: "Valle de las Rosas", description: "Destilación de rosas en Kelaat M'Gouna" },
        { name: "Ait Ben Haddou", description: "Pueblo fortificado de adobe y plató de cine" },
        { name: "Marrakech", description: "Cruce por Tizi n'Tichka rumbo a Marrakech" },
      ],
    },
  },
  tour4: {
    fr: {
      distance: "~780 km",
      waypoints: [
        { name: "Casablanca", description: "Arrivée & panorama sur la mosquée Hassan II" },
        { name: "Rabat", description: "Tour Hassan & nécropole royale" },
        { name: "Chefchaouen", description: "Ruelles pavées de la ville bleue" },
        { name: "Volubilis", description: "Site archéologique romain" },
        { name: "Meknès", description: "Bab El Mansour & greniers impériaux" },
        { name: "Fès", description: "Capitale spirituelle & université Al-Qarawiyyin" },
      ],
    },
    de: {
      distance: "~780 km",
      waypoints: [
        { name: "Casablanca", description: "Ankunft & Küstenblick auf die Hassan-II.-Moschee" },
        { name: "Rabat", description: "Hassan-Turm & königliches Mausoleum" },
        { name: "Chefchaouen", description: "Kopfsteinpflastergassen der blauen Stadt" },
        { name: "Volubilis", description: "Römische Ausgrabungsstätte" },
        { name: "Meknès", description: "Bab El Mansour & königliche Speicher" },
        { name: "Fès", description: "Geistiges Zentrum & Universität Al-Qarawiyyin" },
      ],
    },
    es: {
      distance: "~780 km",
      waypoints: [
        { name: "Casablanca", description: "Llegada y vistas a la mezquita Hassan II" },
        { name: "Rabat", description: "Torre Hassan y mausoleo real" },
        { name: "Chefchaouen", description: "Calles empedradas de la ciudad azul" },
        { name: "Volúbilis", description: "Yacimiento arqueológico romano" },
        { name: "Meknes", description: "Puerta Bab El Mansour y graneros imperiales" },
        { name: "Fez", description: "Capital espiritual y universidad Al-Qarawiyyin" },
      ],
    },
  },
  tour5: {
    fr: {
      distance: "~2 400 km grand circuit",
      waypoints: [
        { name: "Marrakech", description: "Visite historique de la ville & départ" },
        { name: "Aït Ben Haddou", description: "Ksar fortifié emblématique" },
        { name: "Vallée du Dadès", description: "Paysages escarpés du canyon" },
        { name: "Merzouga", description: "Dunes de l'Erg Chebbi & campement dans le désert" },
        { name: "Midelt", description: "Palmeraies du Ziz & col de montagne" },
        { name: "Fès", description: "Visite guidée complète de la médina médiévale" },
        { name: "Volubilis & Meknès", description: "Portes impériales & mosaïques romaines" },
        { name: "Chefchaouen", description: "Rues peintes en bleu dans le Rif" },
        { name: "Rabat", description: "Monuments de la capitale sur l'Atlantique" },
        { name: "Casablanca", description: "Métropole économique & fin du circuit" },
      ],
    },
    de: {
      distance: "~2.400 km Große Rundreise",
      waypoints: [
        { name: "Marrakesch", description: "Stadtbesichtigung & Abfahrt" },
        { name: "Ait Ben Haddou", description: "Berühmter Lehm-Ksar" },
        { name: "Dades-Tal", description: "Zerklüftete Schluchtenlandschaft" },
        { name: "Merzouga", description: "Erg-Chebbi-Dünen & Wüstencamp" },
        { name: "Midelt", description: "Ziz-Tal-Palmenhaine & Bergpass" },
        { name: "Fès", description: "Ganztägige Führung durch die mittelalterliche Medina" },
        { name: "Volubilis & Meknès", description: "Stadttore & römische Mosaike" },
        { name: "Chefchaouen", description: "Blau getünchte Gassen im Rif" },
        { name: "Rabat", description: "Denkmäler der Hauptstadt am Atlantik" },
        { name: "Casablanca", description: "Wirtschaftsmetropole & Tourende" },
      ],
    },
    es: {
      distance: "~2.400 km gran circuito",
      waypoints: [
        { name: "Marrakech", description: "Exploración histórica de la ciudad y salida" },
        { name: "Ait Ben Haddou", description: "Emblemático ksar fortificado" },
        { name: "Valle del Dadès", description: "Paisajes escarpados del cañón" },
        { name: "Merzouga", description: "Dunas de Erg Chebbi y campamento en el desierto" },
        { name: "Midelt", description: "Palmerales del valle del Ziz y paso de montaña" },
        { name: "Fez", description: "Visita guiada completa de la medina medieval" },
        { name: "Volúbilis y Meknes", description: "Puertas imperiales y mosaicos romanos" },
        { name: "Chefchaouen", description: "Calles teñidas de azul en el Rif" },
        { name: "Rabat", description: "Monumentos de la capital atlántica" },
        { name: "Casablanca", description: "Metrópoli económica y cierre del viaje" },
      ],
    },
  },
  tour6: {
    fr: {
      distance: "~1 120 km",
      waypoints: [
        { name: "Marrakech", description: "Traversée du Haut Atlas par le Tizi n'Tichka" },
        { name: "Aït Ben Haddou", description: "Promenade dans la kasbah classée UNESCO" },
        { name: "Vallée du Dadès", description: "Vallée des 1 000 Kasbahs & hôtel des gorges" },
        { name: "Gorges du Todra", description: "Marche matinale dans le canyon" },
        {
          name: "Merzouga (Erg Chebbi)",
          description: "Balade à dromadaire au coucher du soleil & bivouac de luxe",
        },
        { name: "Alnif & Vallée du Drâa", description: "Plaines d'acacias & palmeraies infinies" },
        { name: "Ouarzazate", description: "Kasbah de Taourirt & musée du cinéma" },
        { name: "Marrakech", description: "Route panoramique de retour par l'Atlas" },
      ],
    },
    de: {
      distance: "~1.120 km",
      waypoints: [
        { name: "Marrakesch", description: "Hoher-Atlas-Überquerung am Tizi n'Tichka" },
        { name: "Ait Ben Haddou", description: "Rundgang durch die UNESCO-Kasbah" },
        { name: "Dades-Tal", description: "Tal der 1.000 Kasbahs & Schlucht-Hotel" },
        { name: "Todra-Schlucht", description: "Morgenspaziergang durch die Schlucht" },
        {
          name: "Merzouga (Erg Chebbi)",
          description: "Kamelritt zum Sonnenuntergang & Luxus-Biwak",
        },
        { name: "Alnif & Draa-Tal", description: "Akazienebenen & endlose Dattelpalmenoasen" },
        { name: "Ouarzazate", description: "Kasbah Taourirt & Kinomuseum" },
        { name: "Marrakesch", description: "Aussichtsreiche Rückfahrt über den Hohen Atlas" },
      ],
    },
    es: {
      distance: "~1.120 km",
      waypoints: [
        { name: "Marrakech", description: "Cruce del Alto Atlas por Tizi n'Tichka" },
        { name: "Ait Ben Haddou", description: "Recorrido guiado por la kasbah UNESCO" },
        {
          name: "Valle del Dadès",
          description: "Valle de las 1.000 Kasbahs y hotel en la garganta",
        },
        { name: "Gargantas del Todra", description: "Caminata matinal por el cañón" },
        {
          name: "Merzouga (Erg Chebbi)",
          description: "Paseo en dromedario al atardecer y vivac de lujo",
        },
        { name: "Alnif y Valle del Draa", description: "Llanuras de acacias y palmerales sin fin" },
        { name: "Ouarzazate", description: "Kasbah Taourirt y museo del cine" },
        { name: "Marrakech", description: "Regreso panorámico cruzando el Atlas" },
      ],
    },
  },
  tour7: {
    fr: {
      distance: "~1 250 km",
      waypoints: [
        { name: "Agadir", description: "Départ de la côte atlantique vers l'est" },
        { name: "Taroudant", description: "Remparts en pisé de la « Petite Marrakech »" },
        { name: "Taznakht", description: "Coopératives de tissage de tapis berbères" },
        { name: "Ouarzazate", description: "Porte des vallées de l'Est" },
        { name: "Vallée du Dadès", description: "Nuit au cœur des gorges panoramiques" },
        { name: "Gorges du Todra", description: "Marche au pied des parois rocheuses" },
        { name: "Désert de Merzouga", description: "Caravane de dromadaires dans l'Erg Chebbi" },
        { name: "Aït Ben Haddou", description: "Village fortifié classé à l'UNESCO" },
        { name: "Marrakech", description: "Descente du Haut Atlas jusqu'à Marrakech" },
      ],
    },
    de: {
      distance: "~1.250 km",
      waypoints: [
        { name: "Agadir", description: "Abfahrt von der Atlantikküste ostwärts" },
        { name: "Taroudant", description: "Lehmmauern von „Klein-Marrakesch“" },
        { name: "Taznakht", description: "Kooperativen für gewebte Berberteppiche" },
        { name: "Ouarzazate", description: "Tor zu den östlichen Tälern" },
        { name: "Dades-Tal", description: "Übernachtung in der Panorama-Schlucht" },
        { name: "Todra-Schlucht", description: "Spaziergang entlang der Felswände" },
        { name: "Wüste Merzouga", description: "Kamelkarawane in den Erg-Chebbi-Dünen" },
        { name: "Ait Ben Haddou", description: "UNESCO-geschütztes Lehmdorf" },
        { name: "Marrakesch", description: "Abstieg vom Hohen Atlas nach Marrakesch" },
      ],
    },
    es: {
      distance: "~1.250 km",
      waypoints: [
        { name: "Agadir", description: "Salida desde la costa atlántica hacia el este" },
        { name: "Taroudant", description: "Murallas de adobe de «la pequeña Marrakech»" },
        { name: "Taznakht", description: "Cooperativas de alfombras bereberes tejidas a mano" },
        { name: "Ouarzazate", description: "Puerta hacia los valles orientales" },
        { name: "Valle del Dadès", description: "Noche en el corazón de la garganta panorámica" },
        { name: "Gargantas del Todra", description: "Caminata junto a los acantilados" },
        { name: "Desierto de Merzouga", description: "Caravana de dromedarios en Erg Chebbi" },
        { name: "Ait Ben Haddou", description: "Aldea fortificada Patrimonio de la UNESCO" },
        { name: "Marrakech", description: "Descenso del Alto Atlas hacia Marrakech" },
      ],
    },
  },
  tour8: {
    fr: {
      distance: "~950 km expédition 4x4",
      waypoints: [
        { name: "Marrakech", description: "Départ par le col du Tizi n'Tichka" },
        { name: "Aït Ben Haddou", description: "Exploration du ksar historique" },
        { name: "Zagora", description: "Ancien panneau « Tombouctou 52 jours »" },
        { name: "M'Hamid El Ghizlane", description: "Fin du goudron vers le grand Sahara" },
        { name: "Erg Chegaga", description: "Dunes sauvages de 300 m & piste 4x4" },
        {
          name: "Lac Iriqui & Foum Zguid",
          description: "Pistes du Paris-Dakar & plaines à fossiles",
        },
        { name: "Marrakech", description: "Retour via Taznakht & le Haut Atlas" },
      ],
    },
    de: {
      distance: "~950 km 4x4-Expedition",
      waypoints: [
        { name: "Marrakesch", description: "Abfahrt über den Tizi-n'Tichka-Pass" },
        { name: "Ait Ben Haddou", description: "Erkundung des historischen Ksar" },
        { name: "Zagora", description: "Historisches Tor mit Schild „Timbuktu 52 Tage“" },
        { name: "M'Hamid El Ghizlane", description: "Ende der Asphaltstraße in die offene Sahara" },
        { name: "Erg Chegaga", description: "Wilde 300-m-Sanddünen & 4x4-Piste" },
        { name: "Iriqui-See & Foum Zguid", description: "Alte Rallye-Pisten & Fossilienfelder" },
        { name: "Marrakesch", description: "Rückfahrt über Taznakht & den Hohen Atlas" },
      ],
    },
    es: {
      distance: "~950 km expedición 4x4",
      waypoints: [
        { name: "Marrakech", description: "Salida cruzando el puerto de Tizi n'Tichka" },
        { name: "Ait Ben Haddou", description: "Recorrido por el ksar histórico" },
        { name: "Zagora", description: "Histórico cartel de «Tombuctú 52 días»" },
        { name: "M'Hamid El Ghizlane", description: "Fin del asfalto hacia el Sáhara abierto" },
        { name: "Erg Chegaga", description: "Dunas salvajes de 300 m y pista 4x4" },
        {
          name: "Lago Iriqui y Foum Zguid",
          description: "Pistas del antiguo rally y campos de fósiles",
        },
        { name: "Marrakech", description: "Regreso por Taznakht y el Alto Atlas" },
      ],
    },
  },
  tour9: {
    fr: {
      distance: "~1 400 km",
      waypoints: [
        { name: "Tanger", description: "Détroit de Gibraltar & médina de Tanger" },
        { name: "Tétouan", description: "Médina au patrimoine andalou" },
        { name: "Chefchaouen", description: "La Perle Bleue du Rif" },
        { name: "Volubilis & Meknès", description: "Ruines romaines & portes impériales" },
        { name: "Fès", description: "Visite complète de la capitale spirituelle" },
        {
          name: "Béni Mellal & Moyen Atlas",
          description: "Forêts de cèdres & source d'Aïn Asserdoun",
        },
        { name: "Marrakech", description: "Jemaa el-Fna, souks & départ" },
      ],
    },
    de: {
      distance: "~1.400 km",
      waypoints: [
        { name: "Tanger", description: "Straße von Gibraltar & Medina von Tanger" },
        { name: "Tétouan", description: "Andalusisch geprägte Medina" },
        { name: "Chefchaouen", description: "Die blaue Perle des Rif" },
        { name: "Volubilis & Meknès", description: "Antike römische Ruinen & Stadttore" },
        { name: "Fès", description: "Ganztägige Führung durch die Königsstadt" },
        {
          name: "Beni Mellal & Mittlerer Atlas",
          description: "Zedernwälder & Quelle Ain Asserdoun",
        },
        { name: "Marrakesch", description: "Jemaa el-Fna, Souks & Abreise" },
      ],
    },
    es: {
      distance: "~1.400 km",
      waypoints: [
        { name: "Tánger", description: "Estrecho de Gibraltar y medina de Tánger" },
        { name: "Tetuán", description: "Medina de legado andalusí" },
        { name: "Chefchaouen", description: "La Perla Azul del Rif" },
        { name: "Volúbilis y Meknes", description: "Ruinas romanas y puertas imperiales" },
        { name: "Fez", description: "Visita guiada completa de la capital espiritual" },
        {
          name: "Beni Mellal y Medio Atlas",
          description: "Bosques de cedros y fuente de Ain Asserdoun",
        },
        { name: "Marrakech", description: "Jemaa el-Fna, zocos y despedida" },
      ],
    },
  },
};

export const EXCURSIONS_I18N: Record<string, Record<NonDefaultLocale, LocalizedRouteConfig>> = {
  excursion1: {
    fr: {
      distance: "~300 km aller-retour",
      waypoints: [
        { name: "Marrakech", description: "Prise en charge hôtel ou riad en véhicule climatisé" },
        { name: "Cascades d'Ouzoud", description: "Chutes de 110 m, macaques sauvages & barque" },
        { name: "Marrakech", description: "Retour à votre hébergement à Marrakech" },
      ],
    },
    de: {
      distance: "~300 km Hin- und Rückfahrt",
      waypoints: [
        { name: "Marrakesch", description: "Hotel- oder Riad-Abholung im klimatisierten Fahrzeug" },
        { name: "Ouzoud-Wasserfälle", description: "110-m-Kaskaden, wilde Affen & Bootsfahrt" },
        { name: "Marrakesch", description: "Rückkehr zu Ihrer Unterkunft in Marrakesch" },
      ],
    },
    es: {
      distance: "~300 km ida y vuelta",
      waypoints: [
        { name: "Marrakech", description: "Recogida en hotel o riad en vehículo climatizado" },
        { name: "Cascadas de Ouzoud", description: "Saltos de 110 m, macacos salvajes y barca" },
        { name: "Marrakech", description: "Regreso a tu alojamiento en Marrakech" },
      ],
    },
  },
  excursion2: {
    fr: {
      distance: "~380 km aller-retour",
      waypoints: [
        { name: "Marrakech", description: "Transfert privé vers l'ouest et l'Atlantique" },
        { name: "Plaines de Chichaoua", description: "Pause café & forêt d'arganiers" },
        { name: "Essaouira (Mogador)", description: "Remparts historiques, port & poisson frais" },
        { name: "Marrakech", description: "Trajet retour jusqu'à votre hébergement" },
      ],
    },
    de: {
      distance: "~380 km Hin- und Rückfahrt",
      waypoints: [
        { name: "Marrakesch", description: "Privater Transfer westwärts zum Atlantik" },
        { name: "Chichaoua-Ebene", description: "Kaffeepause & Arganbaum-Haine" },
        {
          name: "Essaouira (Mogador)",
          description: "Historische Seemauern, Hafen & frischer Fisch",
        },
        { name: "Marrakesch", description: "Rücktransfer zu Ihrer Unterkunft" },
      ],
    },
    es: {
      distance: "~380 km ida y vuelta",
      waypoints: [
        { name: "Marrakech", description: "Traslado privado hacia el oeste rumbo al Atlántico" },
        { name: "Llanuras de Chichaoua", description: "Pausa para café y arboledas de argán" },
        {
          name: "Essaouira (Mogador)",
          description: "Murallas históricas, puerto pesquero y marisco",
        },
        { name: "Marrakech", description: "Regreso a tu alojamiento en Marrakech" },
      ],
    },
  },
  excursion3: {
    fr: {
      distance: "~140 km aller-retour",
      waypoints: [
        { name: "Marrakech", description: "Prise en charge vers le sud et le Haut Atlas" },
        { name: "Vallée d'Asni", description: "Gorges de Moulay Brahim & marché berbère" },
        {
          name: "Village d'Imlil (1 740 m)",
          description: "Point de départ vers le Toubkal (4 167 m)",
        },
        { name: "Hameau d'Aroumd", description: "Randonnée panoramique & déjeuner berbère maison" },
        { name: "Marrakech", description: "Descente et retour à Marrakech" },
      ],
    },
    de: {
      distance: "~140 km Hin- und Rückfahrt",
      waypoints: [
        { name: "Marrakesch", description: "Abholung Richtung Süden in den Hohen Atlas" },
        { name: "Asni-Tal", description: "Moulay-Brahim-Schlucht & Wochenmarkt" },
        { name: "Dorf Imlil (1.740 m)", description: "Ausgangspunkt am Fuß des Toubkal (4.167 m)" },
        { name: "Bergdorf Aroumd", description: "Aussichtsreiche Wanderung & Berber-Mittagessen" },
        { name: "Marrakesch", description: "Abstieg und Rückfahrt nach Marrakesch" },
      ],
    },
    es: {
      distance: "~140 km ida y vuelta",
      waypoints: [
        { name: "Marrakech", description: "Recogida rumbo sur hacia el Alto Atlas" },
        { name: "Valle de Asni", description: "Garganta de Moulay Brahim y mercado bereber" },
        { name: "Aldea de Imlil (1.740 m)", description: "Campo base del monte Toubkal (4.167 m)" },
        { name: "Aldea de Aroumd", description: "Ruta panorámica a pie y almuerzo bereber" },
        { name: "Marrakech", description: "Descenso y regreso a Marrakech" },
      ],
    },
  },
  excursion4: {
    fr: {
      distance: "~130 km aller-retour",
      waypoints: [
        { name: "Marrakech", description: "Départ en remontant la rivière de l'Ourika" },
        { name: "Vallée de l'Ourika", description: "Coopérative d'argan & villages en terrasses" },
        {
          name: "Cascades de Setti Fatma",
          description: "Randonnée guidée aux 7 cascades & déjeuner au bord de l'eau",
        },
        { name: "Marrakech", description: "Retour tranquille à Marrakech l'après-midi" },
      ],
    },
    de: {
      distance: "~130 km Hin- und Rückfahrt",
      waypoints: [
        { name: "Marrakesch", description: "Abfahrt entlang des Ourika-Flusstals" },
        { name: "Ourika-Tal", description: "Argankooperative & terrassierte Berberdörfer" },
        {
          name: "Setti-Fatma-Wasserfälle",
          description: "Geführte Wanderung zu den 7 Wasserfällen & Mittagessen am Fluss",
        },
        { name: "Marrakesch", description: "Entspannte Rückkehr am Nachmittag" },
      ],
    },
    es: {
      distance: "~130 km ida y vuelta",
      waypoints: [
        { name: "Marrakech", description: "Salida remontando el valle del río Ourika" },
        { name: "Valle de Ourika", description: "Cooperativa de argán y aldeas en terrazas" },
        {
          name: "Cascadas de Setti Fatma",
          description: "Ruta guiada a las 7 cascadas y almuerzo junto al río",
        },
        { name: "Marrakech", description: "Regreso tranquilo por la tarde a Marrakech" },
      ],
    },
  },
  excursion5: {
    fr: {
      distance: "~80 km aller-retour",
      waypoints: [
        { name: "Marrakech", description: "Prise en charge l'après-midi en 4x4 ou van privé" },
        { name: "Lac Lalla Takerkoust", description: "Vue sur le lac face aux sommets de l'Atlas" },
        {
          name: "Camp du désert d'Agafay",
          description: "Balade à dromadaire au coucher du soleil, dîner aux chandelles & musique",
        },
        { name: "Marrakech", description: "Retour confortable de nuit à Marrakech" },
      ],
    },
    de: {
      distance: "~80 km Hin- und Rückfahrt",
      waypoints: [
        { name: "Marrakesch", description: "Nachmittags-Abholung im 4x4 oder Privatvan" },
        {
          name: "Stausee Lalla Takerkoust",
          description: "Seeblick vor dem Panorama des Hohen Atlas",
        },
        {
          name: "Agafay-Wüstencamp",
          description: "Kamelritt zum Sonnenuntergang, Dinner bei Kerzenlicht & Lagerfeuermusik",
        },
        { name: "Marrakesch", description: "Bequemer Rücktransfer am Abend nach Marrakesch" },
      ],
    },
    es: {
      distance: "~80 km ida y vuelta",
      waypoints: [
        { name: "Marrakech", description: "Recogida por la tarde en 4x4 o monovolumen privado" },
        { name: "Lago Lalla Takerkoust", description: "Vistas del embalse con el Atlas de fondo" },
        {
          name: "Campamento del desierto de Agafay",
          description: "Camello al atardecer, cena a la luz de las velas y música junto al fuego",
        },
        { name: "Marrakech", description: "Cómodo traslado nocturno de vuelta a Marrakech" },
      ],
    },
  },
  excursion6: {
    fr: {
      distance: "~50 km zone de vol",
      waypoints: [
        { name: "Marrakech", description: "Prise en charge matinale avant l'aube" },
        {
          name: "Site de lancement Palmeraie / Jbilet",
          description: "Thé à la menthe d'accueil & gonflage du ballon",
        },
        {
          name: "Vol au lever du soleil",
          description: "Vol d'1 heure au-dessus des vallées face à l'Atlas",
        },
        { name: "Marrakech", description: "Petit-déjeuner berbère sous tente caïdale & retour" },
      ],
    },
    de: {
      distance: "~50 km Flugzone",
      waypoints: [
        { name: "Marrakesch", description: "Frühe Abholung noch vor Morgengrauen" },
        {
          name: "Startplatz Palmeraie / Jbilet",
          description: "Minztee vor dem Start & Ballonaufrüstung",
        },
        {
          name: "Sonnenaufgangsflug",
          description: "1-stündige Fahrt über Wüstentäler mit Blick auf den Atlas",
        },
        { name: "Marrakesch", description: "Berberfrühstück im Caidal-Zelt & Rückfahrt" },
      ],
    },
    es: {
      distance: "~50 km zona de vuelo",
      waypoints: [
        { name: "Marrakech", description: "Recogida temprana antes del amanecer" },
        {
          name: "Zona de despegue Palmeraie / Jbilet",
          description: "Té de menta previo al vuelo e inflado del globo",
        },
        {
          name: "Vuelo al amanecer",
          description: "Vuelo de 1 hora sobre valles desérticos frente al Atlas",
        },
        { name: "Marrakech", description: "Desayuno bereber en haima caidal y regreso" },
      ],
    },
  },
};

import type { Tour } from "../types";
import { getCollection } from "astro:content";

/**
 * Derives UI-ready tour data from Astro Content Collections. Replaces the old hardcoded TOURS_DATA
 * array — single source of truth.
 *
 * Usage in .astro files (top-level await is fine): const tours = await getToursData();
 *
 * Usage in .vue files (use inside async setup() or fetch on mount): const tours = await
 * getToursData();
 */
export async function getToursData(): Promise<Tour[]> {
  const entries = await getCollection("tours");

  return entries
    .map((entry) => {
      const { bookingId, tourKey, image, durationDays, startLocation, endLocation } = entry.data;

      // i18n keys matching the locale JSON structure: tours.tour1.title, tours.tour1.description
      const titleKey = `${tourKey}.title`;
      const descriptionKey = `${tourKey}.description`;
      // Author = start city shown in card
      const authorKey = `tours.cities.${startLocation.toLowerCase()}`;
      const startKey = `tours.cities.${startLocation.toLowerCase()}`;
      const endKey = `tours.cities.${endLocation.toLowerCase()}`;

      return {
        id: bookingId,
        image,
        title: titleKey,
        author: authorKey,
        category: "tours",
        description: descriptionKey,
        duration: durationDays,
        start: startKey,
        route: `/tours/${entry.id}`,
        end: endKey,
      } satisfies Tour;
    })
    .toSorted((a, b) => a.id - b.id);
}

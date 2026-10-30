import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";

export interface ExcursionItem {
  readonly id: number;
  readonly image: ImageMetadata;
  readonly title: string;
  readonly alt: string;
  readonly description: string;
  readonly tagline: string;
  readonly duration: string;
  readonly route: string;
}

/**
 * Derives UI-ready excursion data from Astro Content Collections. Single source of truth matching
 * getToursData().
 */
export async function getExcursionsData(): Promise<ExcursionItem[]> {
  const entries = await getCollection("excursions");

  return entries
    .map((entry) => {
      const { bookingId, image, i18nKeyPrefix } = entry.data;
      return {
        id: bookingId,
        image,
        title: `excursion.list.${i18nKeyPrefix}.title`,
        alt: `excursion.list.${i18nKeyPrefix}.alt`,
        description: `excursion.list.${i18nKeyPrefix}.description`,
        tagline: `excursion.list.${i18nKeyPrefix}.tagline`,
        duration: `excursion.list.${i18nKeyPrefix}.duration`,
        route: `/excursions/${entry.id}`,
      } satisfies ExcursionItem;
    })
    .toSorted((a, b) => a.id - b.id);
}

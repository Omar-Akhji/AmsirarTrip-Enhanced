import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";

export interface ExcursionItem {
  readonly alt: string;
  readonly description: string;
  readonly duration: string;
  readonly id: number;
  readonly image: ImageMetadata;
  readonly price?: number | undefined;
  readonly route: string;
  readonly tagline: string;
  readonly title: string;
}

let cachedExcursionsPromise: Promise<ExcursionItem[]> | undefined;

async function loadExcursions(): Promise<ExcursionItem[]> {
  try {
    const entries = await getCollection("excursions");
    return entries
      .map((entry) => {
        const { bookingId, image, i18nKeyPrefix, jsonLd } = entry.data;
        return {
          id: bookingId,
          image,
          title: `excursion.list.${i18nKeyPrefix}.title`,
          alt: `excursion.list.${i18nKeyPrefix}.alt`,
          description: `excursion.list.${i18nKeyPrefix}.description`,
          tagline: `excursion.list.${i18nKeyPrefix}.tagline`,
          duration: `excursion.list.${i18nKeyPrefix}.duration`,
          price: jsonLd.price,
          route: `/excursions/${entry.id}`,
        } satisfies ExcursionItem;
      })
      .toSorted((a, b) => a.id - b.id);
  } catch (error: unknown) {
    cachedExcursionsPromise = undefined;
    throw error;
  }
}

/** Derives UI-ready excursion data from Astro Content Collections (memoized in production). */
export async function getExcursionsData(): Promise<ExcursionItem[]> {
  if (!import.meta.env.PROD) {
    return loadExcursions();
  }
  cachedExcursionsPromise ??= loadExcursions();
  return cachedExcursionsPromise;
}

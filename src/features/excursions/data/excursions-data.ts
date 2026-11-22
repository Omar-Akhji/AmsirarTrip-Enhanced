import type { ImageMetadata } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import type { LocalizedTourSeo } from "@/features/tours/data/tours-data";
import { isNonDefaultLocale } from "@/i18n/locales";

export interface LocalizedExcursionContent {
  readonly excludes: readonly string[];
  readonly goodToKnow: readonly string[];
  readonly includes: readonly string[];
  readonly jsonLd: { readonly description: string; readonly name: string };
  readonly location: string;
  readonly metrics: {
    readonly distance: string;
    readonly duration: string;
    readonly elevation: string;
    readonly pickup: string;
  };
  readonly overview: readonly string[];
  readonly program: readonly {
    readonly description: string;
    readonly location: string;
    readonly time: string;
    readonly title: string;
  }[];
  readonly seo: LocalizedTourSeo;
}

export function getLocalizedExcursionContent(
  excursion: CollectionEntry<"excursions">["data"],
  locale: string,
): LocalizedExcursionContent {
  if (isNonDefaultLocale(locale)) {
    return excursion.translations[locale];
  }
  return {
    location: excursion.location,
    metrics: excursion.metrics,
    overview: excursion.overview,
    program: excursion.program,
    includes: excursion.includes,
    excludes: excursion.excludes,
    goodToKnow: excursion.goodToKnow,
    seo: { ...excursion.seo, imageAlt: excursion.seo.imageAlt ?? excursion.seo.title },
    jsonLd: { name: excursion.jsonLd.name, description: excursion.jsonLd.description },
  };
}

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

function mapExcursionsEntries(entries: readonly CollectionEntry<"excursions">[]): ExcursionItem[] {
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
}

async function loadExcursions(): Promise<ExcursionItem[]> {
  try {
    const entries = await getCollection("excursions");
    return mapExcursionsEntries(entries);
  } catch (error: unknown) {
    cachedExcursionsPromise = undefined;
    throw error;
  }
}

/** Derives UI-ready excursion data from Astro Content Collections (memoized in production). */
export async function getExcursionsData(
  preloadedEntries?: readonly CollectionEntry<"excursions">[],
): Promise<ExcursionItem[]> {
  if (preloadedEntries) {
    return mapExcursionsEntries(preloadedEntries);
  }
  if (!import.meta.env.PROD) {
    return loadExcursions();
  }
  cachedExcursionsPromise ??= loadExcursions();
  return cachedExcursionsPromise;
}

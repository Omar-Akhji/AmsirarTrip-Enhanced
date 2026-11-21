import type { Tour } from "../types";
import { getCollection, type CollectionEntry } from "astro:content";
import { isNonDefaultLocale } from "@/i18n/locales";

export interface LocalizedTourSeo {
  readonly faqs: readonly { readonly answer: string; readonly question: string }[];
  readonly highlights: readonly string[];
  readonly imageAlt: string;
  readonly lead: string;
  readonly metaDescription: string;
  readonly price: { readonly label: string; readonly note: string };
  readonly title: string;
}

export function getLocalizedTourSeo(
  tour: CollectionEntry<"tours">["data"],
  locale: string,
): LocalizedTourSeo {
  return isNonDefaultLocale(locale) ?
      tour.translations[locale]
    : { ...tour.seo, imageAlt: tour.seo.imageAlt ?? tour.seo.title };
}

let cachedToursPromise: Promise<Tour[]> | undefined;

async function loadTours(): Promise<Tour[]> {
  try {
    const entries = await getCollection("tours");
    return entries
      .map((entry) => {
        const { bookingId, tourKey, image, durationDays, startLocation, endLocation } = entry.data;
        const start = startLocation.toLowerCase();
        const end = endLocation.toLowerCase();

        return {
          id: bookingId,
          image,
          title: `${tourKey}.title`,
          author: `tours.cities.${start}`,
          category: "tours",
          description: `tours.${tourKey}.description`,
          duration: durationDays,
          start: `tours.cities.${start}`,
          startLocation: start,
          route: `/tours/${entry.id}`,
          end: `tours.cities.${end}`,
        } satisfies Tour;
      })
      .toSorted((a, b) => a.id - b.id);
  } catch (error: unknown) {
    cachedToursPromise = undefined;
    throw error;
  }
}

/** Derives UI-ready tour data from Astro Content Collections (memoized in production). */
export async function getToursData(): Promise<Tour[]> {
  if (!import.meta.env.PROD) {
    return loadTours();
  }
  cachedToursPromise ??= loadTours();
  return cachedToursPromise;
}

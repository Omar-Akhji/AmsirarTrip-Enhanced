import { glob } from "astro/loaders";
import { defineCollection, type SchemaContext } from "astro:content";
import { z } from "astro/zod";

// Sub-schemas to keep function nesting depth <= 3 (violates unicorn/max-nested-calls otherwise)
const faqSchema = z.object({ question: z.string(), answer: z.string() });

const priceSchema = z.object({ label: z.string(), note: z.string() });

const seoSchema = z.object({
  title: z.string(),
  metaDescription: z.string(),
  lead: z.string(),
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()),
  price: priceSchema,
  imageAlt: z.string().optional(),
  highlights: z.array(z.string()),
  faqs: z.array(faqSchema),
});

// One timed stop on an excursion's day program. Rendered as the timeline and as TouristTrip itinerary JSON-LD.
const programStageSchema = z.object({
  time: z.string(),
  title: z.string(),
  location: z.string(),
  description: z.string(),
});

const excursionMetricsSchema = z.object({
  distance: z.string(),
  duration: z.string(),
  pickup: z.string(),
  elevation: z.string(),
});

const jsonLdSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().optional(),
  currency: z.string().optional(),
});

// Base Trip Schema
const baseTripSchema = ({ image }: SchemaContext) =>
  z.object({
    bookingId: z.number(),
    image: image(), // Zod schema function provided by Astro to validate and optimize local images
    duration: z.string(),
    keywords: z.array(z.string()),
  });

const toursCollection = defineCollection({
  loader: glob({ pattern: "**/*.{json,mdx}", base: "./src/content/tours" }),
  schema: (context) =>
    baseTripSchema(context).extend({
      tourKey: z.string(),
      durationDays: z.number(),
      startLocation: z.string(),
      endLocation: z.string(),
      seo: seoSchema,
      jsonLd: jsonLdSchema,
    }),
});

const excursionsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{json,mdx}", base: "./src/content/excursions" }),
  schema: (context) =>
    baseTripSchema(context).extend({
      excursionKey: z.string(),
      i18nKeyPrefix: z.string(),
      location: z.string(),
      metrics: excursionMetricsSchema,
      overview: z.array(z.string()),
      program: z.array(programStageSchema).min(1),
      includes: z.array(z.string()),
      excludes: z.array(z.string()),
      goodToKnow: z.array(z.string()),
      seo: seoSchema,
      jsonLd: jsonLdSchema,
    }),
});

const destinationsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{json,mdx}", base: "./src/content/destinations" }),
  schema: ({ image }) =>
    z.object({
      image: image(),
      width: z.number(),
      height: z.number(),
      titleKey: z.string(),
      descriptionKey: z.string(),
      altKey: z.string(),
    }),
});

const legalCollection = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    lastUpdated: z.string(),
    locale: z.enum(["en", "fr", "de", "es"]),
  }),
});

export const collections = {
  tours: toursCollection,
  excursions: excursionsCollection,
  destinations: destinationsCollection,
  legal: legalCollection,
};

import { glob } from "astro/loaders";
import { defineCollection, type SchemaContext } from "astro:content";
import { z } from "zod";

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
  imageAlt: z.string(),
  highlights: z.array(z.string()),
  faqs: z.array(faqSchema),
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
  loader: glob({ pattern: "**/*.json", base: "./src/content/tours" }),
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
  loader: glob({ pattern: "**/*.json", base: "./src/content/excursions" }),
  schema: (context) =>
    baseTripSchema(context).extend({
      excursionKey: z.string(),
      i18nKeyPrefix: z.string(),
      location: z.string(),
      jsonLd: z.object({ name: z.string(), description: z.string() }),
    }),
});

const destinationsCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/destinations" }),
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

export const collections = {
  tours: toursCollection,
  excursions: excursionsCollection,
  destinations: destinationsCollection,
};

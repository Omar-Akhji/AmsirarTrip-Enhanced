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

const legalSummaryCardSchema = z.object({ title: z.string(), description: z.string() });

const legalAgencyCardSchema = z.object({
  title: z.string(),
  badge: z.string(),
  hours: z.string(),
  chatCta: z.string(),
});

const legalCalloutSchema = z.object({ title: z.string(), desc: z.string() });

const legalSectionSchema = z.object({
  id: z.string(),
  num: z.string(),
  title: z.string(),
  paragraphs: z.array(z.string()),
  callout: legalCalloutSchema.optional(),
});

const cookieRowSchema = z.object({
  name: z.string(),
  provider: z.string(),
  category: z.string(),
  categoryClass: z.string(),
  purpose: z.string(),
  lifespan: z.string(),
});

const cookieTableSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  colName: z.string(),
  colProvider: z.string(),
  colCategory: z.string(),
  colPurpose: z.string(),
  colLifespan: z.string(),
  rows: z.array(cookieRowSchema),
});

const cancellationTierSchema = z.object({
  days: z.string(),
  badge: z.string(),
  badgeClass: z.string(),
  desc: z.string(),
});

const cancellationMatrixSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  tiers: z.array(cancellationTierSchema),
  insuranceTitle: z.string(),
  insuranceDesc: z.string(),
});

const legalCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/legal" }),
  schema: z.object({
    locale: z.enum(["en", "fr", "de", "es"]),
    title: z.string(),
    subtitle: z.string(),
    lastUpdated: z.string(),
    badgeDoc: z.string(),
    badgeStatus: z.string(),
    badgeJurisdiction: z.string(),
    summaryTitle: z.string(),
    summarySubtitle: z.string(),
    summaryCards: z.array(legalSummaryCardSchema),
    tocTitle: z.string(),
    printLabel: z.string(),
    agencyCard: legalAgencyCardSchema,
    cookieCta: legalCalloutSchema.extend({ buttonLabel: z.string() }).optional(),
    cookieTable: cookieTableSchema.optional(),
    cancellationMatrix: cancellationMatrixSchema.optional(),
    sections: z.array(legalSectionSchema),
  }),
});

export const collections = {
  tours: toursCollection,
  excursions: excursionsCollection,
  destinations: destinationsCollection,
  legal: legalCollection,
};

import { z } from "astro/zod";

const validationsSchema = z.object({
  recaptchaRequired: z.string(),
  nameMin: z.string(),
  nameTooLong: z.string(),
  emailInvalid: z.string(),
  phoneInvalid: z.string(),
  phoneTooLong: z.string(),
  messageMin: z.string(),
  messageTooLong: z.string(),
  reservationRequired: z.string(),
  personsMin: z.string(),
  personsMax: z.string(),
  invalidDate: z.string(),
  datePast: z.string(),
});

const navSchema = z.object({
  home: z.string(),
  tours: z.string(),
  excursions: z.string(),
  blog: z.string(),
  about: z.string(),
  contact: z.string(),
  toggleMenu: z.string(),
});

const statsSchema = z.object({
  experience: z.string(),
  tours: z.string(),
  routes: z.string(),
  destinations: z.string(),
  care: z.string(),
  satisfaction: z.string(),
});

const metaSchema = z.object({ title: z.string(), description: z.string() });

const citiesSchema = z.object({
  marrakech: z.string(),
  casablanca: z.string(),
  fes: z.string(),
  chefchaouen: z.string(),
  rabat: z.string(),
  meknes: z.string(),
  ouarzazate: z.string(),
  merzouga: z.string(),
  agadir: z.string(),
  essaouira: z.string(),
  imlil: z.string(),
  ourika: z.string(),
  agafay: z.string(),
  tangier: z.string(),
  dades: z.string(),
  todra: z.string(),
  midelt: z.string(),
  ifrane: z.string(),
  azrou: z.string(),
  skoura: z.string(),
  zagora: z.string(),
});

// ── Home Sub-schemas ──────────────────────────────────────────────────────────

const homeSectionSchema = z.object({
  meta: metaSchema,
  title: z.string(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  heroSubtitleAlt1: z.string(),
  heroSubtitleAlt2: z.string(),
  heroAlt1: z.string(),
  heroAlt2: z.string(),
  exploreOurTours: z.string(),
  contactForMore: z.string(),
  stats: statsSchema,
});

// ── Tours Sub-schemas ─────────────────────────────────────────────────────────

const toursCategorySchema = z.object({ departures: z.string() });

const toursSidebarSchema = z.object({
  title: z.string(),
  mainBrand: z.string(),
  subBrand: z.string(),
  intro: z.string(),
  details: z.string(),
  items: z.array(z.string()),
  conclusion: z.string(),
  ctaTitle: z.string(),
  ctaDescription: z.string(),
  ctaPoint01: z.string(),
  ctaPoint02: z.string(),
  ctaPoint03: z.string(),
});

const toursStatsSchema = z.object({
  routes: z.string(),
  routesDesc: z.string(),
  comfort: z.string(),
  comfortDesc: z.string(),
  support: z.string(),
  supportDesc: z.string(),
});

const toursTourSchema = z.object({ smTitle: z.string(), lgTitle: z.string() });

const toursCommentsFormSchema = z.object({
  name: z.string(),
  email: z.string(),
  website: z.string(),
  message: z.string(),
  submit: z.string(),
});

const toursCommentsSchema = z.object({
  title: z.string(),
  leave: z.string(),
  form: toursCommentsFormSchema,
});

const toursReservationSchema = z.object({
  title: z.string(),
  nameLabel: z.string(),
  namePlaceholder: z.string(),
  emailLabel: z.string(),
  emailPlaceholder: z.string(),
  phonePlaceholder: z.string(),
  messageLabel: z.string(),
  messagePlaceholder: z.string(),
  datePlaceholder: z.string(),
  reserveNow: z.string(),
  peoplePlaceholder: z.string(),
  peopleLabel: z.string(),
  reserve: z.string(),
  tourTypePlaceholder: z.string(),
});

const toursSectionSchema = z
  .object({
    meta: metaSchema,
    title: z.string(),
    day: z.string(),
    accommodationLabel: z.string(),
    mealsLabel: z.string(),
    activitiesLabel: z.string(),
    arrivalLabel: z.string(),
    featured: z.string(),
    category: toursCategorySchema,
    cities: citiesSchema,
    sidebar: toursSidebarSchema,
    headerSubtitle: z.string(),
    stats: toursStatsSchema,
    tour: toursTourSchema,
    readMore: z.string(),
    comments: toursCommentsSchema,
    detailsTitle: z.string(),
    detailsSubtitle: z.string(),
    exploreThisTour: z.string(),
    overview: z.string(),
    departure: z.string(),
    durationDays: z.string(),
    durationLabel: z.string(),
    startLabel: z.string(),
    endLabel: z.string(),
    exploreLink: z.string(),
    included: z.string(),
    excluded: z.string(),
    includes: z.string(),
    excludes: z.string(),
    itinerary: z.string(),
    goodToKnow: z.string(),
    highlightsTitle: z.string(),
    pricingTitle: z.string(),
    priceLabel: z.string(),
    faqTitle: z.string(),
    startLabelShort: z.string(),
    endLabelShort: z.string(),
    sectionSubtitle: z.string(),
    recentBlog: z.string(),
    reservation: toursReservationSchema,
    // Dynamic tour entries (tour1, tour2, ...) allowed dynamically via catchall
    accommodation: z.string(),
    meals: z.string(),
    activities: z.string(),
    arrival: z.string(),
    duration: z.string(),
    days: z.string(),
    start: z.string(),
    end: z.string(),
  })
  .catchall(z.unknown());

// ── Excursion Sub-schemas ───────────────────────────────────────────────────

const excursionCommonSchema = z.object({
  distance: z.string(),
  duration: z.string(),
  distanceLabel: z.string(),
  durationLabel: z.string(),
  highlights: z.string(),
  overview: z.string(),
});

const excursionStatsSchema = z.object({
  routes: z.string(),
  routesDesc: z.string(),
  local: z.string(),
  localDesc: z.string(),
  support: z.string(),
  supportDesc: z.string(),
});

const excursionCardSchema = z.object({ category: z.string() });

const excursionSidebarSchema = z.object({
  alt: z.string(),
  title: z.string(),
  mainBrand: z.string(),
  subBrand: z.string(),
  intro: z.string(),
  details: z.string(),
  items: z.array(z.string()),
  conclusion: z.string(),
  ctaTitle: z.string(),
  ctaDescription: z.string(),
  ctaPoint01: z.string(),
  ctaPoint02: z.string(),
  ctaPoint03: z.string(),
});

const excursion404Schema = z.object({
  title: z.string(),
  description: z.string(),
  message: z.string(),
  cta: z.string(),
});

const excursionBlogSchema = z.object({ smTitle: z.string(), lgTitle: z.string() });

const excursionSectionSchema = z.object({
  meta: metaSchema,
  title: z.string(),
  sectionSubtitle: z.string(),
  detailsTitle: z.string(),
  detailsSubtitle: z.string(),
  exploreThisExcursion: z.string(),
  common: excursionCommonSchema,
  stats: excursionStatsSchema,
  card: excursionCardSchema,
  exploreLink: z.string(),
  sidebar: excursionSidebarSchema,
  headerSubtitle: z.string(),
  "404": excursion404Schema,
  blog: excursionBlogSchema,
  readMore: z.string(),
});

// ── About Sub-schemas ─────────────────────────────────────────────────────────

const aboutWhyTrustSchema = z.object({
  point1: z.string(),
  point2: z.string(),
  point3: z.string(),
  point4: z.string(),
});

const aboutFactsSchema = z.object({
  smTitle: z.string(),
  lgTitle: z.string(),
  photos: z.string(),
  beaches: z.string(),
  mountains: z.string(),
  cruises: z.string(),
});

const aboutSectionSchema = z.object({
  meta: metaSchema,
  title: z.string(),
  headerSubtitle: z.string(),
  smTitle: z.string(),
  ourStory: z.string(),
  experienceTitle: z.string(),
  whyTrustTitle: z.string(),
  whyTrust: aboutWhyTrustSchema,
  experienceText1: z.string(),
  experienceText2: z.string(),
  experienceText3: z.string(),
  conclusionText: z.string(),
  imageCaption: z.string(),
  facts: aboutFactsSchema,
});

// ── Contact Sub-schemas ───────────────────────────────────────────────────────

const contactCardSchema = z.object({
  phoneTitle: z.string(),
  phoneSeo: z.string(),
  emailTitle: z.string(),
  emailSeo: z.string(),
  visitTitle: z.string(),
  visitSeo: z.string(),
});

const contactErrorsSchema = z.object({
  title: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  message: z.string(),
  captcha: z.string(),
  generic: z.string(),
  validation: z.string(),
  rateLimit: z.string(),
});

const contactFieldsSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  topic: z.string(),
  message: z.string(),
});

const contactInfoInnerSchema = z.object({
  address: z.string(),
  phone: z.string(),
  email: z.string(),
});

const contactFormSchema = z.object({
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  cta: z.string(),
  sending: z.string(),
  success: z.string(),
  errors: contactErrorsSchema,
  fields: contactFieldsSchema,
  infoBadge: z.string(),
  infoTitle: z.string(),
  infoCopy: z.string(),
  info: contactInfoInnerSchema,
  infoFooter: z.string(),
});

const contactInfoSchema = z.object({
  mobile: z.string(),
  phone: z.string(),
  address: z.string(),
  message: z.string(),
});

const contactLocationSchema = z.object({ smTitle: z.string(), lgTitle: z.string() });

const contactSectionSchema = z.object({
  meta: metaSchema,
  title: z.string(),
  headerSubtitle: z.string(),
  smTitle: z.string(),
  lgTitle: z.string(),
  card: contactCardSchema,
  form: contactFormSchema,
  info: contactInfoSchema,
  location: contactLocationSchema,
});

// ── Top-level Locale Schema ──────────────────────────────────────────────────

export const localeSchema = z.object({
  helplineTitle: z.string(),
  helplineNumber: z.string(),
  validations: validationsSchema,
  nav: navSchema,
  language: z.string(),
  selectLanguage: z.string(),
  home: homeSectionSchema,
  tours: toursSectionSchema,
  excursion: excursionSectionSchema,
  about: aboutSectionSchema,
  contact: contactSectionSchema,
  footer: z.record(z.string(), z.unknown()),
  video: z.record(z.string(), z.unknown()),
  button: z.string(),
  locale: z.string(),
  script: z.string(),
  calendar: z.record(z.string(), z.unknown()),
  booking: z.record(z.string(), z.unknown()),
  legal: z.record(z.string(), z.unknown()),
  notFound: z.record(z.string(), z.unknown()),
  cookieConsent: z.record(z.string(), z.unknown()).optional(),
});

export type LocaleData = z.infer<typeof localeSchema>;

/** Validates a locale JSON object against the schema. Throws if the structure is invalid. */
export function validateLocale(data: unknown, locale: string): asserts data is LocaleData {
  const result = localeSchema.safeParse(data);
  if (result.success) return;

  const issues = result.error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`);
  throw new Error(`Locale "${locale}" is invalid:\n${issues.join("\n")}`);
}

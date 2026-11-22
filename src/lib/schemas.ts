import { z } from "astro/zod";
import { LOCALES } from "@/i18n/locales";
import type { Messages } from "@/i18n/types";

export type ValidationTranslator = (key: `validations.${keyof Messages["validations"]}`) => string;

const phoneRegex = /^\+?[0-9\s().-]{7,25}$/;
const hasMinimumDigits = (value: string): boolean => value.replaceAll(/\D/g, "").length >= 7;

const casablancaDateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Casablanca" });

function getCasablancaTodayIso(): string {
  return casablancaDateFormatter.format(new Date());
}

const nameField = (t: ValidationTranslator) =>
  z
    .string()
    .trim()
    .min(2, { error: t("validations.nameMin") })
    .max(100, { error: t("validations.nameTooLong") });

const emailField = (t: ValidationTranslator) =>
  z
    .email({ error: t("validations.emailInvalid") })
    .max(254, { error: t("validations.emailInvalid") });

const phoneField = (t: ValidationTranslator) =>
  z
    .string()
    .trim()
    .max(25, { error: t("validations.phoneTooLong") })
    .regex(phoneRegex, { error: t("validations.phoneInvalid") })
    .refine(hasMinimumDigits, { error: t("validations.phoneInvalid") });

const recaptchaField = (t: ValidationTranslator) =>
  z.object({
    recaptchaToken: z
      .string()
      .trim()
      .min(1, { error: t("validations.recaptchaRequired") })
      .max(2048),
  });

const buildContactSchema = (t: ValidationTranslator) =>
  z
    .object({
      name: nameField(t),
      email: emailField(t),
      phone: phoneField(t),
      topic: z
        .string()
        .trim()
        .max(200, { error: t("validations.topicTooLong") })
        .transform((v) => (v.length > 0 ? v : undefined))
        .optional(),
      message: z
        .string()
        .trim()
        .min(10, { error: t("validations.messageMin") })
        .max(1000, { error: t("validations.messageTooLong") }),
    })
    .extend(recaptchaField(t).shape);

export type ContactSchema = ReturnType<typeof buildContactSchema>;
const contactSchemaCache = new WeakMap<ValidationTranslator, ContactSchema>();
export const getContactSchema = (t: ValidationTranslator): ContactSchema => {
  const cached = contactSchemaCache.get(t);
  if (cached) return cached;
  const schema = buildContactSchema(t);
  contactSchemaCache.set(t, schema);
  return schema;
};

const buildNewsletterSchema = (t: ValidationTranslator) =>
  z.object({ name: nameField(t), email: emailField(t) }).extend(recaptchaField(t).shape);

export type NewsletterSchema = ReturnType<typeof buildNewsletterSchema>;
const newsletterSchemaCache = new WeakMap<ValidationTranslator, NewsletterSchema>();
export const getNewsletterSchema = (t: ValidationTranslator): NewsletterSchema => {
  const cached = newsletterSchemaCache.get(t);
  if (cached) return cached;
  const schema = buildNewsletterSchema(t);
  newsletterSchemaCache.set(t, schema);
  return schema;
};

const buildBookingSchema = (t: ValidationTranslator) =>
  z
    .object({
      reservationType: z
        .string()
        .trim()
        .min(1, { error: t("validations.reservationRequired") })
        .max(150, { error: t("validations.topicTooLong") }),
      fullName: nameField(t),
      email: emailField(t),
      phone: phoneField(t),
      persons: z.coerce
        .number()
        .int()
        .min(1, { error: t("validations.personsMin") })
        .max(50, { error: t("validations.personsMax") }),
      date: z.iso
        .date({ error: t("validations.invalidDate") })
        .refine((value) => value >= getCasablancaTodayIso(), { error: t("validations.datePast") }),
      message: z
        .string()
        .trim()
        .max(1000, { error: t("validations.messageTooLong") })
        .transform((value) => (value.length > 0 ? value : undefined))
        .optional(),
      language: z.enum(LOCALES).optional(),
      duration: z.coerce.number().int().min(1).max(30).optional(),
    })
    .extend(recaptchaField(t).shape);

export type BookingSchema = ReturnType<typeof buildBookingSchema>;
const bookingSchemaCache = new WeakMap<ValidationTranslator, BookingSchema>();
export const getBookingSchema = (t: ValidationTranslator): BookingSchema => {
  const cached = bookingSchemaCache.get(t);
  if (cached) return cached;
  const schema = buildBookingSchema(t);
  bookingSchemaCache.set(t, schema);
  return schema;
};

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
    .min(2, { message: t("validations.nameMin") })
    .max(100, { message: t("validations.nameTooLong") });

const emailField = (t: ValidationTranslator) =>
  z
    .email({ message: t("validations.emailInvalid") })
    .max(254, { message: t("validations.emailInvalid") });

const phoneField = (t: ValidationTranslator) =>
  z
    .string()
    .trim()
    .max(25, { message: t("validations.phoneTooLong") })
    .regex(phoneRegex, { message: t("validations.phoneInvalid") })
    .refine(hasMinimumDigits, { message: t("validations.phoneInvalid") });

const recaptchaField = (t: ValidationTranslator) =>
  z.object({
    recaptchaToken: z.string().trim().min(1, t("validations.recaptchaRequired")).max(2048),
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
        .max(200, { message: t("validations.topicTooLong") })
        .transform((v) => (v.length > 0 ? v : undefined))
        .optional(),
      message: z
        .string()
        .trim()
        .min(10, { message: t("validations.messageMin") })
        .max(1000, { message: t("validations.messageTooLong") }),
    })
    .extend(recaptchaField(t).shape);

export type ContactSchema = ReturnType<typeof buildContactSchema>;
export const getContactSchema = (t: ValidationTranslator): ContactSchema => buildContactSchema(t);

const buildNewsletterSchema = (t: ValidationTranslator) =>
  z.object({ name: nameField(t), email: emailField(t) }).extend(recaptchaField(t).shape);

export type NewsletterSchema = ReturnType<typeof buildNewsletterSchema>;
export const getNewsletterSchema = (t: ValidationTranslator): NewsletterSchema =>
  buildNewsletterSchema(t);

const buildBookingSchema = (t: ValidationTranslator) =>
  z
    .object({
      reservationType: z
        .string()
        .trim()
        .min(1, { message: t("validations.reservationRequired") })
        .max(150, { message: t("validations.topicTooLong") }),
      fullName: nameField(t),
      email: emailField(t),
      phone: phoneField(t),
      persons: z.coerce
        .number()
        .int()
        .min(1, { message: t("validations.personsMin") })
        .max(50, { message: t("validations.personsMax") }),
      date: z.iso
        .date({ message: t("validations.invalidDate") })
        .refine((value) => value >= getCasablancaTodayIso(), {
          message: t("validations.datePast"),
        }),
      message: z
        .string()
        .trim()
        .max(1000, { message: t("validations.messageTooLong") })
        .transform((value) => (value.length > 0 ? value : undefined))
        .optional(),
      language: z.enum(LOCALES).optional(),
      duration: z.coerce.number().int().min(1).max(30).optional(),
    })
    .extend(recaptchaField(t).shape);

export type BookingSchema = ReturnType<typeof buildBookingSchema>;
export const getBookingSchema = (t: ValidationTranslator): BookingSchema => buildBookingSchema(t);

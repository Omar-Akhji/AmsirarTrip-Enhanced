import { z } from "astro/zod";
import { LOCALES } from "@/i18n/locales";

const phoneRegex = /^\+?[0-9\s().-]{7,25}$/;
const hasMinimumDigits = (value: string): boolean => value.replaceAll(/\D/g, "").length >= 7;

const RecaptchaSchema = (t: (key: string) => string) =>
  z.object({ recaptchaToken: z.string().trim().min(1, t("recaptchaRequired")).max(2048) });

function buildContactSchema(t: (key: string) => string) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(2, { message: t("nameMin") })
        .max(100, { message: t("nameTooLong") }),
      email: z.email({ message: t("emailInvalid") }).max(254, { message: t("emailInvalid") }),
      phone: z
        .string()
        .trim()
        .max(25, { message: t("phoneTooLong") })
        .regex(phoneRegex, { message: t("phoneInvalid") })
        .refine(hasMinimumDigits, { message: t("phoneInvalid") }),
      topic: z
        .string()
        .trim()
        .max(200, { message: t("topicTooLong") })
        .optional()
        .transform((v) => (v && v.length > 0 ? v : undefined)),
      message: z
        .string()
        .trim()
        .min(10, { message: t("messageMin") })
        .max(1000, { message: t("messageTooLong") }),
    })
    .extend(RecaptchaSchema(t).shape);
}

export type ContactSchema = ReturnType<typeof buildContactSchema>;
export const getContactSchema = (t: (key: string) => string): ContactSchema =>
  buildContactSchema(t);

function buildNewsletterSchema(t: (key: string) => string) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(2, { message: t("nameMin") })
        .max(100, { message: t("nameTooLong") }),
      email: z.email({ message: t("emailInvalid") }).max(254, { message: t("emailInvalid") }),
    })
    .extend(RecaptchaSchema(t).shape);
}

export type NewsletterSchema = ReturnType<typeof buildNewsletterSchema>;
export const getNewsletterSchema = (t: (key: string) => string): NewsletterSchema =>
  buildNewsletterSchema(t);

function buildBookingSchema(t: (key: string) => string) {
  return z
    .object({
      reservationType: z
        .string()
        .trim()
        .min(1, { message: t("reservationRequired") })
        .max(100, { message: t("reservationRequired") }),
      fullName: z
        .string()
        .trim()
        .min(2, { message: t("nameMin") })
        .max(100, { message: t("nameTooLong") }),
      email: z.email({ message: t("emailInvalid") }).max(254, { message: t("emailInvalid") }),
      phone: z
        .string()
        .trim()
        .max(25, { message: t("phoneTooLong") })
        .regex(phoneRegex, { message: t("phoneInvalid") })
        .refine(hasMinimumDigits, { message: t("phoneInvalid") }),
      persons: z.coerce
        .number()
        .int()
        .min(1, { message: t("personsMin") })
        .max(50, { message: t("personsMax") }),
      date: z
        .string()
        .trim()
        .max(50, { message: t("invalidDate") })
        .refine((value) => !Number.isNaN(Date.parse(value)), { message: t("invalidDate") })
        .refine(
          (value) => {
            const parsed = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return parsed >= today;
          },
          { message: t("datePast") },
        ),
      message: z
        .string()
        .trim()
        .max(1000, { message: t("messageTooLong") })
        .optional()
        .transform((value) => (value && value.length > 0 ? value : undefined)),
      language: z.enum(LOCALES).optional(),
      duration: z.coerce.number().int().min(1).max(30).optional(),
    })
    .extend(RecaptchaSchema(t).shape);
}

export type BookingSchema = ReturnType<typeof buildBookingSchema>;
export const getBookingSchema = (t: (key: string) => string): BookingSchema =>
  buildBookingSchema(t);

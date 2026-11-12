import { z } from "astro/zod";

const sanitize = (value: string) => value.trim();

const phoneRegex = /^\+?[0-9\s().-]{7,25}$/;

const RecaptchaSchema = (t: (key: string) => string) =>
  z.object({ recaptchaToken: z.string().min(1, t("recaptchaRequired")) });

function buildContactSchema(t: (key: string) => string) {
  return z
    .object({
      name: z
        .string()
        .min(2, { message: t("nameMin") })
        .max(100, { message: t("nameTooLong") })
        .transform(sanitize),
      email: z.email({ message: t("emailInvalid") }).transform(sanitize),
      phone: z
        .string()
        .regex(phoneRegex, { message: t("phoneInvalid") })
        .max(25, { message: t("phoneTooLong") })
        .transform(sanitize),
      topic: z
        .string()
        .max(200, { message: t("topicTooLong") })
        .optional()
        .transform((v) => (v ? sanitize(v) : undefined)),
      message: z
        .string()
        .min(10, { message: t("messageMin") })
        .max(1000, { message: t("messageTooLong") })
        .transform(sanitize),
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
        .min(2, { message: t("nameMin") })
        .max(100, { message: t("nameTooLong") })
        .transform(sanitize),
      email: z.email({ message: t("emailInvalid") }).transform(sanitize),
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
        .min(1, { message: t("reservationRequired") })
        .max(100, { message: t("reservationRequired") })
        .transform(sanitize),
      fullName: z
        .string()
        .min(2, { message: t("nameMin") })
        .max(100, { message: t("nameTooLong") })
        .transform(sanitize),
      email: z.email({ message: t("emailInvalid") }).transform(sanitize),
      phone: z
        .string()
        .regex(phoneRegex, { message: t("phoneInvalid") })
        .max(25, { message: t("phoneTooLong") })
        .transform(sanitize),
      persons: z.coerce
        .number()
        .int()
        .min(1, { message: t("personsMin") })
        .max(50, { message: t("personsMax") }),
      date: z
        .string()
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
        .max(1000, { message: t("messageTooLong") })
        .optional()
        .transform((value) => (value ? sanitize(value) : undefined)),
      language: z
        .string()
        .max(10)
        .optional()
        .transform((value) => (value ? sanitize(value) : undefined)),
      duration: z.coerce.number().int().min(1).max(30).optional(),
    })
    .extend(RecaptchaSchema(t).shape);
}

export type BookingSchema = ReturnType<typeof buildBookingSchema>;
export const getBookingSchema = (t: (key: string) => string): BookingSchema =>
  buildBookingSchema(t);

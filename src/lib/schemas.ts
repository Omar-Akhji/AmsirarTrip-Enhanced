import { z } from "zod";

const sanitize = (value: string) => value.trim();

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

const RecaptchaSchema = (t: (key: string) => string) =>
  z.object({ recaptchaToken: z.string().min(1, t("recaptchaRequired")) });

export const getContactSchema = (t: (key: string) => string) =>
  z
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
        .max(20, { message: t("phoneTooLong") })
        .transform(sanitize),
      message: z
        .string()
        .min(10, { message: t("messageMin") })
        .max(1000, { message: t("messageTooLong") })
        .transform(sanitize),
    })
    .extend(RecaptchaSchema(t).shape);

export const getNewsletterSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z
        .string()
        .min(2, { message: t("nameMin") })
        .max(100, { message: t("nameTooLong") })
        .transform(sanitize),
      email: z.email({ message: t("emailInvalid") }).transform(sanitize),
    })
    .extend(RecaptchaSchema(t).shape);

export const getBookingSchema = (t: (key: string) => string) =>
  z
    .object({
      reservationType: z
        .string()
        .min(1, { message: t("reservationRequired") })
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
        .max(20, { message: t("phoneTooLong") })
        .transform(sanitize),
      persons: z.coerce
        .number()
        .int()
        .min(1, { message: t("personsMin") })
        .max(50, { message: t("personsMax") }),
      date: z
        .string()
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
        .optional()
        .transform((value) => (value ? sanitize(value) : undefined)),
      duration: z.coerce.number().int().min(1).max(30).optional(),
    })
    .extend(RecaptchaSchema(t).shape);

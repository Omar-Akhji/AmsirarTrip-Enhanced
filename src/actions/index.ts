import { defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro/zod";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "../i18n/locales";
import { useTranslations as getTranslations, type TranslationFunction } from "../i18n/utils";
import { extractClientIp } from "../lib/api-utils";
import type { FormState } from "../lib/form-types";
import { getBookingSchema, getContactSchema } from "../lib/schemas";
import { sendTransactionalEmail } from "../services/email";
import { logger } from "../services/logger";
import { enforceRateLimit, isHoneypotTriggered, verifyCaptcha } from "./helpers/action-guards";
import {
  buildBookingEmail,
  buildContactEmail,
  buildNewsletterEmail,
} from "./helpers/email-templates";
import {
  createErrorResponse,
  extractZodErrors,
  getFormString,
  getOptionalFormString,
} from "./helpers/form-helpers";

export type NewsletterStatusKey =
  | "footer.newsletterSuccess"
  | "footer.newsletterRateLimited"
  | "footer.newsletterCaptchaError"
  | "footer.newsletterFailure";

export type NewsletterResult =
  | { readonly ok: true; readonly statusKey: "footer.newsletterSuccess" }
  | {
      readonly ok: false;
      readonly statusKey: Exclude<NewsletterStatusKey, "footer.newsletterSuccess">;
    };

function resolveActionLocale(rawLanguage: string | undefined, context: ActionAPIContext): Locale {
  if (rawLanguage && isLocale(rawLanguage)) return rawLanguage;
  if (context.currentLocale && isLocale(context.currentLocale)) return context.currentLocale;
  return DEFAULT_LOCALE;
}

interface FormActionGuardResult {
  readonly ip: string;
  readonly language: Locale;
  readonly earlyResponse?: FormState;
  readonly t: TranslationFunction;
}

function runFormGuards(
  formData: FormData,
  context: ActionAPIContext,
  actionName: "booking" | "contact",
  honeypotMessageKey: "booking.success" | "contact.form.success",
): FormActionGuardResult {
  const language = resolveActionLocale(getOptionalFormString(formData, "language"), context);
  const t = getTranslations(language);
  const ip = extractClientIp(
    context.request,
    context.clientAddress,
    context.locals.isCloudflareVerified,
  );

  if (!enforceRateLimit(`${actionName}:${ip}`, ip, `${actionName}-action`, 10).allowed) {
    return {
      ip,
      language,
      t,
      earlyResponse: { success: false, message: t("contact.form.errors.rateLimit") },
    };
  }

  if (isHoneypotTriggered(getFormString(formData, "website"), ip, `${actionName}-action`)) {
    return { ip, language, t, earlyResponse: { success: true, message: t(honeypotMessageKey) } };
  }

  return { ip, language, t };
}

export const server = {
  booking: defineAction({
    accept: "form",
    handler: async (formData: FormData, context: ActionAPIContext): Promise<FormState> => {
      const guard = runFormGuards(formData, context, "booking", "booking.success");
      if (guard.earlyResponse) return guard.earlyResponse;
      const { ip, language, t } = guard;

      try {
        const rawData = {
          reservationType: getFormString(formData, "reservationType"),
          fullName: getFormString(formData, "fullName"),
          email: getFormString(formData, "email"),
          phone: getFormString(formData, "phone"),
          persons: getFormString(formData, "numberOfPeople"),
          date: getFormString(formData, "reservationDate"),
          message: getFormString(formData, "message"),
          language,
          duration: getOptionalFormString(formData, "duration"),
          recaptchaToken: getFormString(formData, "recaptchaToken"),
        };

        const validationResult = getBookingSchema(t).safeParse(rawData);
        if (!validationResult.success) {
          return {
            success: false,
            message: t("contact.form.errors.validation"),
            errors: extractZodErrors(validationResult.error.issues),
          };
        }

        const data = validationResult.data;
        if (!(await verifyCaptcha(data.recaptchaToken, ip, "booking"))) {
          return { success: false, message: t("booking.errors.captcha") };
        }

        const emailContent = buildBookingEmail(data);
        await sendTransactionalEmail({ category: "Bookings", ...emailContent });

        return { success: true, message: t("booking.success") };
      } catch (error) {
        return createErrorResponse(error, "Booking form submission", t("booking.errors.generic"));
      }
    },
  }),

  contact: defineAction({
    accept: "form",
    handler: async (formData: FormData, context: ActionAPIContext): Promise<FormState> => {
      const guard = runFormGuards(formData, context, "contact", "contact.form.success");
      if (guard.earlyResponse) return guard.earlyResponse;
      const { ip, t } = guard;

      try {
        const rawData = {
          name: getFormString(formData, "name"),
          email: getFormString(formData, "email"),
          phone: getFormString(formData, "phone"),
          topic: getOptionalFormString(formData, "topic"),
          message: getFormString(formData, "message"),
          recaptchaToken: getFormString(formData, "recaptchaToken"),
        };

        const validationResult = getContactSchema(t).safeParse(rawData);
        if (!validationResult.success) {
          return {
            success: false,
            message: t("contact.form.errors.validation"),
            errors: extractZodErrors(validationResult.error.issues),
          };
        }

        const data = validationResult.data;
        if (!(await verifyCaptcha(data.recaptchaToken, ip, "contact"))) {
          return { success: false, message: t("contact.form.errors.captcha") };
        }

        const emailContent = buildContactEmail(data);
        await sendTransactionalEmail({ category: "Contact", ...emailContent });

        return { success: true, message: t("contact.form.success") };
      } catch (error) {
        return createErrorResponse(
          error,
          "Contact form submission",
          t("contact.form.errors.generic"),
        );
      }
    },
  }),

  newsletter: defineAction({
    accept: "json",
    input: z.object({
      email: z.email().max(254),
      language: z.enum(LOCALES).optional(),
      name: z.string().trim().min(2).max(100),
      recaptchaToken: z.string().trim().min(1).max(2048),
    }),
    handler: async (input, context: ActionAPIContext): Promise<NewsletterResult> => {
      try {
        const ip = extractClientIp(
          context.request,
          context.clientAddress,
          context.locals.isCloudflareVerified,
        );

        if (!enforceRateLimit(`newsletter:${ip}`, ip, "newsletter-action", 5).allowed) {
          return { ok: false, statusKey: "footer.newsletterRateLimited" };
        }

        if (!(await verifyCaptcha(input.recaptchaToken, ip, "newsletter"))) {
          return { ok: false, statusKey: "footer.newsletterCaptchaError" };
        }

        const emailContent = buildNewsletterEmail({ name: input.name, email: input.email });
        await sendTransactionalEmail({ category: "Newsletter", ...emailContent });

        return { ok: true, statusKey: "footer.newsletterSuccess" };
      } catch (error) {
        logger.error("Newsletter submission error", error);
        return { ok: false, statusKey: "footer.newsletterFailure" };
      }
    },
  }),
};

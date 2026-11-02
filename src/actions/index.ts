import { defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro/zod";
import { useTranslations as getTranslations } from "../i18n/utils";
import { createErrorResponse, type FormState } from "../lib/form-types";
import { getBookingSchema, getContactSchema, getNewsletterSchema } from "../lib/schemas";
import { logger } from "../lib/server-utils";
import { sendTransactionalEmail } from "../services/email";
import {
  enforceRateLimit,
  extractClientIp,
  isHoneypotTriggered,
  verifyCaptcha,
} from "./helpers/action-guards";
import {
  buildBookingEmail,
  buildContactEmail,
  buildNewsletterEmail,
} from "./helpers/email-templates";
import { extractZodErrors, getFormString, getOptionalFormString } from "./helpers/form-helpers";

export const server = {
  booking: defineAction({
    accept: "form",
    handler: async (formData: FormData, context: ActionAPIContext): Promise<FormState> => {
      try {
        const ip = extractClientIp(context.request, context.clientAddress);

        if (isHoneypotTriggered(getFormString(formData, "website"), ip, "booking-action")) {
          return { success: true, message: "Booking request sent!" };
        }

        if (!enforceRateLimit(`booking:${ip}`, ip, "booking-action", 10).allowed) {
          return { success: false, message: "Too many requests. Please try again later." };
        }

        const formLang = getOptionalFormString(formData, "language");
        const language = formLang ?? context.currentLocale ?? "en";
        const t = getTranslations(language);

        const rawData = {
          reservationType: getFormString(formData, "reservationType"),
          fullName: getFormString(formData, "fullName"),
          email: getFormString(formData, "email"),
          phone: getFormString(formData, "phone"),
          persons: formData.get("numberOfPeople"),
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
            message: "Please check the form for errors",
            errors: extractZodErrors(validationResult.error.issues),
          };
        }

        const data = validationResult.data;

        if (!(await verifyCaptcha(data.recaptchaToken, ip, "booking-action"))) {
          return { success: false, message: "Security verification failed. Please try again." };
        }

        const emailContent = buildBookingEmail(data);
        await sendTransactionalEmail({ category: "Bookings", ...emailContent });

        return { success: true, message: "Your booking request has been sent successfully!" };
      } catch (error) {
        return createErrorResponse(error, "Booking form submission");
      }
    },
  }),

  contact: defineAction({
    accept: "form",
    handler: async (formData: FormData, context: ActionAPIContext): Promise<FormState> => {
      try {
        const ip = extractClientIp(context.request, context.clientAddress);

        if (isHoneypotTriggered(getFormString(formData, "website"), ip, "contact-action")) {
          return { success: true, message: "Message sent!" };
        }

        if (!enforceRateLimit(`contact:${ip}`, ip, "contact-action", 10).allowed) {
          return { success: false, message: "Too many requests. Please try again later." };
        }

        const language = context.currentLocale ?? "en";
        const t = getTranslations(language);

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
            message: "Please check the form for errors",
            errors: extractZodErrors(validationResult.error.issues),
          };
        }

        const data = validationResult.data;

        if (!(await verifyCaptcha(data.recaptchaToken, ip, "contact-action"))) {
          return { success: false, message: "Security verification failed. Please try again." };
        }

        const emailContent = buildContactEmail(data);
        await sendTransactionalEmail({ category: "Contact", ...emailContent });

        return { success: true, message: "Message sent! We will reply within 24 hours." };
      } catch (error) {
        return createErrorResponse(error, "Contact form submission");
      }
    },
  }),

  newsletter: defineAction({
    accept: "json",
    input: z.object({ name: z.string(), email: z.email(), recaptchaToken: z.string() }),
    handler: async (
      input,
      context: ActionAPIContext,
    ): Promise<{ ok: boolean; statusKey: string }> => {
      try {
        const ip = extractClientIp(context.request, context.clientAddress);

        if (!enforceRateLimit(`newsletter:${ip}`, ip, "newsletter-action", 5).allowed) {
          return { ok: false, statusKey: "footer.newsletterNetwork" };
        }

        const language = context.currentLocale ?? "en";
        const t = getTranslations(language);
        const validationResult = getNewsletterSchema(t).safeParse(input);

        if (!validationResult.success) {
          return { ok: false, statusKey: "footer.newsletterFailure" };
        }

        const data = validationResult.data;

        if (!(await verifyCaptcha(data.recaptchaToken, ip, "newsletter-action"))) {
          return { ok: false, statusKey: "footer.newsletterCaptchaError" };
        }

        const emailContent = buildNewsletterEmail(data);
        await sendTransactionalEmail({ category: "Newsletter", ...emailContent });

        return { ok: true, statusKey: "footer.newsletterSuccess" };
      } catch (error) {
        logger.error("Newsletter submission error", error);
        return { ok: false, statusKey: "footer.newsletterFailure" };
      }
    },
  }),
};

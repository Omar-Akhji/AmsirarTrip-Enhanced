import { defineAction, type ActionAPIContext } from "astro:actions";
import { DEFAULT_LOCALE, isLocale, type Locale } from "../i18n/locales";
import { useTranslations as getTranslations, type TranslationFunction } from "../i18n/utils";
import { extractClientIp } from "../lib/api-utils";
import type { FormState } from "../lib/form-types";
import { getBookingSchema, getContactSchema, getNewsletterSchema } from "../lib/schemas";
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
  resolveContactTopic,
  resolveSubmittedPhone,
  resolveTurnstileToken,
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

interface ActionGuardResult {
  readonly blockReason?: "honeypot" | "rateLimit";
  readonly ip: string;
  readonly language: Locale;
  readonly t: TranslationFunction;
}

function runActionGuards(
  website: string,
  rawLanguage: string | undefined,
  context: ActionAPIContext,
  actionName: "booking" | "contact" | "newsletter",
): ActionGuardResult {
  const language = resolveActionLocale(rawLanguage, context);
  const t = getTranslations(language);
  const ip = extractClientIp({
    clientAddress: context.clientAddress,
    isCloudflareVerified: context.locals.isCloudflareVerified,
    request: context.request,
  });
  const maxRequests = actionName === "newsletter" ? 5 : 10;

  if (
    !enforceRateLimit({
      actionName: `${actionName}-action`,
      ip,
      key: `${actionName}:${ip}`,
      maxRequests,
    }).allowed
  ) {
    return { blockReason: "rateLimit", ip, language, t };
  }

  if (isHoneypotTriggered({ actionName: `${actionName}-action`, ip, value: website })) {
    return { blockReason: "honeypot", ip, language, t };
  }

  return { ip, language, t };
}

function getBlockedFormResponse(
  blockReason: "honeypot" | "rateLimit",
  t: TranslationFunction,
  honeypotMessageKey: "booking.success" | "contact.form.success",
): FormState {
  return blockReason === "rateLimit" ?
      { success: false, message: t("contact.form.errors.rateLimit") }
    : { success: true, message: t(honeypotMessageKey) };
}

export const server = {
  booking: defineAction({
    accept: "form",
    handler: async (formData: FormData, context: ActionAPIContext): Promise<FormState> => {
      const guard = runActionGuards(
        getFormString(formData, "website"),
        getOptionalFormString(formData, "language"),
        context,
        "booking",
      );
      if (guard.blockReason) {
        return getBlockedFormResponse(guard.blockReason, guard.t, "booking.success");
      }
      const { ip, language, t } = guard;

      try {
        const rawData = {
          reservationType: getFormString(formData, "reservationType"),
          fullName: getFormString(formData, "fullName"),
          email: getFormString(formData, "email"),
          phone: resolveSubmittedPhone(formData),
          persons: getFormString(formData, "numberOfPeople"),
          date: getFormString(formData, "reservationDate"),
          message: getFormString(formData, "message"),
          language,
          duration: getOptionalFormString(formData, "duration"),
          recaptchaToken: resolveTurnstileToken(formData),
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
        if (!(await verifyCaptcha({ expectedAction: "booking", ip, token: data.recaptchaToken }))) {
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
      const guard = runActionGuards(
        getFormString(formData, "website"),
        getOptionalFormString(formData, "language"),
        context,
        "contact",
      );
      if (guard.blockReason) {
        return getBlockedFormResponse(guard.blockReason, guard.t, "contact.form.success");
      }
      const { ip, t } = guard;

      try {
        const rawData = {
          name: getFormString(formData, "name"),
          email: getFormString(formData, "email"),
          phone: resolveSubmittedPhone(formData),
          topic: resolveContactTopic(formData),
          message: getFormString(formData, "message"),
          recaptchaToken: resolveTurnstileToken(formData),
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
        if (!(await verifyCaptcha({ expectedAction: "contact", ip, token: data.recaptchaToken }))) {
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
    accept: "form",
    handler: async (formData: FormData, context: ActionAPIContext): Promise<NewsletterResult> => {
      try {
        const guard = runActionGuards(
          getFormString(formData, "website"),
          getOptionalFormString(formData, "language"),
          context,
          "newsletter",
        );
        if (guard.blockReason === "rateLimit") {
          return { ok: false, statusKey: "footer.newsletterRateLimited" };
        }
        if (guard.blockReason === "honeypot") {
          return { ok: true, statusKey: "footer.newsletterSuccess" };
        }

        const parsed = getNewsletterSchema(guard.t).safeParse({
          name: getFormString(formData, "name"),
          email: getFormString(formData, "email"),
          language: guard.language,
          recaptchaToken: resolveTurnstileToken(formData),
          website: getOptionalFormString(formData, "website"),
        });
        if (!parsed.success) {
          return { ok: false, statusKey: "footer.newsletterFailure" };
        }

        if (
          !(await verifyCaptcha({
            expectedAction: "newsletter",
            ip: guard.ip,
            token: parsed.data.recaptchaToken,
          }))
        ) {
          return { ok: false, statusKey: "footer.newsletterCaptchaError" };
        }

        const emailContent = buildNewsletterEmail({
          name: parsed.data.name,
          email: parsed.data.email,
        });
        await sendTransactionalEmail({ category: "Newsletter", ...emailContent });

        return { ok: true, statusKey: "footer.newsletterSuccess" };
      } catch (error) {
        logger.error("Newsletter submission error", error);
        return { ok: false, statusKey: "footer.newsletterFailure" };
      }
    },
  }),
};

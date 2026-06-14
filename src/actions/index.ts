import { defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro/zod";
import { useTranslations as getTranslations } from "../i18n/utils";
import { checkRateLimit } from "../lib/api-utils";
import { env } from "../lib/env";
import { createErrorResponse, type FormState } from "../lib/form-types";
import { getBookingSchema, getContactSchema, getNewsletterSchema } from "../lib/schemas";
import {
  createMailer,
  escapeHtml,
  logSuspiciousActivity,
  verifyRecaptcha,
} from "../lib/server-utils";

function getLanguageName(code: string = ""): string {
  const languages: Record<string, string> = {
    en: "English",
    fr: "Français",
    de: "Deutsch",
    es: "Español",
  };
  return languages[code] || code;
}

function cleanReservationType(type: string = ""): string {
  return type.replace(/^Tour\d+\s/, "");
}

export const server = {
  booking: defineAction({
    accept: "form",
    handler: async (formData: FormData, context: ActionAPIContext): Promise<FormState> => {
      try {
        const ip = context.clientAddress || "unknown";

        const honeypot = formData.get("website") as string;
        if (honeypot) {
          logSuspiciousActivity(ip, "HONEYPOT_TRIGGERED", "booking-action");
          return { success: true, message: "Booking request sent!" };
        }

        const rateLimit = checkRateLimit(ip, 10, 60_000);
        if (!rateLimit.allowed) {
          if (rateLimit.blocked) {
            logSuspiciousActivity(ip, "BLOCKED_ACTION", "booking-action");
          }
          return { success: false, message: "Too many requests. Please try again later." };
        }

        const language = (formData.get("language") as string) || context.currentLocale || "en";
        const t = getTranslations(language);

        const rawData = {
          reservationType: formData.get("reservationType") as string,
          fullName: formData.get("fullName") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
          persons: formData.get("numberOfPeople"),
          date: formData.get("reservationDate") as string,
          message: formData.get("message") as string,
          language: language,
          duration: formData.get("duration") || undefined,
          recaptchaToken: formData.get("recaptchaToken") as string,
        };

        const validationResult = getBookingSchema(t).safeParse(rawData);

        if (!validationResult.success) {
          const errors: Record<string, string> = {};
          for (const err of validationResult.error.issues) {
            const path = err.path[0] as string;
            errors[path] = err.message;
          }
          return { success: false, message: "Please check the form for errors", errors };
        }

        const data = validationResult.data;

        const host = context.request.headers.get("host")?.split(":", 1)[0] || "";
        if (!(await verifyRecaptcha(data.recaptchaToken, host))) {
          logSuspiciousActivity(ip, "CAPTCHA_FAILED", "booking-action");
          return { success: false, message: "Security verification failed. Please try again." };
        }

        const transporter = createMailer();
        const mailTo = env.MAIL_TO || env.GMAIL_USER;

        const html = `
          <h2>New Booking Request</h2>
          <p><strong>Website display language :</strong> ${escapeHtml(
            getLanguageName(data.language),
          )}</p>
          <p><strong>Type of reservation :</strong> ${escapeHtml(
            cleanReservationType(data.reservationType),
          )}</p>
          <p><strong>Duration :</strong> ${escapeHtml(
            data.duration ? `${data.duration} days` : "Not specified",
          )}</p>
          <p><strong>Full Name :</strong> ${escapeHtml(data.fullName)}</p>
          <p><strong>Phone Number :</strong> ${escapeHtml(data.phone)}</p>
          <p><strong>E-mail :</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Date of reservation :</strong> ${escapeHtml(data.date)}</p>
          <p><strong>Number of people :</strong> ${escapeHtml(String(data.persons))}</p>
          ${
            data.message ?
              `<p><strong>Message :</strong><br>${escapeHtml(data.message).replaceAll("\n", "<br>")}</p>`
            : ""
          }
        `;

        await transporter.sendMail({
          from: `Amsirar Trip Bookings <${env.GMAIL_USER}>`,
          to: mailTo,
          replyTo: data.email,
          subject: `Booking: ${data.fullName} (${cleanReservationType(data.reservationType)})`,
          text: `Website display language : ${getLanguageName(data.language)}
Type of reservation : ${cleanReservationType(data.reservationType)}
Duration : ${data.duration ? `${data.duration} days` : "Not specified"}
Full Name : ${data.fullName}
Phone Number : ${data.phone}
E-mail : ${data.email}
Date of reservation : ${data.date}
Number of people : ${data.persons}${data.message ? `\nMessage : ${data.message}` : ""}`,
          html,
        });

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
        const ip = context.clientAddress || "unknown";

        const honeypot = formData.get("website") as string;
        if (honeypot) {
          logSuspiciousActivity(ip, "HONEYPOT_TRIGGERED", "contact-action");
          return { success: true, message: "Message sent!" };
        }

        const rateLimit = checkRateLimit(ip, 10, 60_000);
        if (!rateLimit.allowed) {
          if (rateLimit.blocked) {
            logSuspiciousActivity(ip, "BLOCKED_ACTION", "contact-action");
          }
          return { success: false, message: "Too many requests. Please try again later." };
        }

        const language = context.currentLocale || "en";
        const t = getTranslations(language);

        const rawData = {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
          message: formData.get("message") as string,
          recaptchaToken: formData.get("recaptchaToken") as string,
        };

        const validationResult = getContactSchema(t).safeParse(rawData);

        if (!validationResult.success) {
          const errors: Record<string, string> = {};
          for (const err of validationResult.error.issues) {
            const path = err.path[0] as string;
            errors[path] = err.message;
          }
          return { success: false, message: "Please check the form for errors", errors };
        }

        const data = validationResult.data;
        const topic = formData.get("topic") as string;
        const messageContent = topic ? `${topic.trim()}\n\n${data.message}` : data.message;

        const host = context.request.headers.get("host")?.split(":", 1)[0] || "";
        if (!(await verifyRecaptcha(data.recaptchaToken, host))) {
          logSuspiciousActivity(ip, "CAPTCHA_FAILED", "contact-action");
          return { success: false, message: "Security verification failed. Please try again." };
        }

        const transporter = createMailer();
        const mailTo = env.MAIL_TO || env.GMAIL_USER;

        const html = `
          <h2>New Contact Message</h2>
          <p><strong>Name :</strong> ${escapeHtml(data.name)}</p>
          <p><strong>E-mail :</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Phone :</strong> ${escapeHtml(data.phone)}</p>
          <p><strong>Message :</strong><br>${escapeHtml(messageContent).replaceAll("\n", "<br>")}</p>
        `;

        await transporter.sendMail({
          from: `Amsirar Trip Contact <${env.GMAIL_USER}>`,
          to: mailTo,
          replyTo: data.email,
          subject: `Contact from ${data.name}`,
          text: `Name : ${data.name}\nE-mail : ${data.email}\nPhone : ${data.phone}\nMessage : \n${messageContent}`,
          html,
        });

        return { success: true, message: "Message sent! We will reply within 24 hours." };
      } catch (error) {
        return createErrorResponse(error, "Contact form submission");
      }
    },
  }),

  newsletter: defineAction({
    accept: "json",
    input: z.object({ name: z.string(), email: z.string(), recaptchaToken: z.string() }),
    handler: async (
      input,
      context: ActionAPIContext,
    ): Promise<{ ok: boolean; statusKey: string }> => {
      try {
        const ip = context.clientAddress || "unknown";

        const rateLimit = checkRateLimit(ip, 5, 60_000);
        if (!rateLimit.allowed) {
          if (rateLimit.blocked) {
            logSuspiciousActivity(ip, "BLOCKED_ACTION", "newsletter-action");
          }
          return { ok: false, statusKey: "footer.newsletterNetwork" };
        }

        const language = context.currentLocale || "en";
        const t = getTranslations(language);
        const validationResult = getNewsletterSchema(t).safeParse(input);

        if (!validationResult.success) {
          return { ok: false, statusKey: "footer.newsletterFailure" };
        }

        const data = validationResult.data;

        const host = context.request.headers.get("host")?.split(":", 1)[0] || "";
        if (!(await verifyRecaptcha(data.recaptchaToken, host))) {
          logSuspiciousActivity(ip, "CAPTCHA_FAILED", "newsletter-action");
          return { ok: false, statusKey: "footer.newsletterCaptchaError" };
        }

        const transporter = createMailer();
        const mailTo = env.MAIL_TO || env.GMAIL_USER;

        const safeName = data.name.replaceAll(/[^\p{L}\p{N}\s]/gu, "");

        const html = `
          <h2>New Newsletter Subscription</h2>
          <p><strong>Name :</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email :</strong> ${escapeHtml(data.email)}</p>
        `;

        await transporter.sendMail({
          from: `Amsirar Trip Newsletter <${env.GMAIL_USER}>`,
          to: mailTo,
          replyTo: data.email,
          subject: `Newsletter Subscription: ${safeName} (${data.email})`,
          text: `New newsletter subscription:\nName: ${data.name}\nEmail: ${data.email}`,
          html,
        });

        return { ok: true, statusKey: "footer.newsletterSuccess" };
      } catch (error) {
        console.error("Newsletter submission error:", error);
        return { ok: false, statusKey: "footer.newsletterFailure" };
      }
    },
  }),
};

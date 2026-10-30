import { escapeHtml } from "../../lib/server-utils";
import { cleanReservationType, getLanguageName, sanitizeHeaderValue } from "./form-helpers";

export interface BookingEmailInput {
  fullName: string;
  email: string;
  phone: string;
  reservationType: string;
  duration?: number | string | undefined;
  date: string;
  persons: number;
  message?: string | undefined;
  language?: string | undefined;
}

export interface ContactEmailInput {
  name: string;
  email: string;
  phone: string;
  topic?: string | undefined;
  message: string;
}

export interface NewsletterEmailInput {
  name: string;
  email: string;
}

export interface PreparedEmail {
  subject: string;
  replyTo: string;
  text: string;
  html: string;
}

export function buildBookingEmail(data: BookingEmailInput): PreparedEmail {
  const safeFullName = sanitizeHeaderValue(data.fullName, 100);
  const safeReservationType = sanitizeHeaderValue(cleanReservationType(data.reservationType), 100);
  const safeReplyTo = sanitizeHeaderValue(data.email, 254);
  const langName = getLanguageName(data.language);
  const cleanedType = cleanReservationType(data.reservationType);
  const durationText = data.duration ? `${data.duration} days` : "Not specified";

  const html = `
    <h2>New Booking Request</h2>
    <p><strong>Website display language :</strong> ${escapeHtml(langName)}</p>
    <p><strong>Type of reservation :</strong> ${escapeHtml(cleanedType)}</p>
    <p><strong>Duration :</strong> ${escapeHtml(durationText)}</p>
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

  const text = `Website display language : ${langName}
Type of reservation : ${cleanedType}
Duration : ${durationText}
Full Name : ${data.fullName}
Phone Number : ${data.phone}
E-mail : ${data.email}
Date of reservation : ${data.date}
Number of people : ${data.persons}${data.message ? `\nMessage : ${data.message}` : ""}`;

  return {
    subject: `Booking: ${safeFullName} (${safeReservationType})`,
    replyTo: safeReplyTo,
    text,
    html,
  };
}

export function buildContactEmail(data: ContactEmailInput): PreparedEmail {
  const safeContactName = sanitizeHeaderValue(data.name, 100);
  const safeReplyTo = sanitizeHeaderValue(data.email, 254);
  const messageContent =
    data.topic && data.topic.length > 0 ? `${data.topic}\n\n${data.message}` : data.message;

  const html = `
    <h2>New Contact Message</h2>
    <p><strong>Name :</strong> ${escapeHtml(data.name)}</p>
    <p><strong>E-mail :</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Phone :</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>Message :</strong><br>${escapeHtml(messageContent).replaceAll("\n", "<br>")}</p>
  `;

  const text = `Name : ${data.name}\nE-mail : ${data.email}\nPhone : ${data.phone}\nMessage : \n${messageContent}`;

  return { subject: `Contact from ${safeContactName}`, replyTo: safeReplyTo, text, html };
}

export function buildNewsletterEmail(data: NewsletterEmailInput): PreparedEmail {
  const safeName = sanitizeHeaderValue(data.name.replaceAll(/[^\p{L}\p{N}\s]/gu, ""), 100);
  const safeReplyTo = sanitizeHeaderValue(data.email, 254);

  const html = `
    <h2>New Newsletter Subscription</h2>
    <p><strong>Name :</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email :</strong> ${escapeHtml(data.email)}</p>
  `;

  const text = `New newsletter subscription:\nName: ${data.name}\nEmail: ${data.email}`;

  return {
    subject: `Newsletter Subscription: ${safeName} (${safeReplyTo})`,
    replyTo: safeReplyTo,
    text,
    html,
  };
}

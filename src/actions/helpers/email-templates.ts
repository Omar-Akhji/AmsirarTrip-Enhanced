import type { z } from "astro/zod";
import type { BookingSchema, ContactSchema, NewsletterSchema } from "@/lib/schemas";
import {
  BOOKING_EMAIL_ATTACHMENTS,
  CONTACT_EMAIL_ATTACHMENTS,
  EMAIL_CID,
  NEWSLETTER_EMAIL_ATTACHMENTS,
  type InlineCidAttachment,
} from "./email-assets";
import {
  cleanReservationType,
  escapeHtml,
  getLanguageName,
  sanitizeHeaderValue,
} from "./form-helpers";

export type BookingEmailInput = Omit<z.output<BookingSchema>, "recaptchaToken">;
export type ContactEmailInput = Omit<z.output<ContactSchema>, "recaptchaToken">;
export type NewsletterEmailInput = Omit<z.output<NewsletterSchema>, "recaptchaToken">;

export interface PreparedEmail {
  attachments?: readonly InlineCidAttachment[];
  html: string;
  replyTo: string;
  subject: string;
  text: string;
}

interface ActionButton {
  borderColor: string;
  color: string;
  href: string;
  iconSrc: string;
  label: string;
}

interface DetailRow {
  href?: string;
  isAccent?: boolean;
  label: string;
  linkColor?: string;
  value: string;
}

/** Strip non-digits and leading international trunk zeros (e.g. 00212... -> 212...) for wa.me */
function toWhatsAppDigits(phone: string): string {
  return phone.replaceAll(/\D/g, "").replace(/^0+/, "");
}

function buildContactActionButtons(
  safeReplyTo: string,
  phone: string,
  subject: string,
  waMessage: string,
): ActionButton[] {
  const waDigits = toWhatsAppDigits(phone);
  const waUrl = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waMessage)}` : "";

  return [
    {
      label: "Reply by Email",
      href: `mailto:${safeReplyTo}?subject=${encodeURIComponent(subject)}`,
      borderColor: "#ea580c",
      color: "#ea580c",
      iconSrc: `cid:${EMAIL_CID.emailIcon}`,
    },
    ...(waUrl ?
      [
        {
          label: "Chat on WhatsApp",
          href: waUrl,
          borderColor: "#16a34a",
          color: "#16a34a",
          iconSrc: `cid:${EMAIL_CID.whatsappIcon}`,
        },
      ]
    : []),
    {
      label: "Call Phone",
      href: `tel:${phone.replaceAll(/\s+/g, "")}`,
      borderColor: "#292524",
      color: "#292524",
      iconSrc: `cid:${EMAIL_CID.phoneIcon}`,
    },
  ];
}

function renderDetailTable(rows: readonly DetailRow[]): string {
  const rowsHtml = rows
    .map((row, index) => {
      const borderStyle = index < rows.length - 1 ? " border-bottom: 1px solid #e7e5e4;" : "";
      const valueColor = row.isAccent ? "#ea580c" : "#1c1917";
      const valueWeight = row.isAccent ? "700" : "600";
      const valueFontSize = row.isAccent ? "14.5px" : "13.5px";
      const escapedValue = escapeHtml(row.value);
      const renderedValue =
        row.href ?
          `<a href="${escapeHtml(row.href)}" style="color: ${row.linkColor ?? "#ea580c"}; text-decoration: none;">${escapedValue}</a>`
        : escapedValue;

      return `
      <tr>
        <td style="padding: 11px 16px;${borderStyle}">
          <div style="font-size: 11px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(row.label)}</div>
          <div style="font-size: ${valueFontSize}; font-weight: ${valueWeight}; color: ${valueColor}; margin-top: 3px; line-height: 1.35;">${renderedValue}</div>
        </td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">${rowsHtml}</table>`;
}

function renderSectionLabel(label: string): string {
  return `<div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #a8a29e; margin-bottom: 8px;">${escapeHtml(label)}</div>`;
}

function renderMessageBox(label: string, message: string): string {
  return `
    ${renderSectionLabel(label)}
    <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;">
      <p style="margin: 0; padding: 0; font-size: 13.5px; line-height: 1.55; color: #292524; white-space: pre-line;">${escapeHtml(message)}</p>
    </div>`;
}

function wrapEmailLayout({
  badgeText,
  badgeBg,
  badgeColor,
  badgeBorder,
  badgeIconSrc,
  headline,
  contentHtml,
  actionButtons,
  footerNote = "Direct notification from amsirartrip.com",
}: {
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  badgeIconSrc?: string | undefined;
  headline?: string | undefined;
  contentHtml: string;
  actionButtons: ActionButton[];
  footerNote?: string;
}): string {
  const buttonsHtml =
    actionButtons.length > 0 ?
      `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 22px 0 6px 0;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn-stack-table" style="margin: 0 auto; width: 100%;">
              <tr>
                ${actionButtons
                  .map(
                    (btn) => `
                  <td align="center" class="btn-stack-cell" style="padding: 4px 4px;">
                    <a href="${escapeHtml(btn.href)}" target="_blank" rel="noopener noreferrer" class="btn-responsive" style="display: block; background-color: transparent; border: 1.5px solid ${btn.borderColor}; color: ${btn.color}; font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; padding: 11px 14px; border-radius: 8px; line-height: 1.2; text-align: center;">
                      <img src="${escapeHtml(btn.iconSrc)}" width="15" height="15" alt="" style="vertical-align: -2px; margin-right: 6px; display: inline-block; border: 0;" />
                      <span>${escapeHtml(btn.label)}</span>
                    </a>
                  </td>
                `,
                  )
                  .join("")}
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(headline ?? badgeText)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Yellowtail&display=swap" rel="stylesheet" />
  <style type="text/css">
    body, table, td, p, a, span, h1, h2, h3 {
      font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    @media only screen and (max-width: 600px) {
      .email-main-table { width: 100%; max-width: 100%; }
      .email-header-cell { padding: 22px 14px 18px 14px; }
      .email-content-cell { padding: 22px 14px 18px 14px; }
      .email-footer-cell { padding: 16px 14px 22px 14px; }
      .btn-stack-table tr { display: block; width: 100%; }
      .btn-stack-cell { display: block; width: 100%; padding: 5px 0; box-sizing: border-box; }
      .btn-responsive { width: 100%; box-sizing: border-box; padding: 12px 14px; font-size: 13.5px; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; word-break: break-word;">
  <div style="display: none; font-size: 1px; color: #FAFAFA; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(headline ?? badgeText)} &bull; Amsirar Trip Morocco
  </div>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAFAFA; margin: 0; padding: 0; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 0; margin: 0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-main-table" style="max-width: 580px; margin: 0 auto; background-color: #FAFAFA;">
          <tr>
            <td class="email-header-cell" style="background-color: #020617; padding: 24px 20px 20px 20px; text-align: center; border-bottom: 3px solid #ea580c;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://amsirartrip.com" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block;">
                      <img src="cid:${EMAIL_CID.logo}" alt="AMSIRAR TRIP" width="165" height="70" style="display: block; margin: 0 auto; width: 165px; max-width: 100%; height: auto; border: 0;" />
                    </a>
                    <div style="font-size: 10.5px; letter-spacing: 1.2px; color: #a8a29e; text-transform: uppercase; margin-top: 6px; font-weight: 500;">
                      Morocco Tours, Travels &amp; Desert Adventures
                    </div>
                    <div style="margin-top: 12px;">
                      <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px;">
                        ${
                          badgeIconSrc ?
                            `<img src="${escapeHtml(badgeIconSrc)}" width="13" height="13" alt="" style="vertical-align: -2px; margin-right: 5px; display: inline-block; border: 0;" />`
                          : ""
                        }
                        <span style="vertical-align: middle;">${escapeHtml(badgeText)}</span>
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-content-cell" style="padding: 24px 20px 18px 20px; background-color: #FAFAFA;">
              ${
                headline ?
                  `<h1 style="margin: 0 0 16px 0; font-size: 19px; font-weight: 700; color: #1c1917; line-height: 1.3;">${escapeHtml(headline)}</h1>`
                : ""
              }
              ${contentHtml}
              ${buttonsHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 0 20px;"><div style="border-top: 1px solid #f0eeeb;"></div></td>
          </tr>
          <tr>
            <td class="email-footer-cell" style="padding: 16px 20px 24px 20px; background-color: #fafaf9; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11.5px; font-weight: 500; color: #78716c;">${escapeHtml(footerNote)}</p>
              <p style="margin: 0; font-size: 11.5px; color: #a8a29e;">&copy; ${new Date().getFullYear()} Amsirar Trip. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildBookingEmail(data: BookingEmailInput): PreparedEmail {
  const safeFullName = sanitizeHeaderValue(data.fullName, 100);
  const cleanedType = cleanReservationType(data.reservationType);
  const safeReservationType = sanitizeHeaderValue(cleanedType, 100);
  const safeReplyTo = sanitizeHeaderValue(data.email, 254);
  const langName = getLanguageName(data.language);

  let resolvedDuration = data.duration;
  if (!resolvedDuration && data.reservationType) {
    const match = /(\d+)[\s-]*(?:Days?|Jours?|Días?|Tage?)/i.exec(data.reservationType);
    const parsedDays = match?.[1] ? Number(match[1]) : undefined;
    if (parsedDays && !Number.isNaN(parsedDays)) {
      resolvedDuration = parsedDays;
    }
  }

  const durationText =
    resolvedDuration ?
      resolvedDuration === 1 ?
        "1 day (Day trip)"
      : `${resolvedDuration} days`
    : /excursion|day trip|discovery|sunset/i.test(data.reservationType) ? "1 day (Day trip)"
    : "Not specified";

  const waDigits = toWhatsAppDigits(data.phone);
  const waGreeting = `Hello ${data.fullName}, thank you for your booking request with Amsirar Trip regarding ${cleanedType}!`;
  const waUrl = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waGreeting)}` : "";

  const actionButtons = buildContactActionButtons(
    safeReplyTo,
    data.phone,
    `Re: Your Amsirar Trip Booking - ${cleanedType}`,
    waGreeting,
  );

  const phoneHref = `tel:${data.phone.replaceAll(/\s+/g, "")}`;
  const contentHtml = `
    ${renderSectionLabel("Reservation Details")}
    ${renderDetailTable([
      { label: "Tour / Experience", value: cleanedType, isAccent: true },
      { label: "Travel Date", value: data.date },
      { label: "Guests", value: `${data.persons} ${data.persons === 1 ? "person" : "people"}` },
      { label: "Duration", value: durationText },
      { label: "Site Language", value: langName },
    ])}
    ${renderSectionLabel("Guest Contact Details")}
    ${renderDetailTable([
      { label: "Full Name", value: data.fullName },
      { label: "Email Address", value: data.email, href: `mailto:${safeReplyTo}` },
      { label: "Phone / WhatsApp", value: data.phone, href: phoneHref, linkColor: "#1c1917" },
    ])}
    ${data.message ? renderMessageBox("Special Requests & Notes", data.message) : ""}
  `;

  const html = wrapEmailLayout({
    badgeText: "New Booking Request",
    badgeBg: "#fff7ed",
    badgeColor: "#c2410c",
    badgeBorder: "#ffedd5",
    badgeIconSrc: `cid:${EMAIL_CID.calendarBadge}`,
    headline: `Booking Request: ${safeFullName}`,
    contentHtml,
    actionButtons,
    footerNote: `Amsirar Trip Booking Notification • Language: ${langName}`,
  });

  const text = `================================================
AMSIRAR TRIP - NEW BOOKING REQUEST
================================================

TOUR DETAILS:
- Experience: ${cleanedType}
- Travel Date: ${data.date}
- Number of Guests: ${data.persons}
- Duration: ${durationText}
- Language: ${langName}

GUEST DETAILS:
- Full Name: ${data.fullName}
- Email: ${data.email}
- Phone: ${data.phone}
${data.message ? `\nSPECIAL REQUESTS:\n${data.message}\n` : ""}
------------------------------------------------
Reply directly to this email or message on WhatsApp: ${waUrl || data.phone}`;

  return {
    subject: `New Booking: ${safeFullName} (${safeReservationType})`,
    replyTo: safeReplyTo,
    text,
    html,
    attachments: BOOKING_EMAIL_ATTACHMENTS,
  };
}

export function buildContactEmail(data: ContactEmailInput): PreparedEmail {
  const safeContactName = sanitizeHeaderValue(data.name, 100);
  const safeReplyTo = sanitizeHeaderValue(data.email, 254);
  const safeTopic = data.topic ? sanitizeHeaderValue(data.topic, 100) : "";

  const waDigits = toWhatsAppDigits(data.phone);
  const waGreeting = `Hello ${data.name}, thank you for reaching out to Amsirar Trip!`;
  const waUrl = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waGreeting)}` : "";

  const actionButtons = buildContactActionButtons(
    safeReplyTo,
    data.phone,
    `Re: Your inquiry to Amsirar Trip${safeTopic ? ` - ${safeTopic}` : ""}`,
    waGreeting,
  );

  const senderRows: DetailRow[] = [
    { label: "Name", value: data.name },
    { label: "Email", value: data.email, href: `mailto:${safeReplyTo}` },
    {
      label: "Phone / WhatsApp",
      value: data.phone,
      href: `tel:${data.phone.replaceAll(/\s+/g, "")}`,
      linkColor: "#1c1917",
    },
    ...(safeTopic ? [{ label: "Subject / Topic", value: safeTopic, isAccent: true }] : []),
  ];

  const contentHtml = `
    ${renderSectionLabel("Sender Details")}
    ${renderDetailTable(senderRows)}
    ${renderMessageBox("Message", data.message)}
  `;

  const html = wrapEmailLayout({
    badgeText: "New Contact Message",
    badgeBg: "#f0fdf4",
    badgeColor: "#15803d",
    badgeBorder: "#dcfce7",
    badgeIconSrc: `cid:${EMAIL_CID.inboxBadge}`,
    contentHtml,
    actionButtons,
    footerNote: "Amsirar Trip Contact Form Notification",
  });

  const text = `================================================
AMSIRAR TRIP - NEW CONTACT INQUIRY
================================================

SENDER:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
${safeTopic ? `- Topic: ${safeTopic}\n` : ""}
MESSAGE:
${data.message}

------------------------------------------------
Reply directly to this email or message on WhatsApp: ${waUrl || data.phone}`;

  return {
    subject: `Contact: ${safeContactName}${safeTopic ? ` - ${safeTopic}` : ""}`,
    replyTo: safeReplyTo,
    text,
    html,
    attachments: CONTACT_EMAIL_ATTACHMENTS,
  };
}

export function buildNewsletterEmail(data: NewsletterEmailInput): PreparedEmail {
  const safeName = sanitizeHeaderValue(data.name.replaceAll(/[^\p{L}\p{N}\s]/gu, ""), 100);
  const safeReplyTo = sanitizeHeaderValue(data.email, 254);

  const actionButtons: ActionButton[] = [
    {
      label: "Email Subscriber",
      href: `mailto:${safeReplyTo}?subject=${encodeURIComponent("Welcome to Amsirar Trip Newsletter")}`,
      borderColor: "#ea580c",
      color: "#ea580c",
      iconSrc: `cid:${EMAIL_CID.emailIcon}`,
    },
  ];

  const contentHtml = renderDetailTable([
    { label: "Subscriber Name", value: data.name },
    { label: "Email Address", value: data.email, href: `mailto:${safeReplyTo}` },
  ]);

  const html = wrapEmailLayout({
    badgeText: "New Subscriber",
    badgeBg: "#fef9c3",
    badgeColor: "#854d0e",
    badgeBorder: "#fef08a",
    headline: `New Newsletter Subscriber: ${safeName}`,
    contentHtml,
    actionButtons,
    footerNote: "Amsirar Trip Newsletter System",
  });

  const text = `================================================
AMSIRAR TRIP - NEW NEWSLETTER SUBSCRIBER
================================================
Name: ${data.name}
Email: ${data.email}
------------------------------------------------`;

  return {
    subject: `Newsletter: ${safeName} (${safeReplyTo})`,
    replyTo: safeReplyTo,
    text,
    html,
    attachments: NEWSLETTER_EMAIL_ATTACHMENTS,
  };
}

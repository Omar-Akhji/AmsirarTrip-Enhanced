import { escapeHtml } from "../../lib/server-utils";
import {
  BOOKING_EMAIL_ATTACHMENTS,
  CONTACT_EMAIL_ATTACHMENTS,
  EMAIL_CID,
  NEWSLETTER_EMAIL_ATTACHMENTS,
  type InlineCidAttachment,
} from "./email-assets";
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
  attachments?: readonly InlineCidAttachment[];
}

interface ActionButton {
  label: string;
  href: string;
  borderColor: string;
  color: string;
  iconSrc: string;
}

/** Sanitize phone to pure international digits for direct WhatsApp wa.me links */
function toWhatsAppDigits(phone: string): string {
  const digits = phone.replaceAll(/\D/g, "");
  return digits.startsWith("0") ? digits.slice(1) : digits;
}

/**
 * Seamless, full-width responsive email layout for Amsirar Trip. Zero outer card-in-card margins on
 * mobile for maximum screen real estate.
 */
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
                    <a href="${escapeHtml(btn.href)}" target="_blank" class="btn-responsive" style="display: block; background-color: transparent; border: 1.5px solid ${btn.borderColor}; color: ${btn.color}; font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; padding: 11px 14px; border-radius: 8px; line-height: 1.2; text-align: center;">
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
  <!-- Montserrat font matching the website -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Yellowtail&display=swap" rel="stylesheet" />
  <style type="text/css">
    body, table, td, p, a, span, h1, h2, h3 {
      font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    @media only screen and (max-width: 600px) {
      .email-main-table {
        width: 100%;
        max-width: 100%;
      }
      .email-header-cell {
        padding: 22px 14px 18px 14px;
      }
      .email-content-cell {
        padding: 22px 14px 18px 14px;
      }
      .email-footer-cell {
        padding: 16px 14px 22px 14px;
      }
      .btn-stack-table tr {
        display: block;
        width: 100%;
      }
      .btn-stack-cell {
        display: block;
        width: 100%;
        padding: 5px 0;
        box-sizing: border-box;
      }
      .btn-responsive {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        font-size: 13.5px;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; word-break: break-word;">
  <!-- Preheader text -->
  <div style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(headline ?? badgeText)} &bull; Amsirar Trip Morocco
  </div>

  <!-- Seamless, edge-to-edge canvas (no card-in-background padding on mobile) -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; margin: 0; padding: 0; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 0; margin: 0;">

        <!-- Main Email Container (Max 580px centered on desktop, 100% full width on mobile) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-main-table" style="max-width: 580px; margin: 0 auto; background-color: #ffffff;">

          <!-- Brand Header Banner (Matching Slate-950 Footer Color #020617) -->
          <tr>
            <td class="email-header-cell" style="background-color: #020617; padding: 24px 20px 20px 20px; text-align: center; border-bottom: 3px solid #ea580c;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- High-Res Brand Logo embedded directly via MIME CID -->
                    <a href="https://amsirartrip.com" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img
                        src="cid:${EMAIL_CID.logo}"
                        alt="AMSIRAR TRIP"
                        width="165"
                        height="70"
                        style="display: block; margin: 0 auto; width: 165px; max-width: 100%; height: auto; border: 0;"
                      />
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

          <!-- Main Body Content (Seamless full width, zero double-padding) -->
          <tr>
            <td class="email-content-cell" style="padding: 24px 20px 18px 20px; background-color: #ffffff;">
              ${
                headline ?
                  `
              <h1 style="margin: 0 0 16px 0; font-size: 19px; font-weight: 700; color: #1c1917; line-height: 1.3;">
                ${escapeHtml(headline)}
              </h1>`
                : ""
              }

              ${contentHtml}

              <!-- Direct Responsive Action Buttons -->
              ${buttonsHtml}
            </td>
          </tr>

          <!-- Subtle Divider -->
          <tr>
            <td style="padding: 0 20px;">
              <div style="border-top: 1px solid #f0eeeb;"></div>
            </td>
          </tr>

          <!-- Brand Footer -->
          <tr>
            <td class="email-footer-cell" style="padding: 16px 20px 24px 20px; background-color: #fafaf9; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11.5px; font-weight: 500; color: #78716c;">
                ${escapeHtml(footerNote)}
              </p>
              <p style="margin: 0; font-size: 11.5px; color: #a8a29e;">
                &copy; ${new Date().getFullYear()} Amsirar Trip. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Builds a beautifully formatted email for new booking requests. */
export function buildBookingEmail(data: BookingEmailInput): PreparedEmail {
  const safeFullName = sanitizeHeaderValue(data.fullName, 100);
  const safeReservationType = sanitizeHeaderValue(cleanReservationType(data.reservationType), 100);
  const safeReplyTo = sanitizeHeaderValue(data.email, 254);
  const langName = getLanguageName(data.language);
  const cleanedType = cleanReservationType(data.reservationType);
  const durationText = data.duration ? `${data.duration} days` : "Not specified";

  // WhatsApp link with friendly prefilled greeting
  const waDigits = toWhatsAppDigits(data.phone);
  const waGreeting = encodeURIComponent(
    `Hello ${data.fullName}, thank you for your booking request with Amsirar Trip regarding ${cleanedType}!`,
  );
  const waUrl = waDigits ? `https://wa.me/${waDigits}?text=${waGreeting}` : "";

  const actionButtons: ActionButton[] = [
    {
      label: "Reply by Email",
      href: `mailto:${safeReplyTo}?subject=${encodeURIComponent(`Re: Your Amsirar Trip Booking - ${cleanedType}`)}`,
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
      href: `tel:${data.phone.replaceAll(/\s+/g, "")}`,
      borderColor: "#292524",
      color: "#292524",
      iconSrc: `cid:${EMAIL_CID.phoneIcon}`,
    },
  ];

  const contentHtml = `
    <!-- Key Reservation Details Table (Structured & Compact) -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0eeeb;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="38%" style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; padding: 2px 0;">
                Tour / Experience
              </td>
              <td width="62%" style="font-size: 13.5px; font-weight: 700; color: #ea580c; text-align: right; padding: 2px 0;">
                ${escapeHtml(cleanedType)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0eeeb;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="38%" style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; padding: 2px 0;">
                Travel Date
              </td>
              <td width="62%" style="font-size: 13.5px; font-weight: 600; color: #1c1917; text-align: right; padding: 2px 0;">
                ${escapeHtml(data.date)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0eeeb;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="38%" style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; padding: 2px 0;">
                Guests
              </td>
              <td width="62%" style="font-size: 13.5px; font-weight: 600; color: #1c1917; text-align: right; padding: 2px 0;">
                ${escapeHtml(String(data.persons))} ${data.persons === 1 ? "person" : "people"}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0eeeb;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="38%" style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; padding: 2px 0;">
                Duration
              </td>
              <td width="62%" style="font-size: 13.5px; font-weight: 600; color: #1c1917; text-align: right; padding: 2px 0;">
                ${escapeHtml(durationText)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 16px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="38%" style="font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; padding: 2px 0;">
                Site Language
              </td>
              <td width="62%" style="font-size: 13.5px; font-weight: 600; color: #1c1917; text-align: right; padding: 2px 0;">
                ${escapeHtml(langName)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Guest Information Section -->
    <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #a8a29e; margin-bottom: 8px;">
      Guest Contact Details
    </div>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0eeeb;">
          <div style="font-size: 11px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</div>
          <div style="font-size: 13.5px; font-weight: 600; color: #1c1917; margin-top: 2px;">${escapeHtml(data.fullName)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0eeeb;">
          <div style="font-size: 11px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</div>
          <div style="font-size: 13.5px; font-weight: 600; color: #1c1917; margin-top: 2px;">
            <a href="mailto:${safeReplyTo}" style="color: #ea580c; text-decoration: none;">${escapeHtml(data.email)}</a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 16px;">
          <div style="font-size: 11px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Phone / WhatsApp</div>
          <div style="font-size: 13.5px; font-weight: 600; color: #1c1917; margin-top: 2px;">
            <a href="tel:${data.phone.replaceAll(/\s+/g, "")}" style="color: #1c1917; text-decoration: none;">${escapeHtml(data.phone)}</a>
          </div>
        </td>
      </tr>
    </table>

    ${
      data.message && data.message.trim().length > 0 ?
        `
      <!-- Special Requests / Guest Message Box (Clean Rounded Box, NO orange line, NO top blank space) -->
      <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #a8a29e; margin-bottom: 8px;">
        Special Requests &amp; Notes
      </div>
      <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;">
        <p style="margin: 0; padding: 0; font-size: 13.5px; line-height: 1.55; color: #292524; white-space: pre-line;">${escapeHtml(data.message.trim())}</p>
      </div>
    `
      : ""
    }
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
    footerNote: `Amsirar Trip Booking Notification &bull; Language: ${langName}`,
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

/** Builds a beautifully formatted email for new contact form inquiries. */
export function buildContactEmail(data: ContactEmailInput): PreparedEmail {
  const safeContactName = sanitizeHeaderValue(data.name, 100);
  const safeReplyTo = sanitizeHeaderValue(data.email, 254);
  const safeTopic = data.topic ? sanitizeHeaderValue(data.topic, 100) : "";

  // WhatsApp link with friendly prefilled greeting
  const waDigits = toWhatsAppDigits(data.phone);
  const waGreeting = encodeURIComponent(
    `Hello ${data.name}, thank you for reaching out to Amsirar Trip!`,
  );
  const waUrl = waDigits ? `https://wa.me/${waDigits}?text=${waGreeting}` : "";

  const actionButtons: ActionButton[] = [
    {
      label: "Reply by Email",
      href: `mailto:${safeReplyTo}?subject=${encodeURIComponent(`Re: Your inquiry to Amsirar Trip${safeTopic ? ` - ${safeTopic}` : ""}`)}`,
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
      href: `tel:${data.phone.replaceAll(/\s+/g, "")}`,
      borderColor: "#292524",
      color: "#292524",
      iconSrc: `cid:${EMAIL_CID.phoneIcon}`,
    },
  ];

  const contentHtml = `
    <!-- Sender Information Card (Structured & Compact) -->
    <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #a8a29e; margin-bottom: 8px;">
      Sender Details
    </div>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0eeeb;">
          <div style="font-size: 11px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Name</div>
          <div style="font-size: 13.5px; font-weight: 600; color: #1c1917; margin-top: 2px;">${escapeHtml(data.name)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border-bottom: 1px solid #f0eeeb;">
          <div style="font-size: 11px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Email</div>
          <div style="font-size: 13.5px; font-weight: 600; color: #1c1917; margin-top: 2px;">
            <a href="mailto:${safeReplyTo}" style="color: #ea580c; text-decoration: none;">${escapeHtml(data.email)}</a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; ${safeTopic ? "border-bottom: 1px solid #f0eeeb;" : ""}">
          <div style="font-size: 11px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Phone / WhatsApp</div>
          <div style="font-size: 13.5px; font-weight: 600; color: #1c1917; margin-top: 2px;">
            <a href="tel:${data.phone.replaceAll(/\s+/g, "")}" style="color: #1c1917; text-decoration: none;">${escapeHtml(data.phone)}</a>
          </div>
        </td>
      </tr>
      ${
        safeTopic ?
          `
        <tr>
          <td style="padding: 10px 16px;">
            <div style="font-size: 11px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Subject / Topic</div>
            <div style="font-size: 13.5px; font-weight: 600; color: #ea580c; margin-top: 2px;">${escapeHtml(safeTopic)}</div>
          </td>
        </tr>
      `
        : ""
      }
    </table>

    <!-- Message Content Box (Clean Rounded Box, NO orange line, NO top blank space) -->
    <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #a8a29e; margin-bottom: 8px;">
      Message
    </div>
    <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;">
      <p style="margin: 0; padding: 0; font-size: 13.5px; line-height: 1.55; color: #292524; white-space: pre-line;">${escapeHtml(data.message.trim())}</p>
    </div>
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

/** Builds an email notification for newsletter subscribers. */
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

  const contentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f0eeeb;">
          <div style="font-size: 11px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Subscriber Name</div>
          <div style="font-size: 13.5px; font-weight: 600; color: #1c1917; margin-top: 2px;">${escapeHtml(data.name)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 16px;">
          <div style="font-size: 11px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</div>
          <div style="font-size: 13.5px; font-weight: 600; color: #1c1917; margin-top: 2px;">
            <a href="mailto:${safeReplyTo}" style="color: #ea580c; text-decoration: none;">${escapeHtml(data.email)}</a>
          </div>
        </td>
      </tr>
    </table>
  `;

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

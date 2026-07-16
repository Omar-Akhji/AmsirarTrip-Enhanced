/**
 * Single source of truth for contact information. WhatsApp and phone are read from environment
 * variables — no hardcoding in components.
 *
 * Usage in .astro files (server + client): import { WHATSAPP_NUMBER, PHONE_NUMBER } from
 * "@/lib/constants/contact";
 *
 * Usage in Vue/TS files (client-only): import { WHATSAPP_LINK, PHONE_LINK, PHONE_DISPLAY } from
 * "@/lib/constants/contact";
 *
 * Required env vars (PUBLIC, accessible in browser): PUBLIC_WHATSAPP_NUMBER — raw digits, e.g.
 * "212661173144"
 *
 * Optional env vars: PUBLIC_PHONE_NUMBER — raw digits, e.g. "212661173144" (falls back to
 * WHATSAPP_NUMBER)
 */

const raw: string =
  (import.meta.env["PUBLIC_WHATSAPP_NUMBER"] as string | undefined) ?? "212661173144";

/** WhatsApp link — wa.me/{number} */
export const WHATSAPP_LINK = `https://wa.me/${raw}`;

/** Raw WhatsApp number (digits only, no leading +) */
export const WHATSAPP_NUMBER = raw;

/** Tel link for the phone number */
export const PHONE_LINK = `tel:+${raw}`;

/** Human-readable phone display: "+212 (0) 6 61 17 31 44" */
export const PHONE_DISPLAY = (() => {
  const cleaned = raw.replaceAll(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("212")) {
    const rest = cleaned.slice(3);
    return `+212 (0) ${rest.slice(0, 1)} ${rest.slice(1, 3)} ${rest.slice(3, 5)} ${rest.slice(5)}`;
  }
  return `+${cleaned}`;
})();

/** Single source of truth for agency phone, WhatsApp, and fax links/labels. */
import { PUBLIC_WHATSAPP_NUMBER } from "astro:env/client";

const FALLBACK_WHATSAPP_NUMBER = "212661172393";
const cleaned = (PUBLIC_WHATSAPP_NUMBER ?? "").replaceAll(/\D/g, "") || FALLBACK_WHATSAPP_NUMBER;

export const WHATSAPP_LINK = `https://wa.me/${cleaned}`;

export const PHONE_LINK = `tel:+${cleaned}`;

export const PHONE_DISPLAY = (() => {
  if (cleaned.length === 12 && cleaned.startsWith("212")) {
    const rest = cleaned.slice(3);
    return `+212 (0) ${rest.slice(0, 1)} ${rest.slice(1, 3)} ${rest.slice(3, 5)} ${rest.slice(5)}`;
  }
  return `+${cleaned}`;
})();

export const FAX_NUMBER = "212524434409";
export const FAX_LINK = `tel:+${FAX_NUMBER}`;
export const FAX_DISPLAY = "+212 (0) 5 24 43 44 09";

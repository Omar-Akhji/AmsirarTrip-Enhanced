type NavLink = { to: string; labelKey: string };

type SocialLink = { href: string; icon: string; label: string; accent: string };

export type { Language } from "@/i18n/locales";
export { LANGUAGES } from "@/i18n/locales";

export const NAV_LINKS: NavLink[] = [
  { to: "/", labelKey: "nav.home" },
  { to: "/tours", labelKey: "nav.tours" },
  { to: "/excursions", labelKey: "nav.excursions" },
  { to: "/about", labelKey: "nav.about" },
  { to: "/contact", labelKey: "nav.contact" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: "https://www.tripadvisor.de/Attraction_Review-g293734-d32584739-Reviews-Amsirar_Travel-Marrakech_Marrakech_Safi.html",
    icon: "/icons/tripadvisor-nav_icon.svg",
    label: "Tripadvisor",
    accent: "bg-tripadvisor border-tripadvisor text-white",
  },
  {
    href: "mailto:contact@amsirartrip.com",
    icon: "/icons/mail-nav_icon.svg",
    label: "Email",
    accent: "bg-gmail border-gmail text-white",
  },
];

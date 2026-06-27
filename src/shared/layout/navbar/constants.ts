type NavLink = { to: string; labelKey: string };

type SocialLink = { href: string; icon: string; label: string; accent: string };

export type Language = { code: string; name: string; shortName: string };

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

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", shortName: "EN" },
  { code: "fr", name: "Français", shortName: "FR" },
  { code: "de", name: "Deutsch", shortName: "DE" },
  { code: "es", name: "Español", shortName: "ES" },
];

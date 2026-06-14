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
    accent: "bg-[#00af87] border-[#00af87] text-white",
  },
  {
    href: "mailto:contact@amsirartrip.com",
    icon: "/icons/mail-nav_icon.svg",
    label: "Email",
    accent: "bg-[#ea4335] border-[#ea4335] text-white",
  },
];

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", shortName: "EN" },
  { code: "fr", name: "Français", shortName: "FR" },
  { code: "de", name: "Deutsch", shortName: "DE" },
  { code: "es", name: "Español", shortName: "ES" },
];

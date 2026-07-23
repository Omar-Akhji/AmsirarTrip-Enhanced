import navData from "@/data/navigation.json";

type NavLink = { to: string; labelKey: string };

type SocialLink = { href: string; icon: string; label: string; accent: string };

export type { Language } from "@/i18n/locales";
export { LANGUAGES } from "@/i18n/locales";

export const NAV_LINKS = navData.navLinks as NavLink[];

export const SOCIAL_LINKS = navData.socialLinks as SocialLink[];

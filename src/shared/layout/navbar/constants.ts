import navData from "@/data/navigation.json";

export interface NavLink {
  readonly to: string;
  readonly labelKey: string;
}

export interface SocialLink {
  readonly href: string;
  readonly icon: string;
  readonly label: string;
  readonly accent: string;
}

export { LANGUAGES } from "@/i18n/locales";

export const NAV_LINKS: readonly NavLink[] = navData.navLinks;

export const SOCIAL_LINKS: readonly SocialLink[] = navData.socialLinks;

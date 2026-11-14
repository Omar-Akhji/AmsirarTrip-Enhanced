import navData from "@/data/navigation.json";

export interface SocialLink {
  readonly accent: string;
  readonly href: string;
  readonly icon: string;
  readonly label: string;
}

export { LANGUAGES } from "@/i18n/locales";

export const SOCIAL_LINKS: readonly SocialLink[] = navData.socialLinks;

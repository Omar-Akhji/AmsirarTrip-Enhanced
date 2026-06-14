import React, { useSyncExternalStore } from "react";
import { getGlobalLocale } from "@/lib/hooks/useTranslation";

const defaultLang = "en";

function getLocalizedPath(locale: string, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLang) {
    return cleanPath;
  }
  return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}

const LOCALES = ["en", "fr", "de", "es"] as const;
type Locale = (typeof LOCALES)[number];

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
  children?: React.ReactNode;
};

export function Link({ href, prefetch: _prefetch, children, ...props }: LinkProps) {
  const locale = getGlobalLocale();
  const localizedHref = getLocalizedPath(locale, href);
  return React.createElement("a", { href: localizedHref, ...props }, children);
}

function computePathname(): string {
  if (globalThis.window === undefined) return "/";
  const path = globalThis.location.pathname;
  const segments = path.split("/").filter(Boolean);

  let normalizedPath = path;
  if (segments[0] && (LOCALES as readonly string[]).includes(segments[0])) {
    normalizedPath = "/" + segments.slice(1).join("/");
  }

  if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  if (!normalizedPath.startsWith("/")) {
    normalizedPath = "/" + normalizedPath;
  }

  return normalizedPath || "/";
}

export function usePathname(): string {
  const pathname = useSyncExternalStore(
    (onStoreChange) => {
      document.addEventListener("astro:page-load", onStoreChange);
      globalThis.addEventListener("popstate", onStoreChange);
      return () => {
        document.removeEventListener("astro:page-load", onStoreChange);
        globalThis.removeEventListener("popstate", onStoreChange);
      };
    },
    computePathname,
    () => "/",
  );

  return pathname;
}

export function useRouter() {
  return {
    push: (href: string, options?: { locale?: Locale }) => {
      const locale = options?.locale ?? getGlobalLocale();
      globalThis.location.href = getLocalizedPath(locale, href);
    },
    replace: (href: string, options?: { locale?: Locale }) => {
      const locale = options?.locale ?? getGlobalLocale();
      globalThis.location.replace(getLocalizedPath(locale, href));
    },
    prefetch: (_href: string) => {},
    back: () => globalThis.history.back(),
    forward: () => globalThis.history.forward(),
  };
}

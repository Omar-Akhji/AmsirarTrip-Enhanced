import { h, ref, onMounted, onUnmounted, type SetupContext, type Ref } from "vue";
import { getGlobalLocale } from "@/lib/hooks/use-translation";

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

export const Link = {
  name: "Link",
  props: { href: { type: String, required: true } },
  setup(props: { href: string }, { slots }: SetupContext) {
    const locale = getGlobalLocale();
    const localizedHref = getLocalizedPath(locale, props.href);
    return () => h("a", { href: localizedHref }, slots["default"]?.());
  },
};

function computePathname(): string {
  if (typeof window === "undefined" || typeof location === "undefined") return "/";
  const path = location.pathname;
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

export function usePathname(): Ref<string> {
  const pathname = ref(computePathname());

  const update = () => {
    pathname.value = computePathname();
  };

  onMounted(() => {
    document.addEventListener("astro:page-load", update);
    globalThis.addEventListener("popstate", update);
  });

  onUnmounted(() => {
    document.removeEventListener("astro:page-load", update);
    globalThis.removeEventListener("popstate", update);
  });

  return pathname;
}

export function useRouter() {
  return {
    push: (href: string, options?: { locale?: Locale }) => {
      const locale = options?.locale ?? getGlobalLocale();
      location.assign(getLocalizedPath(locale, href));
    },
    replace: (href: string, options?: { locale?: Locale }) => {
      const locale = options?.locale ?? getGlobalLocale();
      location.replace(getLocalizedPath(locale, href));
    },
    prefetch: (_href: string) => {},
    back: () => history.back(),
    forward: () => history.forward(),
  };
}

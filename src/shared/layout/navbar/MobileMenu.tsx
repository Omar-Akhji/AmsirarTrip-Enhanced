import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SOCIAL_LINKS } from "./constants";
import { LanguageSelector } from "./LanguageSelector";

const getNavLinkClasses = (active: boolean): string => {
  const base =
    "inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200 mx-auto inline-fit min-inline-40 justify-center px-8 py-2.5 text-base";
  return cn(base, "mobile-nav-link", active && "mobile-nav-link-active");
};

export function MobileMenu() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [asideOpen, setAsideOpen] = useState(false);
  const [viewport, setViewport] = useState<"mobile" | "tablet">(() => {
    if (
      typeof globalThis.matchMedia === "function"
      && globalThis.matchMedia("(min-width: 768px) and (max-width: 1089px)").matches
    )
      return "tablet";
    return "mobile";
  });
  const collapseRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mqTablet = globalThis.matchMedia("(min-width: 768px) and (max-width: 1089px)");
    const mqMobile = globalThis.matchMedia("(max-width: 767px)");

    const update = () => {
      if (mqTablet.matches) setViewport("tablet");
      else if (mqMobile.matches) setViewport("mobile");
    };

    mqTablet.addEventListener("change", update);
    mqMobile.addEventListener("change", update);
    return () => {
      mqTablet.removeEventListener("change", update);
      mqMobile.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!asideOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        collapseRef.current
        && btnRef.current
        && !collapseRef.current.contains(target)
        && !btnRef.current.contains(target)
      ) {
        setAsideOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [asideOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && asideOpen) setAsideOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [asideOpen]);

  const handleNavClick = () => {
    setAsideOpen(false);
  };

  const isActive = (to: string) => pathname === to || (to !== "/" && pathname.startsWith(to + "/"));

  const getCollapseClasses = (): string => {
    const baseClasses =
      "navbar-collapse fixed start-1/2 top-[calc(100%+0.75rem)] z-40 -translate-x-1/2 overflow-y-auto max-h-[calc(100vh-6rem)] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 inline-[min(1100px,calc(100vw-2rem))]";
    const visibilityClasses =
      asideOpen ?
        "pointer-events-auto opacity-100 translate-y-0"
      : "pointer-events-none opacity-0 -translate-y-4";
    return cn(baseClasses, visibilityClasses, "navbar-collapse");
  };

  return (
    <div className="relative flex items-center gap-3 inline-full lg:hidden">
      {viewport === "tablet" && (
        <div className="me-auto flex items-center gap-2">
          <ul className="flex items-center gap-2">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={cn(
                    "social-link flex size-10 items-center justify-center rounded-full border-2 transition-all duration-150 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]",
                    link.accent,
                  )}
                  {...(link.href.startsWith("http") ?
                    { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                  aria-label={link.label}
                >
                  <img
                    src={link.icon}
                    alt=""
                    className="size-5 object-contain"
                  />
                </a>
              </li>
            ))}
          </ul>
          <LanguageSelector
            size="sm"
            placement="left"
          />
        </div>
      )}

      <Link
        href="/"
        className={cn(
          "navbar-link text-[1.4rem] font-semibold tracking-tight",
          viewport === "tablet" || viewport === "mobile" ?
            "absolute inset-s-1/2 z-10 -translate-x-1/2"
          : "",
        )}
        onClick={handleNavClick}
        aria-label="Amsirar Trip Home"
      >
        Amsirar
        <span className="navbar-trip ms-1 font-brand font-light">Trip</span>
      </Link>

      {viewport === "mobile" && (
        <LanguageSelector
          size="sm"
          className="me-auto"
          placement="left"
        />
      )}

      <button
        type="button"
        id="navbar-show-btn"
        className={cn(
          "navbar-toggle ms-2 flex size-10 items-center justify-center rounded-md text-lg transition-all duration-150 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-orange",
        )}
        aria-expanded={asideOpen}
        aria-controls="navbar-collapse"
        onClick={() => setAsideOpen((s) => !s)}
        ref={btnRef}
      >
        {asideOpen ?
          <X className="pointer-events-none size-5" />
        : <Menu className="pointer-events-none size-5" />}
      </button>

      <div
        id="navbar-collapse"
        ref={collapseRef}
        className={cn(getCollapseClasses())}
      >
        {viewport === "mobile" && (
          <div className="navbar-mobile-social flex items-center justify-center gap-4 px-4 py-4">
            <ul className="flex items-center gap-4">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={cn(
                      "social-link flex size-10 items-center justify-center rounded-full border-2 transition-all duration-150 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]",
                      link.accent,
                    )}
                    {...(link.href.startsWith("http") ?
                      { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                    aria-label={link.label}
                  >
                    <img
                      src={link.icon}
                      alt=""
                      className="size-5 object-contain"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className="flex flex-col items-center gap-3 p-4">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                href={link.to}
                className={getNavLinkClasses(isActive(link.to))}
                onClick={handleNavClick}
              >
                <span className="nav-label">{t(link.labelKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SOCIAL_LINKS } from "./constants";
import { LanguageSelector } from "./LanguageSelector";

const getNavLinkClasses = (active: boolean): string => {
  const base =
    "inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200 mx-auto inline-fit min-inline-40 justify-center px-8 py-2.5 text-base text-white bg-transparent hover:bg-white/10 group-data-scrolled:text-dark group-data-scrolled:hover:bg-light-grey";
  const activeClasses =
    "bg-white/10 text-white shadow-[0_0_0_1px_rgb(0_0_0/5%)] backdrop-blur-[4px] group-data-scrolled:bg-orange group-data-scrolled:text-white group-data-scrolled:shadow-[0_10px_26px_oklch(56%_0.19_33deg/12%)]";
  return cn(base, active && activeClasses);
};

export function MobileMenu() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [asideOpen, setAsideOpen] = useState(false);
  const [viewport, setViewport] = useState<"mobile" | "tablet">(() => {
    if (
      typeof matchMedia === "function"
      && matchMedia("(min-width: 768px) and (max-width: 1089px)").matches
    )
      return "tablet";
    return "mobile";
  });
  const collapseReference = useRef<HTMLDivElement>(null);
  const buttonReference = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mqTablet = matchMedia("(min-width: 768px) and (max-width: 1089px)");
    const mqMobile = matchMedia("(max-width: 767px)");

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

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        collapseReference.current
        && buttonReference.current
        && !collapseReference.current.contains(target)
        && !buttonReference.current.contains(target)
      ) {
        setAsideOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [asideOpen]);

  useEffect(() => {
    if (!asideOpen) return;

    const collapse = collapseReference.current;
    if (!collapse) return;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = collapse.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [asideOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && asideOpen) setAsideOpen(false);
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
      "navbar-collapse fixed start-1/2 top-[calc(100%+0.75rem)] z-40 -translate-x-1/2 overflow-y-auto max-h-[calc(100vh-6rem)] rounded-2xl border border-white/20 bg-[#1f2937] text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 inline-[min(1100px,calc(100vw-2rem))] group-data-scrolled:border-white/10 group-data-scrolled:bg-white group-data-scrolled:text-slate-900";
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
                    "flex size-10 items-center justify-center rounded-full border-2 transition-all duration-150 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]",
                    "group-not-data-scrolled:border-white/60 group-not-data-scrolled:bg-white/10 group-not-data-scrolled:text-white",
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
          "text-[1.4rem] font-semibold tracking-tight text-white transition-colors duration-200 group-data-scrolled:text-dark-grey",
          viewport === "tablet" || viewport === "mobile" ?
            "absolute inset-s-1/2 z-10 -translate-x-1/2"
          : "",
        )}
        onClick={handleNavClick}
        aria-label="Amsirar Trip Home"
      >
        Amsirar
        <span className="ms-1 font-brand font-light text-white transition-colors duration-200 group-data-scrolled:text-orange">
          Trip
        </span>
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
          "ms-2 flex size-10 items-center justify-center rounded-md text-lg transition-all duration-150 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-orange",
          "bg-black/35 text-white group-data-scrolled:bg-white group-data-scrolled:text-dark-grey",
        )}
        aria-expanded={asideOpen}
        aria-controls="navbar-collapse"
        onClick={() => setAsideOpen((s) => !s)}
        ref={buttonReference}
      >
        {asideOpen ?
          <X className="pointer-events-none size-5" />
        : <Menu className="pointer-events-none size-5" />}
      </button>

      <div
        id="navbar-collapse"
        ref={collapseReference}
        className={cn(getCollapseClasses())}
        aria-label="Navigation menu"
      >
        {viewport === "mobile" && (
          <div className="flex items-center justify-center gap-4 border-b border-white/20 px-4 py-4 group-data-scrolled:border-light-grey-alt2/30">
            <ul className="flex items-center gap-4">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full border-2 transition-all duration-150 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]",
                      "group-not-data-scrolled:border-white/60 group-not-data-scrolled:bg-white/10 group-not-data-scrolled:text-white",
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

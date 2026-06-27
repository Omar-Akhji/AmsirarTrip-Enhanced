import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import Image from "@/shared/ui/Image";
import { LANGUAGES } from "./constants";

type LanguageSelectorProperties = {
  placement?: "left" | "right";
  size?: "sm" | "md";
  className?: string;
};

const getButtonClasses = (size: "sm" | "md"): string => {
  const sizeClass = size === "sm" ? "size-10" : "size-11";
  const baseClasses =
    "flex items-center justify-center rounded-full border-2 transition-all duration-150 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]";
  const textSize = size === "sm" ? "text-sm" : "text-base font-semibold";
  const scrollClasses =
    "border-white/60 bg-white/10 text-white group-data-scrolled:border-orange group-data-scrolled:bg-orange group-data-scrolled:text-white group-data-scrolled:shadow-[0_10px_24px_oklch(56%_0.19_33deg/35%)]";
  return cn(baseClasses, sizeClass, textSize, scrollClasses);
};

const badgeClasses = (size: "sm" | "md"): string => {
  const baseClasses =
    "absolute -end-1.5 -bottom-1 font-bold tracking-[0.04em] text-white rounded-full border-2 border-white bg-orange";
  const sizeClasses =
    size === "sm" ? "px-1 py-[1px] text-[0.6rem]" : "px-1.5 py-0.5 text-[0.625rem]";
  return cn(baseClasses, sizeClasses);
};

const DEFAULT_LANGUAGE: (typeof LANGUAGES)[number] = {
  code: "en",
  name: "English",
  shortName: "EN",
};

export function LanguageSelector({
  placement = "right",
  size = "md",
  className = "",
}: LanguageSelectorProperties) {
  const { t, i18n } = useTranslation();
  const { replace } = useRouter();
  const currentPath = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const langReference = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language) ?? DEFAULT_LANGUAGE;

  const changeLanguage = (code: string) => {
    const isValidLanguage = LANGUAGES.some((l) => l.code === code);
    if (!isValidLanguage) return;

    if (globalThis !== undefined) {
      try {
        localStorage.setItem("site-language", code);
      } catch {}
    }

    replace(currentPath, { locale: code as "en" | "fr" | "de" | "es" });
    setLangOpen(false);
  };

  useEffect(() => {
    if (!langOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (langReference.current && !langReference.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [langOpen]);

  return (
    <div
      className={cn("relative", className)}
      ref={langReference}
    >
      <button
        type="button"
        className="relative cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={langOpen}
        aria-label={t("language") || "Language"}
        onClick={(event) => {
          event.stopPropagation();
          setLangOpen(!langOpen);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && langOpen) {
            setLangOpen(false);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setLangOpen(!langOpen);
          }
        }}
      >
        <div className={getButtonClasses(size)}>
          <Image
            src="/icons/translate-icon-com.svg"
            alt=""
            width={25}
            height={25}
            className={cn(size === "sm" ? "size-5" : "size-6.25", "object-contain")}
          />
        </div>
        <span
          className={badgeClasses(size)}
          aria-hidden="true"
        >
          {currentLanguage.shortName}
        </span>
      </button>
      {langOpen ?
        <div
          className={cn(
            "absolute z-50 mbs-2 overflow-hidden rounded-xl border border-white/10 bg-dark/90 text-white shadow-xl backdrop-blur-xl inline-48 group-data-scrolled:border-light-grey-alt2/60 group-data-scrolled:bg-white/90 group-data-scrolled:text-dark-grey",
            placement === "left" ? "inset-s-0" : "inset-e-0",
          )}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="flex flex-col gap-1 p-1">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-light-grey-alt2 transition-colors duration-150 inline-full group-data-scrolled:text-grey hover:bg-white/10 hover:text-white group-data-scrolled:hover:bg-light-grey group-data-scrolled:hover:text-dark-grey",
                    isSelected
                      && "bg-white/10 text-white group-data-scrolled:bg-orange/10 group-data-scrolled:text-orange",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-medium">{lang.name}</span>
                  </span>
                  {isSelected ?
                    <div className="me-1 size-2 rounded-full bg-white group-data-scrolled:bg-orange" />
                  : null}
                </button>
              );
            })}
          </div>
        </div>
      : null}
    </div>
  );
}

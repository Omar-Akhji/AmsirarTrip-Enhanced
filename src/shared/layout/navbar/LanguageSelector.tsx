import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import Image from "@/shared/ui/Image";
import { LANGUAGES } from "./constants";

type LanguageSelectorProps = {
  placement?: "left" | "right";
  size?: "sm" | "md";
  className?: string;
};

const getButtonClasses = (size: "sm" | "md"): string => {
  const sizeClass = size === "sm" ? "size-10" : "size-11";
  const baseClasses =
    "flex items-center justify-center rounded-full border-2 transition-all duration-150 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]";
  const textSize = size === "sm" ? "text-sm" : "text-base font-semibold";
  return cn(baseClasses, sizeClass, textSize, "lang-btn");
};

const badgeClasses = (size: "sm" | "md"): string => {
  const baseClasses =
    "absolute -end-1.5 -bottom-1 font-bold tracking-[0.04em] text-white rounded-full border-2 border-white bg-orange";
  const sizeClasses =
    size === "sm" ? "px-1 py-[1px] text-[0.6rem]" : "px-1.5 py-0.5 text-[0.625rem]";
  return cn(baseClasses, sizeClasses);
};

export function LanguageSelector({
  placement = "right",
  size = "md",
  className = "",
}: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  const { replace } = useRouter();
  const currentPath = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]!;

  const changeLanguage = (code: string) => {
    const validLanguage = LANGUAGES.some((l) => l.code === code);
    if (!validLanguage) return;

    if (globalThis.window !== undefined) {
      try {
        localStorage.setItem("site-language", code);
      } catch {}
    }

    replace(currentPath, { locale: code as "en" | "fr" | "de" | "es" });
    setLangOpen(false);
  };

  useEffect(() => {
    if (!langOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [langOpen]);

  return (
    <div
      className={cn("relative", className)}
      ref={langRef}
    >
      <button
        type="button"
        className="relative cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={langOpen}
        aria-label={t("language") || "Language"}
        onClick={(e) => {
          e.stopPropagation();
          setLangOpen(!langOpen);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && langOpen) {
            setLangOpen(false);
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
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
            "lang-dropdown absolute z-50 mbs-2 overflow-hidden rounded-xl border shadow-xl backdrop-blur-xl inline-48",
            placement === "left" ? "inset-s-0" : "inset-e-0",
          )}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="flex flex-col gap-1 p-1">
            {LANGUAGES.map((lang) => {
              const selected = lang.code === currentLanguage.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    "lang-dropdown-item flex items-center justify-between rounded-lg px-3 py-2 text-sm inline-full",
                    selected && "lang-dropdown-item-selected",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-medium">{lang.name}</span>
                  </span>
                  {selected ?
                    <div className="lang-dropdown-dot me-1 size-2 rounded-full" />
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

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { useMediaQuery, useTranslation } from "@/lib/hooks";
import Image from "@/shared/ui/Image";

const HEADER_IMAGES = [
  "/images/Header/header-1.webp",
  "/images/Header/header-2.webp",
  "/images/Header/header-3.webp",
];

export default function HomeHero() {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isMobileOrTablet = useMediaQuery("(max-width: 1023px)");

  const [typed, setTyped] = useState("");
  const [textState, setTextState] = useState({ index: 0, isFading: false });

  const heroTexts = [
    t("home.heroTitle"),
    t("home.heroAlt1", "Adventure Awaits Beyond the Dunes"),
    t("home.heroAlt2", "Pack your bags — Morocco calls"),
  ];
  const heroTextsReference = useRef(heroTexts);

  useEffect(() => {
    heroTextsReference.current = heroTexts;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((previous) => (previous + 1) % HEADER_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const headerReference = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isMobileOrTablet || !headerReference.current) return;

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let lastUpdate = 0;
    let pauseUntil = 0;
    let rafId: number;
    let isVisible = false;

    const TYPING_SPEED = 80;
    const DELETING_SPEED = 40;
    const PAUSE_AFTER_TYPING = 2000;
    const PAUSE_AFTER_DELETING = 300;

    function animate(timestamp: number) {
      if (!isVisible) return;

      if (pauseUntil > 0) {
        if (timestamp < pauseUntil) {
          rafId = requestAnimationFrame(animate);
          return;
        }
        pauseUntil = 0;
      }

      const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;

      if (timestamp - lastUpdate >= speed) {
        lastUpdate = timestamp;
        const current = heroTextsReference.current.at(textIndex) || "";

        if (isDeleting) {
          charIndex = Math.max(0, charIndex - 1);
          setTyped(current.slice(0, charIndex));

          if (charIndex <= 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % heroTextsReference.current.length;
            pauseUntil = timestamp + PAUSE_AFTER_DELETING;
          }
        } else {
          charIndex = Math.min(current.length, charIndex + 1);
          setTyped(current.slice(0, charIndex));

          if (charIndex >= current.length) {
            isDeleting = true;
            pauseUntil = timestamp + PAUSE_AFTER_TYPING;
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) {
          lastUpdate = performance.now();
          rafId = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0 },
    );

    observer.observe(headerReference.current);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [isMobileOrTablet]);

  useEffect(() => {
    if (!isMobileOrTablet) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setTextState((prev) => ({ ...prev, isFading: true }));
      timeoutId = setTimeout(() => {
        setTextState((prev) => ({
          index: (prev.index + 1) % heroTextsReference.current.length,
          isFading: false,
        }));
      }, 500);
    }, 4000);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isMobileOrTablet]);

  return (
    <header
      ref={headerReference}
      className="page-hero home-header relative isolate overflow-hidden bg-zinc-950 text-white shadow-xl inline-full min-block-[40vh] sm:min-block-[45vh] lg:min-block-[50vh]"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 z-0">
        {HEADER_IMAGES.map((source, index) => (
          <div
            key={source}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={source}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 z-10 bg-linear-to-b from-black/60 via-black/30 to-black/70" />
      <div className="relative z-20 mx-auto flex flex-col items-center justify-center gap-12 px-4 pbs-8 pbe-16 text-center inline-full max-inline-7xl lg:py-20">
        <div className="flex-1 space-y-6 pbs-0 text-center lg:pbs-8">
          <div className="flex items-center justify-center gap-4">
            <span className="bg-orange-400/60 block-px inline-8 sm:inline-12" />
            <h1 className="text-xs font-semibold tracking-[0.2em] text-orange-300 uppercase sm:tracking-[0.3em]">
              {t("home.title")}
            </h1>
            <span className="bg-orange-400/60 block-px inline-8 sm:inline-12" />
          </div>
          <h2
            id="hero-heading"
            className="lg:text-shadow-xl text-3xl leading-tight font-semibold text-shadow-black/60 text-shadow-lg sm:text-4xl lg:text-5xl"
          >
            {isMobileOrTablet ?
              <span
                className={`inline-block transition-opacity duration-500 ${textState.isFading ? "opacity-0" : "opacity-100"}`}
              >
                {heroTexts.at(textState.index)}
              </span>
            : <>
                <span>{typed}</span>
                <span
                  aria-hidden
                  className="ms-2 inline-block animate-pulse bg-white/90 block-6 inline-px"
                />
              </>
            }
          </h2>
          <p className="font-fancy text-lg text-zinc-200 lg:text-xl">{t("home.heroSubtitle")}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 pbs-2">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white/90 transition text-shadow-xs sm:px-8 pointer-fine:hover:bg-white/10"
            >
              {t("home.exploreOurTours")}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition text-shadow-xs sm:px-8 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:bg-white/20"
            >
              {t("home.contactForMore")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  var __lenis: Lenis | undefined;
}

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | undefined;
let activeTriggers: ScrollTrigger[] = [];
let bodyObserver: MutationObserver | undefined;
let isTickerBound = false;

/** Checks if user prefers reduced motion. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Ensures GSAP ticker loop is bound exactly once to drive Lenis with zero multi-loop drift. */
function ensureTicker() {
  if (isTickerBound) return;

  gsap.ticker.add((time: number) => {
    lenis?.raf(time * 1000);
  });

  // Zero lag-smoothing prevents delayed jumps after heavy JS frames
  gsap.ticker.lagSmoothing(0);
  isTickerBound = true;
}

/** Monitors body class mutations to stop Lenis when modals lock the scrollbar. */
function setupBodyObserver(instance: Lenis) {
  bodyObserver?.disconnect();

  bodyObserver = new MutationObserver(() => {
    const isLocked =
      document.body.classList.contains("overflow-hidden")
      || document.documentElement.classList.contains("overflow-hidden")
      || document.body.style.overflow === "hidden";

    if (isLocked) {
      instance.stop();
    } else {
      instance.start();
    }
  });

  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style"] });
}

/**
 * Initializes or re-synchronizes the Lenis smooth-scrolling engine. Matches https://lenis.dev/
 * signature physics:
 *
 * - Lerp: 0.1 (continuous physical momentum that accumulates fluidly)
 * - WheelMultiplier: 1 (natural 1:1 wheel tracking)
 * - SyncTouch: false (preserves native 120Hz touch/trackpad inertia)
 */
function initLenis(): Lenis | undefined {
  if (prefersReducedMotion()) {
    // Destroy existing instance if reduced motion preference changed
    if (lenis) {
      lenis.destroy();
      lenis = undefined;
      Object.assign(globalThis, { __lenis: undefined });
    }
    return undefined;
  }

  if (lenis) {
    lenis.resize();
    return lenis;
  }

  lenis = new Lenis({
    lerp: 0.1, // Official lenis.dev signature fluid momentum (replaces rigid duration)
    wheelMultiplier: 1, // 1:1 true-to-hand wheel sensitivity
    smoothWheel: true,
    syncTouch: false, // Keep native 120Hz touch scrolling on mobile and precision trackpads
    autoResize: true,
    autoToggle: true,
    anchors: { offset: -72 },
    prevent: (node: Element) =>
      (node instanceof HTMLElement && Boolean(node.dataset["lenisPrevent"]))
      || Boolean(node.closest("[data-lenis-prevent]"))
      || node.classList.contains("dark-scrollbar"),
  });

  Object.assign(globalThis, { __lenis: lenis });

  // Sync Lenis scroll updates with GSAP ScrollTrigger
  lenis.on("scroll", () => {
    ScrollTrigger.update();
  });

  ensureTicker();
  setupBodyObserver(lenis);

  return lenis;
}

/**
 * Initializes continuous scroll-linked parallax animations (cards, video, monumental brand).
 * One-shot reveals are handled separately by scroll-animate.ts via CSS to avoid layout fighting.
 */
function initScrollAnimations() {
  cleanupScrollAnimations();

  if (prefersReducedMotion()) return;

  // 1. Subtle Spatial Parallax for Destination & Tour Cards
  const parallaxContainers = document.querySelectorAll<HTMLElement>("[data-scroll-parallax]");
  parallaxContainers.forEach((container) => {
    const mediaWrapper = container.querySelector<HTMLElement>(".parallax-media");
    const img = container.querySelector<HTMLElement>("img");
    const target = mediaWrapper ?? img;
    if (!target) return;

    const tween = gsap.fromTo(
      target,
      { yPercent: -6, scale: mediaWrapper ? 1 : 1.1 },
      {
        yPercent: 6,
        scale: mediaWrapper ? 1 : 1.1,
        ease: "none",
        scrollTrigger: { trigger: container, start: "top bottom", end: "bottom top", scrub: 0.6 },
      },
    );

    const trigger = tween.scrollTrigger;
    if (trigger) activeTriggers.push(trigger);
  });

  // 2. Cinematic Video Showcase Frame Expansion
  const videoContainers = document.querySelectorAll<HTMLElement>("[data-scroll-cinematic]");
  videoContainers.forEach((container) => {
    const tween = gsap.fromTo(
      container,
      { scale: 0.95, y: 24 },
      {
        scale: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: { trigger: container, start: "top 92%", end: "top 35%", scrub: 1 },
      },
    );

    const trigger = tween.scrollTrigger;
    if (trigger) activeTriggers.push(trigger);
  });

  ScrollTrigger.refresh();
}

/** Cleans up active ScrollTrigger instances to prevent leaks during Astro View Transitions. */
function cleanupScrollAnimations() {
  for (const trigger of activeTriggers) {
    trigger.kill();
  }
  activeTriggers = [];
}

/** Resets scroll position to the page header / top (unless targeting an anchor hash). */
function resetScrollToTop() {
  if (globalThis.location.hash) return;

  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  }
  globalThis.scrollTo({ left: 0, top: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Full page load orchestrator. */
function onPageLoad() {
  const instance = initLenis();

  // If page is loaded directly with an anchor hash in URL, smooth scroll to it
  if (globalThis.location.hash) {
    if (instance) {
      const targetEl = document.querySelector(globalThis.location.hash);
      if (targetEl) {
        globalThis.setTimeout(() => {
          instance.scrollTo(targetEl, { offset: -72, immediate: false });
        }, 150);
      }
    }
  } else {
    resetScrollToTop();
  }

  // Small delay to allow layout recalculation after transition skeletons vanish
  globalThis.setTimeout(() => {
    instance?.resize();
    initScrollAnimations();
  }, 100);
}

/** View transition preparation hook. */
function onBeforePreparation(e: Event) {
  cleanupScrollAnimations();
  const hasHash = Boolean("to" in e && (e as { to: URL }).to.hash);
  if (!hasHash) {
    resetScrollToTop();
  }
}

/** View transition swap hook to ensure new page starts at header. */
function onAfterSwap() {
  if (!globalThis.location.hash) {
    resetScrollToTop();
  }
}

// Wire up Astro View Transition lifecycle
document.addEventListener("astro:page-load", onPageLoad);
document.addEventListener("astro:before-preparation", onBeforePreparation);
document.addEventListener("astro:after-swap", onAfterSwap);

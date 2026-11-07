import Lenis from "lenis";

declare global {
  var __lenis: Lenis | undefined;
}

let lenis: Lenis | undefined;
let scrollAnimationCleanup: (() => void) | undefined;
let bodyObserver: MutationObserver | undefined;

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/** Checks if user prefers reduced motion. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
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
    autoRaf: true,
    autoResize: true,
    autoToggle: true,
    anchors: { offset: -72 },
    prevent: (node: Element) =>
      (node instanceof HTMLElement && Boolean(node.dataset["lenisPrevent"]))
      || Boolean(node.closest("[data-lenis-prevent]")),
  });

  Object.assign(globalThis, { __lenis: lenis });
  setupBodyObserver(lenis);

  return lenis;
}

/**
 * Initializes continuous scroll-linked parallax animations (cards, video showcase). One-shot
 * reveals are handled separately by scroll-animate.ts via CSS to avoid layout fighting.
 */
function initScrollAnimations() {
  cleanupScrollAnimations();

  if (prefersReducedMotion()) return;

  const parallaxItems: { container: HTMLElement; target: HTMLElement; scale: number }[] = [];
  for (const container of document.querySelectorAll<HTMLElement>("[data-scroll-parallax]")) {
    const mediaWrapper = container.querySelector<HTMLElement>(".parallax-media");
    const img = container.querySelector<HTMLElement>("img");
    const target = mediaWrapper ?? img;
    if (!target) continue;
    parallaxItems.push({ container, target, scale: mediaWrapper ? 1 : 1.1 });
  }

  const videoItems: { container: HTMLElement; lastY: number }[] = Array.from(
    document.querySelectorAll<HTMLElement>("[data-scroll-cinematic]"),
    (container) => ({ container, lastY: 0 }),
  );

  if (parallaxItems.length === 0 && videoItems.length === 0) return;

  let rafId: number | null = null;

  const update = () => {
    rafId = null;
    const vh = globalThis.innerHeight || 1;

    // 1. Subtle Spatial Parallax for Destination & Tour Cards (top bottom -> bottom top: -6% -> +6%)
    for (const item of parallaxItems) {
      const rect = item.container.getBoundingClientRect();
      const totalSpan = vh + rect.height;
      if (totalSpan <= 0) continue;
      const progress = clamp01((vh - rect.top) / totalSpan);
      const yPercent = -6 + 12 * progress;
      item.target.style.transform =
        item.scale === 1 ?
          `translate3d(0, ${yPercent.toFixed(2)}%, 0)`
        : `translate3d(0, ${yPercent.toFixed(2)}%, 0) scale(${item.scale})`;
    }

    // 2. Cinematic Video Showcase Frame Expansion (top 92% -> top 35%: scale 0.95->1, y 24->0, power2.out)
    for (const item of videoItems) {
      const rect = item.container.getBoundingClientRect();
      const naturalTop = rect.top - item.lastY;
      const startTop = vh * 0.92;
      const endTop = vh * 0.35;
      const progress = clamp01((startTop - naturalTop) / Math.max(1, startTop - endTop));
      const eased = 1 - (1 - progress) ** 3;
      const scale = 0.95 + 0.05 * eased;
      const y = 24 * (1 - eased);
      item.lastY = y;
      item.container.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    }
  };

  const schedule = () => {
    rafId ??= globalThis.requestAnimationFrame(update);
  };

  lenis?.on("scroll", schedule);
  globalThis.addEventListener("scroll", schedule, { passive: true });
  globalThis.addEventListener("resize", schedule, { passive: true });

  update();

  scrollAnimationCleanup = () => {
    if (rafId !== null) {
      globalThis.cancelAnimationFrame(rafId);
    }
    lenis?.off("scroll", schedule);
    globalThis.removeEventListener("scroll", schedule);
    globalThis.removeEventListener("resize", schedule);
  };
}

/** Cleans up active scroll animation listeners during Astro View Transitions. */
function cleanupScrollAnimations() {
  scrollAnimationCleanup?.();
  scrollAnimationCleanup = undefined;
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

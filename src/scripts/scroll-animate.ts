/**
 * Scroll Animation Orchestrator
 *
 * Lightweight TypeScript that triggers CSS @keyframes animations via
 * IntersectionObserver. The actual animations run on the compositor thread
 * via CSS — this script only toggles classes.
 *
 * Also handles:
 * - Counter count-up animations (DOM text manipulation)
 * - Stagger delay conversion (transition-delay → animation-delay)
 * - Astro View Transition lifecycle hooks
 */

const ANIMATION_CLEANUP_MS = 1200;

let revealObserver: IntersectionObserver | undefined;
let counterObserver: IntersectionObserver | undefined;

// ---------------------------------------------------------------------------
// Reveal Observer (triggers CSS @keyframes via .is-visible class)
// ---------------------------------------------------------------------------

function createRevealObserver(): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const el = entry.target as HTMLElement;
        el.classList.add("is-visible");

        // Clean up will-change after animation completes
        el.addEventListener(
          "animationend",
          () => el.classList.add("is-done"),
          { once: true },
        );

        // Safety fallback in case animationend doesn't fire
        globalThis.setTimeout(() => el.classList.add("is-done"), ANIMATION_CLEANUP_MS);

        // Once revealed, stop observing (one-shot reveal)
        revealObserver?.unobserve(el);
      }
    },
    {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.05,
    },
  );
}

// ---------------------------------------------------------------------------
// Counter Animation
// ---------------------------------------------------------------------------

function animateCounter(el: HTMLElement) {
  const countToAttr = el.dataset["countTo"];
  const text = el.textContent || "";
  const numberMatches = [...text.matchAll(/\d+/g)];
  if (!countToAttr && numberMatches.length !== 1) return;

  const match = numberMatches[0];
  const targetVal =
    countToAttr !== undefined ? Number.parseInt(countToAttr, 10) : Number.parseInt(match![0], 10);
  if (Number.isNaN(targetVal)) return;

  const prefix = countToAttr ? "" : text.slice(0, match!.index);
  const suffix = countToAttr ? "" : text.slice(match!.index! + match![0].length);

  const durationAttr = el.dataset["countDuration"];
  const duration =
    durationAttr !== undefined ? Number.parseInt(durationAttr, 10) : 1800;

  const startTime = performance.now();

  function tick(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic for a natural feel
    const eased = 1 - (1 - progress) ** 3;
    const current = Math.round(eased * targetVal);

    el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
// Stagger Delay Conversion
// ---------------------------------------------------------------------------

function convertDelays() {
  const elements = document.querySelectorAll<HTMLElement>("[data-animate]");
  elements.forEach((el) => {
    const td = el.style.transitionDelay;
    if (td && td !== "0s") {
      el.style.animationDelay = td;
    }

    const dataDelay = el.dataset["delay"];
    if (dataDelay) {
      el.style.animationDelay = `${dataDelay}ms`;
    }
  });
}

// ---------------------------------------------------------------------------
// Reduced Motion Check
// ---------------------------------------------------------------------------

function getReducedMotionPreference(): boolean {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

function init() {
  cleanup();

  const reducedMotion = getReducedMotionPreference();

  // Mark system as active (enables opacity: 0 initial state in CSS)
  document.documentElement.classList.add("scroll-init");

  // Convert stagger delays
  convertDelays();

  // Reveal Observer
  if (!reducedMotion) {
    revealObserver = createRevealObserver();
    const revealElements = document.querySelectorAll<HTMLElement>("[data-animate]");
    revealElements.forEach((el) => revealObserver!.observe(el));
  }

  // Counter Observer
  counterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animateCounter(entry.target as HTMLElement);
        counterObserver!.unobserve(entry.target);
      }
    },
    { root: null, rootMargin: "0px 0px -5% 0px", threshold: 0.1 },
  );

  const counterElements = document.querySelectorAll<HTMLElement>(
    "[data-scroll-counter], [data-count-to]",
  );
  counterElements.forEach((el) => counterObserver!.observe(el));
}

function cleanup() {
  revealObserver?.disconnect();
  revealObserver = undefined;
  counterObserver?.disconnect();
  counterObserver = undefined;
  document.documentElement.classList.remove("scroll-init");
}

// Wire up Astro View Transition lifecycle hooks
document.addEventListener("astro:page-load", init);
document.addEventListener("astro:before-preparation", cleanup);

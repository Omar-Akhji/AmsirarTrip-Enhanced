/**
 * Scroll Animation Orchestrator
 *
 * Lightweight TypeScript that triggers CSS @keyframes animations via IntersectionObserver. The
 * actual animations run on the compositor thread via CSS — this script only toggles classes.
 *
 * Also handles:
 *
 * - Counter count-up animations (DOM text manipulation)
 * - Stagger delay conversion (transition-delay → animation-delay)
 * - Astro View Transition lifecycle hooks
 */

const REVEAL_CLEANUP_TIMEOUT_MS = 2500;

let revealObserver: IntersectionObserver | undefined;
let counterObserver: IntersectionObserver | undefined;

function createRevealObserver(): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;

        const el = entry.target;
        el.classList.add("is-visible");

        const cleanupTimer = globalThis.setTimeout(() => {
          el.classList.add("is-done");
        }, REVEAL_CLEANUP_TIMEOUT_MS);

        // Clean up will-change after animation completes
        el.addEventListener(
          "animationend",
          () => {
            clearTimeout(cleanupTimer);
            el.classList.add("is-done");
          },
          { once: true },
        );

        // Once revealed, stop observing (one-shot reveal)
        revealObserver?.unobserve(el);
      }
    },
    { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
  );
}

function animateCounter(el: HTMLElement) {
  const countToAttr = el.dataset["countTo"];
  const text = el.textContent;
  const numberMatches = text ? text.matchAll(/\d+/g).toArray() : [];
  if (!countToAttr && numberMatches.length !== 1) return;

  const match = numberMatches[0];
  if (!match) return;
  const targetVal = Number(countToAttr ?? match[0]);
  if (Number.isNaN(targetVal)) return;

  const prefix = countToAttr ? "" : text.slice(0, match.index);
  const suffix = countToAttr ? "" : text.slice(match.index + match[0].length);

  const durationAttr = el.dataset["countDuration"];
  const duration = durationAttr === undefined ? 1800 : Number(durationAttr);

  const startTime = performance.now();
  const docLang = typeof document === "undefined" ? "en" : document.documentElement.lang || "en";

  function tick(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic for a natural feel
    const eased = 1 - (1 - progress) ** 3;
    const current = Math.round(eased * targetVal);

    el.textContent = `${prefix}${current.toLocaleString(docLang)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function getReducedMotionPreference(): boolean {
  return (
    typeof window !== "undefined"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function init() {
  cleanup();

  const reducedMotion = getReducedMotionPreference();

  // Mark system as active (enables opacity: 0 initial state in CSS)
  document.documentElement.classList.add("scroll-init");

  if (!reducedMotion) {
    revealObserver = createRevealObserver();
    const revealElements = document.querySelectorAll<HTMLElement>("[data-animate]");
    for (const el of revealElements) {
      if (!el.closest("astro-island")) {
        revealObserver.observe(el);
      }
    }
  }

  counterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (entry.target instanceof HTMLElement) {
          animateCounter(entry.target);
        }
        counterObserver?.unobserve(entry.target);
      }
    },
    { root: null, rootMargin: "0px 0px -5% 0px", threshold: 0.1 },
  );

  const counterElements = document.querySelectorAll<HTMLElement>(
    "[data-scroll-counter], [data-count-to]",
  );
  for (const el of counterElements) {
    counterObserver.observe(el);
  }
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

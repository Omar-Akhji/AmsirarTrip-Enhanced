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

let revealObserver: IntersectionObserver | undefined;
let counterObserver: IntersectionObserver | undefined;

function createRevealObserver(): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;

        const el = entry.target;
        el.classList.add("is-visible");

        // Compute element's delay + duration to ensure safety cleanup never prematurely cuts off animation
        const computedStyle = globalThis.getComputedStyle(el);
        // eslint-disable-next-line unicorn/prefer-number-coercion -- CSS time values contain units like 's' or 'ms' which Number() parses as NaN
        const delaySec = Number.parseFloat(computedStyle.animationDelay) || 0;
        // eslint-disable-next-line unicorn/prefer-number-coercion -- CSS time values contain units like 's' or 'ms' which Number() parses as NaN
        const durSec = Number.parseFloat(computedStyle.animationDuration) || 0.75;
        const totalMs = Math.round((delaySec + durSec) * 1000) + 400;

        const cleanupTimer = globalThis.setTimeout(
          () => {
            el.classList.add("is-done");
          },
          Math.max(totalMs, 2500),
        );

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

function convertDelays() {
  const elements = document.querySelectorAll<HTMLElement>("[data-animate]");
  elements.forEach((el) => {
    const dataDelay = el.dataset["delay"];
    if (dataDelay) {
      el.style.animationDelay = `${dataDelay}ms`;
      return;
    }

    const inlineTd = el.style.transitionDelay;
    if (inlineTd && inlineTd !== "0s") {
      el.style.animationDelay = inlineTd;
      return;
    }

    const computedTd = globalThis.getComputedStyle(el).transitionDelay;
    if (computedTd && computedTd !== "0s" && computedTd !== "0ms") {
      el.style.animationDelay = computedTd;
    }
  });
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

  convertDelays();

  if (!reducedMotion) {
    revealObserver = createRevealObserver();
    const revealElements = document.querySelectorAll<HTMLElement>("[data-animate]");
    revealElements.forEach((el) => revealObserver?.observe(el));
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
  counterElements.forEach((el) => counterObserver?.observe(el));
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

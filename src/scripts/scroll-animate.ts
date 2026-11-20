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

        el.addEventListener(
          "animationend",
          () => {
            clearTimeout(cleanupTimer);
            el.classList.add("is-done");
          },
          { once: true },
        );

        revealObserver?.unobserve(el);
      }
    },
    { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
  );
}

function animateCounter(el: HTMLElement): void {
  const countToAttr = el.dataset["countTo"];
  const text = el.textContent;
  const numberMatches = text ? text.matchAll(/\d+/g).toArray() : [];
  if (!countToAttr && numberMatches.length !== 1) return;

  const match = numberMatches[0];
  const targetVal = Number(countToAttr ?? match?.[0]);
  if (Number.isNaN(targetVal)) return;

  const prefix = countToAttr || !match ? "" : text.slice(0, match.index);
  const suffix = countToAttr || !match ? "" : text.slice(match.index + match[0].length);

  const durationAttr = el.dataset["countDuration"];
  const duration = durationAttr === undefined ? 1800 : Number(durationAttr);
  const startTime = performance.now();
  const docLang = typeof document === "undefined" ? "en" : document.documentElement.lang || "en";

  function tick(now: number): void {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
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

function startObserving(): void {
  if (getReducedMotionPreference()) return;

  revealObserver = createRevealObserver();
  const revealElements = document.querySelectorAll<HTMLElement>("[data-animate]");
  for (const el of revealElements) {
    if (!el.closest("astro-island")) {
      revealObserver.observe(el);
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

function init(): void {
  cleanup();
  document.documentElement.classList.add("scroll-init");
  startObserving();
}

function cleanup(): void {
  revealObserver?.disconnect();
  revealObserver = undefined;
  counterObserver?.disconnect();
  counterObserver = undefined;
  document.documentElement.classList.remove("scroll-init");
}

document.addEventListener("astro:page-load", init);
document.addEventListener("astro:before-preparation", cleanup);

/**
 * Native Scroll Animation System Highly optimized, SEO-friendly, and lightweight animation system.
 * Handles:
 *
 * 1. Scroll Reveals (IntersectionObserver)
 * 2. Count-up Stats (IntersectionObserver + requestAnimationFrame)
 * 3. Parallax Scrubbing (IntersectionObserver + requestAnimationFrame throttle)
 * 4. Astro ClientRouter View Transitions Integration
 */

const COUNTER_DEFAULT_DURATION_MS = 1200;
const COUNTER_MIN_DURATION_MS = 300;
const COUNTER_MAX_DURATION_MS = 3000;
const REVEAL_CLEANUP_DELAY_MS = 1200;

// Track visible parallax elements to optimize scroll updates
const activeParallaxElements = new Set<HTMLElement>();
let pageUsesScrollProgress = false;
let initialized = false;
let ticking = false;
let abortController: AbortController | undefined;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function getReducedMotionPreference() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function finishReveal(el: HTMLElement) {
  el.classList.remove("is-revealing");
}

// 1. Reveal Observer (triggers fade-in/up/down/zoom/etc.)
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      const once = el.dataset["animateOnce"] !== "false";

      if (entry.isIntersecting) {
        el.classList.add("is-revealing", "is-visible");
        el.addEventListener("transitionend", () => finishReveal(el), { once: true });
        globalThis.setTimeout(() => finishReveal(el), REVEAL_CLEANUP_DELAY_MS);

        if (once) {
          revealObserver.unobserve(el);
        }
      } else {
        if (!once) {
          el.classList.remove("is-visible");
        }
      }
    }
  },
  {
    root: null,
    rootMargin: "0px 0px -8% 0px", // Trigger slightly before entering viewport fully
    threshold: 0.05,
  },
);

// 2. Stats Counter Observer (triggers count-up animations)
const counterObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      animateCounter(entry.target as HTMLElement);
      counterObserver.unobserve(entry.target);
    }
  },
  { root: null, rootMargin: "0px 0px -5% 0px", threshold: 0.1 },
);

// 3. Parallax Observer (tracks which elements are in view to calculate offsets)
const parallaxObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      if (entry.isIntersecting) {
        activeParallaxElements.add(el);
        el.classList.add("is-parallax-active");
      } else {
        activeParallaxElements.delete(el);
        el.classList.remove("is-parallax-active");
      }
    }
    // Trigger update once elements are added/removed
    onScrollOrResize();
  },
  {
    root: null,
    rootMargin: "15% 0px 15% 0px", // Wide margin so offsets start/stop smoothly outside viewport
    threshold: 0,
  },
);

/** Counts up the digits in an element's text content */
function animateCounter(el: HTMLElement) {
  const countToAttr = el.dataset["countTo"];
  const text = el.textContent || "";
  const numberMatches = text.matchAll(/\d+/g).toArray();
  if (!countToAttr && numberMatches.length !== 1) return;

  const match = numberMatches[0];
  const targetVal =
    countToAttr ? Number(countToAttr)
    : match ? Number(match[0])
    : 0;
  if (!Number.isFinite(targetVal)) return;

  const prefix = match ? text.slice(0, match.index) : "";
  const suffix = match ? text.slice((match.index ?? 0) + match[0].length) : "";
  const formatter = new Intl.NumberFormat(document.documentElement.lang || undefined);

  if (getReducedMotionPreference()) {
    el.textContent = `${prefix}${formatter.format(targetVal)}${suffix}`;
    return;
  }

  const durationAttr = el.dataset["counterDuration"] || el.dataset["countDuration"];
  const requestedDuration = durationAttr ? Number(durationAttr) : COUNTER_DEFAULT_DURATION_MS;
  const duration =
    Number.isFinite(requestedDuration) ?
      clamp(requestedDuration, COUNTER_MIN_DURATION_MS, COUNTER_MAX_DURATION_MS)
    : COUNTER_DEFAULT_DURATION_MS;
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Out-expo easing: 1 - 2^(-10 * progress)
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentVal = Math.floor(easeProgress * targetVal);

    el.textContent = `${prefix}${formatter.format(currentVal)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/** Updates CSS Custom Properties for active parallax elements and global progress */
function updateScrollValues() {
  const currentScrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;

  if (pageUsesScrollProgress) {
    const scrollHeight = docHeight - winHeight;
    const globalProgress = scrollHeight > 0 ? clamp(currentScrollY / scrollHeight) : 0;
    document.documentElement.style.setProperty(
      "--scroll-progress-global",
      globalProgress.toFixed(4),
    );
  }

  if (activeParallaxElements.size > 0) {
    activeParallaxElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elementHeight = rect.height;

      // Calculate progress of element through viewport (0 = enters bottom, 1 = leaves top)
      const totalRange = winHeight + elementHeight;
      const currentPos = winHeight - rect.top;
      const progress = totalRange > 0 ? clamp(currentPos / totalRange) : 0;

      // Parse speed modifier (positive = moves with scroll, negative = moves opposite)
      const speedAttr = el.dataset["scrollSpeed"];
      const speedValue = speedAttr ? Number(speedAttr) : 0.1;
      const speed = Number.isFinite(speedValue) ? clamp(speedValue, -0.5, 0.5) : 0.1;

      // Calculate translation offset centered around the middle of viewport
      const translateY = (progress - 0.5) * winHeight * speed;

      el.style.setProperty("--scroll-progress", progress.toFixed(4));
      el.style.setProperty("--scroll-translate-y", `${translateY.toFixed(1)}px`);
    });
  }
}

/** Throttles scroll and resize triggers using requestAnimationFrame */
function onScrollOrResize() {
  if (ticking) {
    return;
  }

  globalThis.requestAnimationFrame(() => {
    updateScrollValues();
    ticking = false;
  });
  ticking = true;
}

/** Initializes observers and event listeners on page load */
function init() {
  if (initialized) {
    cleanup();
  }

  initialized = true;
  abortController = new AbortController();
  const { signal } = abortController;
  const reducedMotion = getReducedMotionPreference();

  // Let styles know the JS system is active
  document.documentElement.classList.add("reveal-init");

  // Reveal animations
  const revealElements = document.querySelectorAll<HTMLElement>("[data-animate]");
  revealElements.forEach((el) => {
    if (reducedMotion) {
      el.classList.add("is-visible");
      return;
    }

    revealObserver.observe(el);
  });

  // Count up stats and facts
  const counterElements = document.querySelectorAll<HTMLElement>(
    "[data-scroll-counter], [data-count-to]",
  );
  counterElements.forEach((el) => counterObserver.observe(el));

  // Parallax scrubbing
  const parallaxElements = document.querySelectorAll<HTMLElement>(
    "[data-scroll-parallax], [data-scroll-speed]",
  );
  if (!reducedMotion) {
    parallaxElements.forEach((el) => parallaxObserver.observe(el));
  }

  pageUsesScrollProgress = document.querySelector("[data-scroll-progress]") !== null;

  if (!reducedMotion && (parallaxElements.length > 0 || pageUsesScrollProgress)) {
    window.addEventListener("scroll", onScrollOrResize, { passive: true, signal });
    window.addEventListener("resize", onScrollOrResize, { passive: true, signal });

    // Run initial pass to set initial values
    updateScrollValues();
  }
}

/** Cleans up observers and listeners before view transition swap to avoid memory leaks */
function cleanup() {
  initialized = false;

  // Disconnect all observers
  revealObserver.disconnect();
  counterObserver.disconnect();
  parallaxObserver.disconnect();

  activeParallaxElements.forEach((el) => {
    el.classList.remove("is-parallax-active");
    el.style.removeProperty("--scroll-progress");
    el.style.removeProperty("--scroll-translate-y");
  });

  // Clear tracked sets
  activeParallaxElements.clear();

  abortController?.abort();
  abortController = undefined;

  // Remove initialization flag
  document.documentElement.classList.remove("reveal-init");
  document.documentElement.style.removeProperty("--scroll-progress-global");
  pageUsesScrollProgress = false;
  ticking = false;
}

// Wire up Astro View Transition lifecycle hooks
document.addEventListener("astro:page-load", init);
document.addEventListener("astro:before-preparation", cleanup);

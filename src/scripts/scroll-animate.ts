/**
 * Native Scroll Animation System
 * Highly optimized, SEO-friendly, and lightweight animation system.
 * Handles:
 * 1. Scroll Reveals (IntersectionObserver)
 * 2. Count-up Stats (IntersectionObserver + requestAnimationFrame)
 * 3. Parallax Scrubbing (IntersectionObserver + requestAnimationFrame throttle)
 * 4. Astro ClientRouter View Transitions Integration
 */

// Track visible parallax elements to optimize scroll updates
const activeParallaxElements = new Set<HTMLElement>();
let ticking = false;

// 1. Reveal Observer (triggers fade-in/up/down/zoom/etc.)
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      const once = el.dataset["animateOnce"] !== "false";

      if (entry.isIntersecting) {
        el.classList.add("is-visible");
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
      } else {
        activeParallaxElements.delete(el);
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

/**
 * Counts up the digits in an element's text content
 */
function animateCounter(el: HTMLElement) {
  const countToAttr = el.dataset["countTo"];
  const text = el.textContent || "";
  const match = text.match(/\d+/);

  if (!match && !countToAttr) return;

  const targetVal =
    countToAttr ? Number(countToAttr)
    : match ? Number(match[0])
    : 0;
  const prefix = match ? text.slice(0, match.index) : "";
  const suffix = match ? text.slice((match.index ?? 0) + match[0].length) : "";

  const durationAttr = el.dataset["counterDuration"] || el.dataset["countDuration"];
  const duration = durationAttr ? Number(durationAttr) : 1500;
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Out-expo easing: 1 - 2^(-10 * progress)
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentVal = Math.floor(easeProgress * targetVal);

    el.textContent = `${prefix}${currentVal.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Updates CSS Custom Properties for active parallax elements and global progress
 */
function updateScrollValues() {
  const currentScrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;
  const scrollHeight = docHeight - winHeight;

  // 1. Update global scroll progress variable on <html>
  const globalProgress =
    scrollHeight > 0 ? Math.max(0, Math.min(currentScrollY / scrollHeight, 1)) : 0;
  document.documentElement.style.setProperty("--scroll-progress-global", globalProgress.toFixed(4));

  // 2. Update active parallax elements
  if (activeParallaxElements.size > 0) {
    activeParallaxElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elementHeight = rect.height;

      // Calculate progress of element through viewport (0 = enters bottom, 1 = leaves top)
      const totalRange = winHeight + elementHeight;
      const currentPos = winHeight - rect.top;
      const progress = totalRange > 0 ? Math.max(0, Math.min(currentPos / totalRange, 1)) : 0;

      // Parse speed modifier (positive = moves with scroll, negative = moves opposite)
      const speedAttr = el.dataset["scrollSpeed"];
      const speed = speedAttr ? Number(speedAttr) : 0.1;

      // Calculate translation offset centered around the middle of viewport
      const translateY = (progress - 0.5) * winHeight * speed;

      el.style.setProperty("--scroll-progress", progress.toFixed(4));
      el.style.setProperty("--scroll-translate-y", `${translateY.toFixed(1)}px`);
    });
  }
}

/**
 * Throttles scroll and resize triggers using requestAnimationFrame
 */
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

/**
 * Initializes observers and event listeners on page load
 */
function init() {
  // Let styles know the JS system is active
  document.documentElement.classList.add("reveal-init");

  // Reveal animations
  const revealElements = document.querySelectorAll("[data-animate]");
  revealElements.forEach((el) => revealObserver.observe(el));

  // Count up stats and facts
  const counterElements = document.querySelectorAll("[data-scroll-counter], [data-count-to]");
  counterElements.forEach((el) => counterObserver.observe(el));

  // Parallax scrubbing
  const parallaxElements = document.querySelectorAll("[data-scroll-parallax], [data-scroll-speed]");
  parallaxElements.forEach((el) => parallaxObserver.observe(el));

  // Window scroll & resize handlers
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize, { passive: true });

  // Run initial pass to set initial values
  updateScrollValues();
}

/**
 * Cleans up observers and listeners before view transition swap to avoid memory leaks
 */
function cleanup() {
  // Disconnect all observers
  revealObserver.disconnect();
  counterObserver.disconnect();
  parallaxObserver.disconnect();

  // Clear tracked sets
  activeParallaxElements.clear();

  // Remove global window listeners
  window.removeEventListener("scroll", onScrollOrResize);
  window.removeEventListener("resize", onScrollOrResize);

  // Remove initialization flag
  document.documentElement.classList.remove("reveal-init");
}

// Wire up Astro View Transition lifecycle hooks
document.addEventListener("astro:page-load", init);
document.addEventListener("astro:before-preparation", cleanup);

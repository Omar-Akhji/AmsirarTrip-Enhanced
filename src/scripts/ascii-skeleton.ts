import {
  animateSkeleton,
  createAsciiReveal,
  type AsciiRevealController,
  type AsciiRevealOptions,
  type Duration,
  type Origin,
  type Preset,
  type PresetName,
} from "ascii-reveal/core";

/**
 * Finely calibrated ASCII dither preset with a high refresh rate tick (48ms / ~21fps) and 5
 * progressive cell sizes for realistic, silky-smooth character & image decodes.
 */
export const SMOOTH_DITHER_PRESET: Preset = {
  ramp: "░▒▓█",
  scramble: "░▒▓█",
  mode: "ramp",
  color: "source",
  cells: [18, 13, 9, 6, 4],
  tick: 48,
};

let stopGlobalShimmer: (() => void) | null = null;
let activePageReveal: AsciiRevealController | null = null;

const noop = (): void => {
  // Safe no-op for SSR or reduced-motion environments
};

/**
 * Initializes ASCII skeleton shimmer animations within a given scope. Safe for SSR and respects
 * prefers-reduced-motion.
 *
 * Skeletons inside hidden containers (such as `#skeleton-container` before it's displayed) are
 * skipped during document load so they never get registered with 0x0 canvas bounds.
 *
 * Pass `{ force: true }` when an active skeleton is unhidden to immediately measure and run its
 * ~30fps glyph shimmer canvas.
 */
export function initAsciiSkeletons(
  scope: ParentNode = document,
  options?: { force?: boolean },
): () => void {
  if (
    typeof window === "undefined"
    || typeof document === "undefined"
    || globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return noop;
  }

  // If re-initializing the entire document, clean up previous frame loops
  if (scope === document && stopGlobalShimmer) {
    stopGlobalShimmer();
    stopGlobalShimmer = null;
  }

  // Find candidate skeleton elements: include scope itself if it matches, plus descendants
  const elements: HTMLElement[] = [];
  if (scope instanceof HTMLElement && scope.matches("[data-ars-animate]")) {
    elements.push(scope);
  }
  elements.push(...scope.querySelectorAll<HTMLElement>("[data-ars-animate]"));

  // Filter: Unless forced, skip elements that are inside hidden containers
  const visibleElements =
    options?.force ? elements : (
      elements.filter((el) => {
        return !el.parentElement?.closest(".hidden, [aria-hidden='true']");
      })
    );

  const cleanups: (() => void)[] = [];

  for (const el of visibleElements) {
    // Check if element has an existing canvas or previous registration with 0 size
    const existingCanvas = el.querySelector("canvas");
    if (existingCanvas && (existingCanvas.width <= 1 || existingCanvas.clientHeight === 0)) {
      // Invoking animateSkeleton on an already registered element returns its cleanup function;
      // calling it immediately purges the stale 0x0 registration from Pe/pe and removes the canvas.
      const purge = animateSkeleton(el);
      purge();
    }

    // Start fresh skeleton shimmer animation with real rendered dimensions
    const stop = animateSkeleton(el);
    cleanups.push(stop);
  }

  const stopAll = (): void => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };

  if (scope === document) {
    stopGlobalShimmer = stopAll;
  }

  return stopAll;
}

/** Attaches a dynamic ASCII reveal effect to an element (defaults to "dither" preset). */
export function revealWithAscii(
  element: HTMLElement,
  options?: AsciiRevealOptions,
): AsciiRevealController | undefined {
  if (typeof window === "undefined") return undefined;

  const controller = createAsciiReveal(element, {
    preset: "dither",
    duration: "fast",
    speed: 2,
    origin: "center",
    ...options,
  });

  return controller;
}

/** Cancels and disposes any running ASCII reveal controllers to prevent memory or canvas leaks */
export function cleanupAsciiReveals(): void {
  if (activePageReveal) {
    try {
      activePageReveal.destroy();
    } catch {
      // safe cleanup
    }
    activePageReveal = null;
  }

  if (typeof document !== "undefined") {
    document.querySelectorAll<HTMLElement>(".ar-overlay").forEach((el) => {
      el.remove();
    });
  }
}

/**
 * Triggers full-page or section ASCII reveal using the "dither" preset. Decodes text and images
 * seamlessly through the character grid after skeleton ends.
 */
export function triggerPageReveal(
  scope?: HTMLElement | null,
  options?: Partial<AsciiRevealOptions>,
): AsciiRevealController | undefined {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return undefined;
  }

  const target = scope ?? document.querySelector<HTMLElement>("#page-content") ?? document.body;

  // Graceful reduced motion handling
  if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.style.opacity = "1";
    return undefined;
  }

  cleanupAsciiReveals();

  const controller = createAsciiReveal(target, {
    preset: SMOOTH_DITHER_PRESET,
    duration: "cinematic",
    speed: 2,
    lazy: false,
    fallback: false,
    origin: "center",
    ...options,
  });

  activePageReveal = controller;

  // Run the dither reveal wave
  void controller.reveal().then(() => {
    if (activePageReveal === controller) {
      activePageReveal = null;
    }
  });

  return controller;
}

/** Scans and initializes any mounted [data-ascii-reveal] or [data-ascii-reveal-preset] containers. */
export function initAsciiReveals(scope: ParentNode = document): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const targets = scope.querySelectorAll<HTMLElement>(
    "[data-ascii-reveal]:not([data-ar-ready]), [data-ascii-reveal-preset]:not([data-ar-ready])",
  );

  targets.forEach((el) => {
    el.dataset["arReady"] = "true";
    const presetAttr = el.dataset["asciiRevealPreset"] ?? el.dataset["asciiReveal"];
    const preset = (presetAttr && presetAttr.length > 0 ? presetAttr : "dither") as PresetName;
    const duration = (el.dataset["asciiRevealDuration"] ?? "fast") as Duration;
    const speedRaw = el.dataset["asciiRevealSpeed"];
    const speed = speedRaw ? Number(speedRaw) : 2;

    const originAttr = el.dataset["asciiRevealOrigin"];
    let origin: Origin = "center";
    if (originAttr) {
      if (originAttr.startsWith("{")) {
        try {
          origin = JSON.parse(originAttr) as { x: number; y: number };
        } catch {
          origin = "center";
        }
      } else if (["top-left", "pointer", "center"].includes(originAttr)) {
        origin = originAttr as Origin;
      }
    }

    const isLazy = el.dataset["asciiRevealLazy"] === "true";
    const ctrl = revealWithAscii(el, { preset, duration, speed, origin, lazy: isLazy });
    void ctrl?.reveal();
  });
}

// Auto-run on document ready & Astro view transition events
if (typeof window !== "undefined") {
  const onReady = (): void => {
    initAsciiSkeletons();
    initAsciiReveals();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady, { once: true });
  } else {
    onReady();
  }

  document.addEventListener("astro:page-load", () => {
    onReady();
  });

  document.addEventListener("astro:before-preparation", () => {
    cleanupAsciiReveals();
  });
}

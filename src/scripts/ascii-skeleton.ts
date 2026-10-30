import {
  animateSkeletons,
  createAsciiReveal,
  type AsciiRevealController,
  type AsciiRevealOptions,
  type Duration,
  type PresetName,
} from "ascii-reveal/core";

let stopGlobalShimmer: (() => void) | null = null;

const noop = (): void => {
  // Safe no-op for SSR or reduced-motion environments
};

/**
 * Initializes ASCII skeleton shimmer animations within a given scope. Safe for SSR and respects
 * prefers-reduced-motion.
 */
export function initAsciiSkeletons(scope: ParentNode = document): () => void {
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

  const stop = animateSkeletons(scope);

  if (scope === document) {
    stopGlobalShimmer = stop;
  }

  return stop;
}

/** Attaches a dynamic ASCII reveal effect to an element (e.g. for decoding content on mount). */
export function revealWithAscii(
  element: HTMLElement,
  options?: AsciiRevealOptions,
): AsciiRevealController | undefined {
  if (typeof window === "undefined") return undefined;

  const controller = createAsciiReveal(element, {
    preset: "decode",
    duration: "fast",
    speed: 1,
    ...options,
  });

  return controller;
}

/** Scans and initializes any mounted [data-ascii-reveal-preset] containers. */
export function initAsciiReveals(scope: ParentNode = document): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const targets = scope.querySelectorAll<HTMLElement>(
    "[data-ascii-reveal-preset]:not([data-ar-ready])",
  );

  targets.forEach((el) => {
    el.dataset["arReady"] = "true";
    const preset = (el.dataset["asciiRevealPreset"] ?? "decode") as PresetName;
    const duration = (el.dataset["asciiRevealDuration"] ?? "fast") as Duration;
    const speedRaw = el.dataset["asciiRevealSpeed"];
    const speed = speedRaw ? Number(speedRaw) : 1;
    const origin = el.dataset["asciiRevealOrigin"] as "center" | "top-left" | "pointer" | undefined;

    const ctrl = revealWithAscii(el, { preset, duration, speed, origin });
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
}

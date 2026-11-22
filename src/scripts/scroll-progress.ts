const SUPPORTS_SCROLL_TIMELINE =
  typeof CSS !== "undefined" && CSS.supports("animation-timeline", "scroll()");

let ticking = false;
let progressController: AbortController | null = null;

function updateProgress(): void {
  const bar = document.querySelector<HTMLElement>("#scrollProgressBar");
  if (!bar) {
    ticking = false;
    return;
  }

  const doc = document.documentElement;
  const totalHeight = doc.scrollHeight - window.innerHeight;

  if (totalHeight <= 0) {
    bar.style.transformOrigin = "top center";
    bar.style.transform = "scaleY(0)";
    bar.style.opacity = "0";
    ticking = false;
    return;
  }

  const scrollY = window.scrollY || doc.scrollTop || 0;
  const progress = Math.min(Math.max(scrollY / totalHeight, 0), 1);

  bar.style.transformOrigin = "top center";
  bar.style.transform = `scaleY(${progress})`;
  bar.style.opacity = progress > 0.001 ? "1" : "0";
  ticking = false;
}

function onScroll(): void {
  if (ticking) return;
  globalThis.requestAnimationFrame(updateProgress);
  ticking = true;
}

function setupScrollProgress(): void {
  progressController?.abort();
  progressController = new AbortController();
  const { signal } = progressController;

  const container = document.querySelector<HTMLElement>("#scrollProgressBarContainer");
  if (container) {
    container.addEventListener(
      "click",
      (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const ratio = Math.min(Math.max(clickY / Math.max(1, rect.height), 0), 1);
        const doc = document.documentElement;
        const targetScroll = ratio * (doc.scrollHeight - window.innerHeight);
        const prefersReduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: targetScroll, behavior: prefersReduced ? "auto" : "smooth" });
      },
      { signal },
    );
  }

  if (SUPPORTS_SCROLL_TIMELINE) return;

  updateProgress();
  window.addEventListener("scroll", onScroll, { passive: true, signal });
  window.addEventListener("resize", onScroll, { passive: true, signal });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupScrollProgress, { once: true });
} else {
  setupScrollProgress();
}

globalThis.addEventListener(
  "pagehide",
  () => {
    progressController?.abort();
    progressController = null;
    ticking = false;
  },
  { once: true },
);

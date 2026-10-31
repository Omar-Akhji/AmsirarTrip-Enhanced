import type { TransitionBeforePreparationEvent } from "astro:transitions/client";
import { initAsciiSkeletons } from "./ascii-skeleton";

const SKELETON_DEV_DELAY_MS = 800;
const PROGRESS_BAR_ID = "page-progress-bar";

let progressTimer: ReturnType<typeof setInterval> | undefined;
let progressResetTimeout: ReturnType<typeof setTimeout> | undefined;
let progressValue = 0;

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function isPreparationEvent(event: Event): event is TransitionBeforePreparationEvent {
  return "to" in event && event.to instanceof URL;
}

function getProgressBar(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`#${PROGRESS_BAR_ID}`);
}

function startProgressBar(): void {
  const bar = getProgressBar();
  if (!bar) return;

  clearTimeout(progressResetTimeout);
  clearInterval(progressTimer);

  progressValue = 25;
  bar.style.opacity = "1";
  bar.style.transform = "scaleX(0.25)";
  bar.style.transition = "transform 250ms cubic-bezier(0.23, 1, 0.32, 1), opacity 150ms ease";

  progressTimer = setInterval(() => {
    if (progressValue >= 85) return;
    progressValue += Math.random() * 12 + 4;
    const scale = Math.min(progressValue, 85) / 100;
    bar.style.transform = `scaleX(${scale.toFixed(3)})`;
  }, 180);
}

function finishProgressBar(): void {
  const bar = getProgressBar();
  if (!bar) return;

  clearInterval(progressTimer);
  progressValue = 100;
  bar.style.transform = "scaleX(1)";
  bar.style.transition = "transform 180ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease 120ms";
  bar.style.opacity = "0";

  progressResetTimeout = setTimeout(() => {
    if (progressValue < 100) return;
    bar.style.transform = "scaleX(0)";
    bar.style.transition = "none";
  }, 350);
}

/**
 * Resolves any localized pathname to its skeleton route identifier. Pure function for testing and
 * predictability.
 */
export function resolveSkeletonRoute(pathname: string): string {
  // Normalize and strip leading / trailing slashes
  const clean = pathname.replace(/^\/+/, "").replace(/\/+$/, "");

  // Strip supported locale prefixes (en, fr, es, de)
  const segments = clean.split("/").filter(Boolean);
  if (segments[0] && ["en", "fr", "es", "de"].includes(segments[0].toLowerCase())) {
    segments.shift();
  }

  const routePath = segments.join("/").toLowerCase();

  if (!routePath) {
    return "home";
  }

  if (routePath.startsWith("tours")) {
    return segments.length >= 2 ? "tour-detail" : "tours";
  }

  if (routePath.startsWith("excursions")) {
    return segments.length >= 2 ? "excursion-detail" : "excursions";
  }

  if (routePath.startsWith("contact")) {
    return "contact";
  }

  if (routePath.startsWith("about")) {
    return "about";
  }

  if (routePath.startsWith("privacy-policy") || routePath.startsWith("terms-of-service")) {
    return "legal";
  }

  return "default";
}

function showSkeleton(routeKey: string): void {
  const container = document.querySelector<HTMLElement>("#skeleton-container");
  const content = document.querySelector<HTMLElement>("#page-content");
  if (!container || !content) return;

  let targetSkeleton = container.querySelector(`[data-skeleton="${CSS.escape(routeKey)}"]`);
  targetSkeleton ??= container.querySelector('[data-skeleton="default"]');

  if (!targetSkeleton) return;

  // Hide all inner skeletons first
  container.querySelectorAll("[data-skeleton]").forEach((el) => {
    el.classList.add("hidden");
  });

  // Reveal targeted skeleton
  targetSkeleton.classList.remove("hidden");
  container.classList.remove("hidden");
  container.removeAttribute("aria-hidden");
  container.style.opacity = "1";
  content.classList.add("hidden");

  // Animate the ASCII skeleton shimmer on the active skeleton
  initAsciiSkeletons(targetSkeleton);
}

function hideSkeleton(): void {
  const container = document.querySelector<HTMLElement>("#skeleton-container");
  const content = document.querySelector<HTMLElement>("#page-content");
  if (!container || !content) return;

  container.style.transition = "opacity 200ms ease";
  container.style.opacity = "0";

  setTimeout(() => {
    container.classList.add("hidden");
    container.setAttribute("aria-hidden", "true");
    container.style.opacity = "1";
    content.classList.remove("hidden");
    content.style.opacity = "0";
    content.style.transition = "opacity 250ms ease";
    requestAnimationFrame(() => {
      content.style.opacity = "1";
    });
  }, 200);
}

// Initial page load skeleton with wait
let initialLoadShown = false;
function handleInitialLoad(): void {
  if (initialLoadShown) return;
  initialLoadShown = true;

  if (!globalThis.location.hash) {
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }

  const routeKey = resolveSkeletonRoute(globalThis.location.pathname);
  showSkeleton(routeKey);

  // Keep skeleton visible for SKELETON_DEV_DELAY_MS so the user sees the skeleton
  setTimeout(() => {
    hideSkeleton();
  }, SKELETON_DEV_DELAY_MS);
}

// Client-side router navigation hooks (astro:before-preparation & astro:after-swap)
document.addEventListener("astro:before-preparation", (e: Event) => {
  if (!isPreparationEvent(e)) return;

  startProgressBar();

  // Scroll to header immediately when navigating to another page without hash
  if (!e.to.hash) {
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }

  // In development mode (or on client nav), delay page loader so skeleton transition is visible
  const originalLoader = e.loader;
  e.loader = async (): Promise<void> => {
    await Promise.all([originalLoader(), delay(SKELETON_DEV_DELAY_MS)]);
  };

  const toPath = e.to.pathname;
  const routeKey = resolveSkeletonRoute(toPath);
  showSkeleton(routeKey);
});

document.addEventListener("astro:after-swap", () => {
  if (!globalThis.location.hash) {
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }
  hideSkeleton();
  finishProgressBar();
});

document.addEventListener("astro:page-load", () => {
  finishProgressBar();
});

// Run initial load skeleton on first script execution
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", handleInitialLoad, { once: true });
} else {
  handleInitialLoad();
}

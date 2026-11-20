import type { TransitionBeforePreparationEvent } from "astro:transitions/client";

const PROGRESS_BAR_ID = "page-progress-bar";
const PROGRESS_SHOW_DELAY_MS = 150;

let progressDelayTimer: ReturnType<typeof setTimeout> | undefined;
let progressTimer: ReturnType<typeof setInterval> | undefined;
let progressResetTimeout: ReturnType<typeof setTimeout> | undefined;
let progressValue = 0;

function isPreparationEvent(event: Event): event is TransitionBeforePreparationEvent {
  return "to" in event && event.to instanceof URL;
}

function getProgressBar(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`#${PROGRESS_BAR_ID}`);
}

function startProgressBar(): void {
  const bar = getProgressBar();
  if (!bar) return;

  clearTimeout(progressDelayTimer);
  clearTimeout(progressResetTimeout);
  clearInterval(progressTimer);

  progressDelayTimer = setTimeout(() => {
    progressValue = 25;
    bar.style.opacity = "1";
    bar.style.scale = "0.25 1";
    bar.style.transition = "scale 250ms cubic-bezier(0.23, 1, 0.32, 1), opacity 150ms ease";

    progressTimer = setInterval(() => {
      if (progressValue >= 85) return;
      progressValue += Math.random() * 12 + 4;
      const scale = Math.min(progressValue, 85) / 100;
      bar.style.scale = `${scale.toFixed(3)} 1`;
    }, 180);
  }, PROGRESS_SHOW_DELAY_MS);
}

function finishProgressBar(): void {
  clearTimeout(progressDelayTimer);
  clearInterval(progressTimer);

  const bar = getProgressBar();
  if (!bar) return;

  if (bar.style.opacity !== "1") {
    progressValue = 0;
    return;
  }

  progressValue = 100;
  bar.style.scale = "1 1";
  bar.style.transition = "scale 180ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease 120ms";
  bar.style.opacity = "0";

  progressResetTimeout = setTimeout(() => {
    if (progressValue < 100) return;
    bar.style.scale = "0 1";
    bar.style.transition = "none";
  }, 350);
}

function resetScrollIfNoHash(url: URL | Location): void {
  if (url.hash) return;
  if (globalThis.scrollX === 0 && globalThis.scrollY === 0) return;
  globalThis.scrollTo({ left: 0, top: 0, behavior: "instant" });
}

document.addEventListener("astro:before-preparation", (event: Event) => {
  if (!isPreparationEvent(event)) return;
  startProgressBar();
});

document.addEventListener("astro:after-swap", () => {
  resetScrollIfNoHash(globalThis.location);
});

document.addEventListener("astro:page-load", finishProgressBar);

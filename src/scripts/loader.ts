const LOADER_ID = "initial-loader";
const PROGRESS_BAR_ID = "page-progress-bar";
const HIDE_DELAY = 400;
const FIRST_LOAD_TIMEOUT = 2500;

let hideTimeoutId: ReturnType<typeof setTimeout> | undefined;
let fallbackTimeoutId: ReturnType<typeof setTimeout> | undefined;
let progressTimer: ReturnType<typeof setInterval> | undefined;
let progressFinishTimeout: ReturnType<typeof setTimeout> | undefined;
let progressResetTimeout: ReturnType<typeof setTimeout> | undefined;
let progressValue = 0;

function getLoader(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`#${LOADER_ID}`);
}

function getProgressBar(): HTMLElement | null {
  return document.querySelector<HTMLElement>(`#${PROGRESS_BAR_ID}`);
}

function hideInitialLoader(): void {
  const loader = getLoader();
  if (!loader || loader.dataset["state"] === "hidden") return;

  clearTimeout(hideTimeoutId);
  loader.dataset["state"] = "hidden";
  hideTimeoutId = setTimeout(() => {
    loader.hidden = true;
  }, HIDE_DELAY);
}

function finishFirstLoad(): void {
  clearTimeout(fallbackTimeoutId);
  hideInitialLoader();
}

function startNavigationProgress(): void {
  const bar = getProgressBar();
  if (!bar) return;

  clearTimeout(progressFinishTimeout);
  clearTimeout(progressResetTimeout);
  clearInterval(progressTimer);

  progressValue = 18;
  bar.style.opacity = "1";
  bar.style.width = "18%";
  bar.style.transition = "width 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease";

  progressTimer = setInterval(() => {
    if (progressValue >= 82) return;
    progressValue += Math.random() * 12 + 4;
    bar.style.width = `${Math.min(progressValue, 85).toString()}%`;
  }, 180);
}

function finishNavigationProgress(): void {
  const bar = getProgressBar();
  if (!bar) return;

  clearInterval(progressTimer);
  progressValue = 100;
  bar.style.width = "100%";
  bar.style.transition = "width 180ms ease-out, opacity 250ms ease 180ms";
  bar.style.opacity = "0";

  progressResetTimeout = setTimeout(() => {
    if (progressValue < 100) return;
    bar.style.width = "0%";
    bar.style.transition = "none";
  }, 450);
}

// Ensure initial loader displays during first load
const loader = getLoader();
if (loader && loader.dataset["state"] !== "hidden") {
  loader.hidden = false;
  loader.dataset["state"] = "visible";
}

const root = document.documentElement;
if (root.dataset["loaderBound"] !== "true") {
  root.dataset["loaderBound"] = "true";

  // Client-side router navigation hooks
  document.addEventListener("astro:before-preparation", startNavigationProgress);
  document.addEventListener("astro:after-swap", finishNavigationProgress);
  document.addEventListener("astro:page-load", () => {
    finishFirstLoad();
    finishNavigationProgress();
  });

  window.addEventListener("pageshow", finishFirstLoad, { once: true });
  window.addEventListener("load", finishFirstLoad, { once: true });
}

if (document.readyState === "complete") {
  queueMicrotask(finishFirstLoad);
} else {
  fallbackTimeoutId = setTimeout(finishFirstLoad, FIRST_LOAD_TIMEOUT);
}

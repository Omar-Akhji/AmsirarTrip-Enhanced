const LOADER_ID = "initial-loader";
const HIDE_DELAY = 450;
const FIRST_LOAD_TIMEOUT = 2500;

let hideTimeoutId: ReturnType<typeof setTimeout> | undefined;
let fallbackTimeoutId: ReturnType<typeof setTimeout> | undefined;

function getLoader() {
  return document.querySelector<HTMLElement>(`#${LOADER_ID}`);
}

function showLoader() {
  const loader = getLoader();
  if (!loader) return;

  clearTimeout(hideTimeoutId);
  loader.hidden = false;
  loader.dataset["state"] = "visible";
}

function hideLoader() {
  const loader = getLoader();
  if (!loader || loader.dataset["state"] === "hidden") return;

  clearTimeout(hideTimeoutId);
  loader.dataset["state"] = "hidden";
  hideTimeoutId = setTimeout(() => {
    loader.hidden = true;
  }, HIDE_DELAY);
}

function finishFirstLoad() {
  clearTimeout(fallbackTimeoutId);
  hideLoader();
}

showLoader();

const root = document.documentElement;
if (root.dataset["loaderBound"] !== "true") {
  root.dataset["loaderBound"] = "true";
  document.addEventListener("astro:before-preparation", showLoader);
  document.addEventListener("astro:after-swap", showLoader);
  document.addEventListener("astro:page-load", hideLoader);
  window.addEventListener("pageshow", finishFirstLoad, { once: true });
  window.addEventListener("load", finishFirstLoad, { once: true });
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  queueMicrotask(finishFirstLoad);
} else {
  fallbackTimeoutId = setTimeout(finishFirstLoad, FIRST_LOAD_TIMEOUT);
}

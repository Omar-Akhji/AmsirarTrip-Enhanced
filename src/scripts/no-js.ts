document.documentElement.classList.remove("no-js");

// Enforce manual scroll restoration so the browser does not restore stale scroll on reload
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Reset scroll to top immediately on initial document execution unless navigating with a hash
if (!globalThis.location.hash) {
  globalThis.scrollTo({ left: 0, top: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

// Ensure scroll position is reset to top before page unloads on reload
globalThis.addEventListener("beforeunload", () => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  if (!globalThis.location.hash) {
    globalThis.scrollTo(0, 0);
  }
});

globalThis.addEventListener("pageshow", () => {
  if (globalThis.location.hash) return;
  globalThis.scrollTo({ left: 0, top: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
});

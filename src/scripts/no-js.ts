document.documentElement.classList.remove("no-js");

// Enforce manual scroll restoration so the browser does not restore stale scroll on reload
if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Reset scroll to top immediately on initial document execution unless navigating with a hash
if (typeof window !== "undefined" && !window.location.hash) {
  window.scrollTo({ left: 0, top: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  if (document.body) {
    document.body.scrollTop = 0;
  }
}

// Ensure scroll position is reset to top before page unloads on reload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  });

  window.addEventListener("pageshow", () => {
    if (!window.location.hash) {
      window.scrollTo({ left: 0, top: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      if (document.body) {
        document.body.scrollTop = 0;
      }
    }
  });
}

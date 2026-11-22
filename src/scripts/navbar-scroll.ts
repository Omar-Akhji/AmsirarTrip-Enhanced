let activeObserver: IntersectionObserver | null = null;

function initNavbarScroll(): void {
  activeObserver?.disconnect();
  activeObserver = null;

  const nav = document.querySelector<HTMLElement>("#main-navbar");
  if (!nav) return;

  const sentinel = document.querySelector<HTMLElement>("[data-nav-sentinel]");
  nav.toggleAttribute("data-scrolled", window.scrollY > 0);

  if (!sentinel || typeof IntersectionObserver === "undefined") return;

  activeObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;
      nav.toggleAttribute("data-scrolled", !entry.isIntersecting);
    },
    { threshold: 0 },
  );
  activeObserver.observe(sentinel);
}

initNavbarScroll();
globalThis.addEventListener(
  "pagehide",
  () => {
    activeObserver?.disconnect();
    activeObserver = null;
  },
  { once: true },
);

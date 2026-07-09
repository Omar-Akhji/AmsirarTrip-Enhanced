let resizeObserver: ResizeObserver | undefined;
let scrollListener: (() => void) | undefined;

function updateScrolled(nav: HTMLElement) {
  if (window.scrollY > 0) {
    nav.dataset["scrolled"] = "";
  } else {
    delete nav.dataset["scrolled"];
  }
}

function init() {
  const nav = document.querySelector<HTMLElement>("#main-navbar");
  if (!nav) return;

  updateScrolled(nav);

  if (scrollListener) {
    window.removeEventListener("scroll", scrollListener);
  }
  scrollListener = () => updateScrolled(nav);
  window.addEventListener("scroll", scrollListener, { passive: true });

  resizeObserver?.disconnect();
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      document.documentElement.style.setProperty("--spacing-navbar", `${h}px`);
    }
  });
  resizeObserver.observe(nav);
}

document.addEventListener("astro:page-load", init);

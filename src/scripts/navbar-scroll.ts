let resizeObserver: ResizeObserver | undefined;
let scrollListener: (() => void) | undefined;

function updateScrolled(nav: HTMLElement) {
  const isScrolled = window.scrollY > 0;
  const bottomNav = document.querySelector<HTMLElement>("#mobile-bottom-nav");

  if (isScrolled) {
    nav.dataset["scrolled"] = "";
    if (bottomNav) bottomNav.dataset["scrolled"] = "";
  } else {
    delete nav.dataset["scrolled"];
    if (bottomNav) delete bottomNav.dataset["scrolled"];
  }

  const brandLinks = nav.querySelectorAll(".brand-logo-link");
  const brandSpans = nav.querySelectorAll(".brand-logo-span");

  if (isScrolled) {
    nav.classList.remove("bg-white/10", "text-white", "shadow-[0_10px_30px_rgba(3,7,18,0.12)]");
    nav.classList.add("bg-white/80", "text-dark", "shadow-[0_12px_30px_oklch(0%_0_0deg/8%)]");

    brandLinks.forEach((brandLink) => {
      brandLink.classList.remove("text-white");
      brandLink.classList.add("text-dark-grey");
    });
    brandSpans.forEach((brandSpan) => {
      brandSpan.classList.remove("text-white");
      brandSpan.classList.add("text-orange");
    });
  } else {
    nav.classList.remove("bg-white/80", "text-dark", "shadow-[0_12px_30px_oklch(0%_0_0deg/8%)]");
    nav.classList.add("bg-white/10", "text-white", "shadow-[0_10px_30px_rgba(3,7,18,0.12)]");

    brandLinks.forEach((brandLink) => {
      brandLink.classList.remove("text-dark-grey");
      brandLink.classList.add("text-white");
    });
    brandSpans.forEach((brandSpan) => {
      brandSpan.classList.remove("text-orange");
      brandSpan.classList.add("text-white");
    });
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
      const h = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
      document.documentElement.style.setProperty("--spacing-navbar", `${h}px`);
    }
  });
  resizeObserver.observe(nav);
}

document.addEventListener("astro:page-load", init);
document.addEventListener("astro:after-swap", () => {
  const nav = document.querySelector<HTMLElement>("#main-navbar");
  if (nav) updateScrolled(nav);
});

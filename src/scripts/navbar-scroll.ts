let resizeObserver: ResizeObserver | undefined;
let scrollListener: (() => void) | undefined;

function updateScrolled(nav: HTMLElement) {
  const isScrolled = window.scrollY > 0;

  if (isScrolled) {
    nav.dataset["scrolled"] = "";
  } else {
    delete nav.dataset["scrolled"];
  }

  const brandLink = nav.querySelector(".brand-logo-link");
  const brandSpan = nav.querySelector(".brand-logo-span");
  const activeLink = nav.querySelector(".nav-link-active");

  if (isScrolled) {
    nav.classList.remove("bg-white/10", "text-white", "shadow-[0_10px_30px_rgba(3,7,18,0.12)]");
    nav.classList.add("bg-white/80", "text-dark", "shadow-[0_12px_30px_oklch(0%_0_0deg/8%)]");

    if (brandLink) {
      brandLink.classList.remove("text-white");
      brandLink.classList.add("text-dark-grey");
    }
    if (brandSpan) {
      brandSpan.classList.remove("text-white");
      brandSpan.classList.add("text-orange");
    }
    if (activeLink) {
      activeLink.classList.remove("bg-white/10", "shadow-[0_0_0_1px_rgb(0_0_0/_5%)]");
      activeLink.classList.add("bg-orange", "shadow-[0_10px_26px_oklch(56%_0.19_33deg/12%)]");
    }
  } else {
    nav.classList.remove("bg-white/80", "text-dark", "shadow-[0_12px_30px_oklch(0%_0_0deg/8%)]");
    nav.classList.add("bg-white/10", "text-white", "shadow-[0_10px_30px_rgba(3,7,18,0.12)]");

    if (brandLink) {
      brandLink.classList.remove("text-dark-grey");
      brandLink.classList.add("text-white");
    }
    if (brandSpan) {
      brandSpan.classList.remove("text-orange");
      brandSpan.classList.add("text-white");
    }
    if (activeLink) {
      activeLink.classList.remove("bg-orange", "shadow-[0_10px_26px_oklch(56%_0.19_33deg/12%)]");
      activeLink.classList.add("bg-white/10", "shadow-[0_0_0_1px_rgb(0_0_0/_5%)]");
    }
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

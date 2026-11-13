let scrollListener: (() => void) | undefined;

function updateScrolled(nav: HTMLElement) {
  nav.toggleAttribute("data-scrolled", window.scrollY > 0);
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
}

document.addEventListener("astro:page-load", init);
document.addEventListener("astro:after-swap", () => {
  const nav = document.querySelector<HTMLElement>("#main-navbar");
  if (nav) updateScrolled(nav);
});

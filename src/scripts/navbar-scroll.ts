function update() {
  const nav = document.querySelector<HTMLElement>("#main-navbar");
  if (!nav) return;
  if (window.scrollY > 0) {
    nav.dataset["scrolled"] = "";
  } else {
    delete nav.dataset["scrolled"];
  }
  try {
    const h = nav.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--spacing-navbar", `${h}px`);
  } catch {}
}

update();
window.addEventListener("scroll", update, { passive: true });
window.addEventListener("resize", update, { passive: true });
document.addEventListener("astro:page-load", update);

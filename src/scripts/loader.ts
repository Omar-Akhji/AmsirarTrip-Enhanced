const el = document.querySelector<HTMLElement>("#initial-loader");
if (el) {
  document.addEventListener("astro:before-preparation", () => {
    el.style.display = "flex";
  });
  document.addEventListener("astro:page-load", () => {
    el.style.display = "none";
  });
  el.style.display = "none";
}

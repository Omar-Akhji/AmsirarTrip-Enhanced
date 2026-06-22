const element = document.querySelector<HTMLElement>("#initial-loader");
if (element) {
  document.addEventListener("astro:before-preparation", () => {
    element.style.display = "flex";
  });
  document.addEventListener("astro:page-load", () => {
    element.style.display = "none";
  });
  element.style.display = "none";
}

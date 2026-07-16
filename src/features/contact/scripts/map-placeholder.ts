function initMapPlaceholder() {
  const placeholder = document.querySelector("#map-placeholder");
  const container = document.querySelector("#map-container");
  const iframe = container?.querySelector("iframe");

  if (placeholder && container && iframe) {
    placeholder.addEventListener("click", () => {
      const src = iframe.dataset["src"];
      if (src) {
        iframe.setAttribute("src", src);
      }
      container.classList.remove("hidden");
      placeholder.classList.add("hidden");
    });
  }
}

document.addEventListener("astro:page-load", initMapPlaceholder);

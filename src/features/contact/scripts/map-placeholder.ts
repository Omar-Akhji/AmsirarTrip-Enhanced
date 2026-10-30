function initMapPlaceholder() {
  const placeholder = document.querySelector("#map-placeholder");
  const container = document.querySelector("#map-container");
  const iframe = container?.querySelector("iframe");

  if (placeholder && container && iframe) {
    placeholder.addEventListener(
      "click",
      () => {
        const src = iframe.dataset["src"];
        if (src) {
          try {
            const parsed = new URL(src);
            if (
              parsed.protocol === "https:"
              && (parsed.hostname === "www.google.com" || parsed.hostname === "maps.google.com")
              && parsed.pathname.startsWith("/maps/")
            ) {
              iframe.setAttribute("src", parsed.href);
            }
          } catch {
            // Ignore malformed map URL
          }
        }
        container.classList.remove("hidden");
        placeholder.classList.add("hidden");
      },
      { once: true },
    );
  }
}

document.addEventListener("astro:page-load", initMapPlaceholder);

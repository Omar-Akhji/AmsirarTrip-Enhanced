const element = document.querySelector<HTMLElement>("#initial-loader");

function fadeOutLoader(el: HTMLElement) {
  el.style.transition = "opacity 0.4s ease-out, visibility 0.4s ease-out";
  el.style.opacity = "0";
  el.style.pointerEvents = "none";
  setTimeout(() => {
    el.style.display = "none";
  }, 400);
}

if (element) {
  // Client-side navigations: show loader during transition prep
  document.addEventListener("astro:before-preparation", () => {
    element.style.display = "flex";
    element.style.opacity = "1";
    element.style.pointerEvents = "auto";
  });

  // Client-side navigations: fade out loader after page load
  document.addEventListener("astro:page-load", () => {
    fadeOutLoader(element);
  });

  // First visit / Hard reload: wait for window load event (images, CSS, fonts fully loaded)
  if (document.readyState === "complete") {
    fadeOutLoader(element);
  } else {
    window.addEventListener("load", () => {
      fadeOutLoader(element);
    });
  }
}

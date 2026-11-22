import { isTrustedGoogleMapsEmbedUrl } from "@/lib/maps";

function setupContactMapFacade(): void {
  const details = document.querySelector<HTMLDetailsElement>(
    "#location details:not([data-facade-ready])",
  );
  if (!details) return;
  details.dataset["facadeReady"] = "true";
  const container = details.querySelector<HTMLElement>("[data-map-container]");
  if (!container) return;

  details.addEventListener(
    "toggle",
    () => {
      if (!details.open) return;
      const src = container.dataset["mapSrc"];
      if (!src || !isTrustedGoogleMapsEmbedUrl(src)) return;

      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = container.dataset["mapTitle"] ?? "Agency Location Map";
      const ariaLabel = container.dataset["mapAria"];
      if (ariaLabel) {
        iframe.setAttribute("aria-label", ariaLabel);
      }
      iframe.className = "border-0 block-75 md:block-100 lg:block-125 inline-full";
      iframe.setAttribute("allowfullscreen", "");
      iframe.loading = "lazy";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
      );

      container.replaceChildren(iframe);
    },
    { once: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupContactMapFacade, { once: true });
} else {
  setupContactMapFacade();
}

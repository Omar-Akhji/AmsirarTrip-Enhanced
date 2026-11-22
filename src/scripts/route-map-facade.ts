import { isTrustedGoogleMapsEmbedUrl } from "@/lib/maps";

function initRouteMapFacades(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    ".load-route-map-btn:not([data-facade-ready])",
  );
  for (const btn of buttons) {
    btn.dataset["facadeReady"] = "true";
    btn.addEventListener(
      "click",
      () => {
        const url = btn.dataset["embedUrl"];
        const title = btn.dataset["mapTitle"] ?? "Route Map";
        const wrapper = btn.closest(".route-map-wrapper");
        if (!wrapper || !url || !isTrustedGoogleMapsEmbedUrl(url)) return;

        const container = wrapper.querySelector(".map-iframe-container");
        const facade = wrapper.querySelector(".map-facade");
        if (!container) return;

        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.title = title;
        iframe.className = "size-full border-0 focus:outline-2 focus:outline-orange-500";
        iframe.tabIndex = -1;
        iframe.setAttribute("allowfullscreen", "");
        iframe.loading = "lazy";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.setAttribute(
          "sandbox",
          "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
        );

        container.append(iframe);
        facade?.remove();
        iframe.focus({ preventScroll: true });
      },
      { once: true },
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRouteMapFacades, { once: true });
} else {
  initRouteMapFacades();
}

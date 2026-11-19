function isTrustedGoogleMapsEmbedUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === "https:"
      && parsed.hostname === "www.google.com"
      && (parsed.pathname === "/maps" || parsed.pathname.startsWith("/maps/embed"))
    );
  } catch {
    return false;
  }
}

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
        iframe.className = "size-full border-0";
        iframe.allowFullscreen = true;
        iframe.loading = "lazy";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.setAttribute(
          "sandbox",
          "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
        );

        container.append(iframe);
        facade?.remove();
      },
      { once: true },
    );
  }
}

initRouteMapFacades();
document.addEventListener("astro:page-load", initRouteMapFacades);

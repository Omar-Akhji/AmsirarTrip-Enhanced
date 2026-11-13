function setupContactMapFacade(): void {
  const details = document.querySelector<HTMLDetailsElement>(
    "#location details:not([data-facade-ready])",
  );
  if (!details) return;
  details.dataset["facadeReady"] = "true";
  const iframe = details.querySelector<HTMLIFrameElement>("iframe");
  if (!iframe) return;

  details.addEventListener(
    "toggle",
    () => {
      const src = iframe.dataset["src"];
      if (src && !iframe.src && details.open) {
        iframe.src = src;
      }
    },
    { once: true },
  );
}

setupContactMapFacade();
document.addEventListener("astro:page-load", setupContactMapFacade);

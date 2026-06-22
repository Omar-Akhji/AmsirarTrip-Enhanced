function injectJsonLd() {
  for (const element of document.querySelectorAll<HTMLElement>("[data-jsonld]")) {
    const raw = element.dataset["jsonld"];
    const id = element.dataset["jsonldId"];
    if (!raw || !id) continue;
    if (document.querySelector(`#${CSS.escape(id)}`)) continue;
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = raw;
    document.head.append(s);
    element.remove();
  }
}

document.addEventListener("astro:page-load", injectJsonLd);
injectJsonLd();

function injectJsonLd() {
  for (const el of document.querySelectorAll<HTMLElement>("[data-jsonld]")) {
    const raw = el.dataset["jsonld"];
    const id = el.dataset["jsonldId"];
    if (!raw || !id) continue;
    if (document.querySelector(`#${CSS.escape(id)}`)) continue;
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = raw;
    document.head.append(s);
    el.remove();
  }
}

document.addEventListener("astro:page-load", injectJsonLd);
injectJsonLd();

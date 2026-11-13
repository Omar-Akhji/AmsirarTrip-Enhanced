export function setupLegalTOC(): void {
  const tocLinks = document.querySelectorAll<HTMLAnchorElement>(
    "#privacy-toc-list a, #terms-toc-list a",
  );
  const sections = document.querySelectorAll<HTMLElement>("article section[id]");

  if (sections.length > 0 && tocLinks.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const currentId = entry.target.getAttribute("id");
          for (const link of tocLinks) {
            if (link.dataset["sectionId"] === currentId) {
              link.dataset["active"] = "true";
            } else {
              delete link.dataset["active"];
            }
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    for (const section of sections) {
      observer.observe(section);
    }
  }

  const printBtns = document.querySelectorAll<HTMLButtonElement>(
    "#privacy-print-btn, #terms-print-btn",
  );
  for (const printBtn of printBtns) {
    if (printBtn.dataset["bound"]) continue;
    printBtn.dataset["bound"] = "true";
    printBtn.addEventListener("click", () => {
      globalThis.print();
    });
  }
}

setupLegalTOC();
document.addEventListener("astro:page-load", setupLegalTOC);

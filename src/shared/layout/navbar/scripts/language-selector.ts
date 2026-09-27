function initLanguageSelectors() {
  const containers = document.querySelectorAll<HTMLElement>(".language-selector-root");
  if (containers.length === 0) return;

  function closeAll(except?: HTMLElement) {
    containers.forEach((container) => {
      if (container === except) return;
      const btn = container.querySelector<HTMLButtonElement>("[data-lang-trigger]");
      const menu = container.querySelector<HTMLElement>("[data-lang-menu]");
      if (btn && menu) {
        btn.setAttribute("aria-expanded", "false");
        menu.dataset["state"] = "closed";
      }
    });
  }

  function handleContainer(container: HTMLElement) {
    const btn = container.querySelector<HTMLButtonElement>("[data-lang-trigger]");
    const menu = container.querySelector<HTMLElement>("[data-lang-menu]");
    if (!btn || !menu) return;

    function toggle(e: MouseEvent) {
      e.stopPropagation();
      const isOpen = menu?.dataset["state"] === "open";
      if (isOpen) {
        btn?.setAttribute("aria-expanded", "false");
        if (menu) menu.dataset["state"] = "closed";
      } else {
        closeAll(container);
        btn?.setAttribute("aria-expanded", "true");
        if (menu) menu.dataset["state"] = "open";
      }
    }

    btn.addEventListener("click", toggle);

    function handleKeydown(e: KeyboardEvent) {
      const isOpen = menu?.dataset["state"] === "open";
      if (!isOpen) return;

      const items = [
        ...(menu?.querySelectorAll<HTMLAnchorElement>('[role="menuitemradio"]') ?? []),
      ];
      if (items.length === 0) return;

      if (e.key === "Escape") {
        e.preventDefault();
        btn?.setAttribute("aria-expanded", "false");
        if (menu) menu.dataset["state"] = "closed";
        btn?.focus();
        return;
      }

      const currentIndex = items.indexOf(document.activeElement as HTMLAnchorElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (currentIndex > 0 ? currentIndex : items.length) - 1;
        items[prevIndex]?.focus();
      }
    }

    container.addEventListener("keydown", handleKeydown);
  }

  containers.forEach(handleContainer);

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as Node | null;
    if (!target) return;
    let clickedInside = false;
    containers.forEach((c) => {
      if (c.contains(target)) clickedInside = true;
    });
    if (!clickedInside) {
      closeAll();
    }
  }

  document.addEventListener("click", handleClickOutside);

  function cleanup() {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("astro:before-swap", cleanup);
  }

  document.addEventListener("astro:before-swap", cleanup, { once: true });
}

document.addEventListener("astro:page-load", initLanguageSelectors);

function initMobileMenu() {
  const button = document.querySelector<HTMLButtonElement>("#navbar-show-btn");
  const collapse = document.querySelector<HTMLElement>("#navbar-collapse");
  const nav = document.querySelector<HTMLElement>("#main-navbar");

  if (!button || !collapse || !nav) return;

  // Capture narrowed references so TypeScript knows they're non-null in closures
  const btn: HTMLButtonElement = button;
  const panel: HTMLElement = collapse;
  const navbar: HTMLElement = nav;

  let isOpen = false;

  function setMenuState(open: boolean) {
    isOpen = open;
    btn.setAttribute("aria-expanded", String(open));
    panel.dataset["state"] = open ? "open" : "closed";
    navbar.dataset["state"] = open ? "open" : "closed";

    const xIcon = btn.querySelector(".menu-icon-x");
    const menuIcon = btn.querySelector(".menu-icon-hamburger");
    if (xIcon && menuIcon) {
      if (open) {
        xIcon.classList.remove("hidden");
        menuIcon.classList.add("hidden");
      } else {
        xIcon.classList.add("hidden");
        menuIcon.classList.remove("hidden");
      }
    }
  }

  function toggle() {
    setMenuState(!isOpen);
  }

  function clickOutside(e: MouseEvent) {
    if (!isOpen) return;
    const target = e.target as Node;
    if (!panel.contains(target) && !btn.contains(target)) {
      setMenuState(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!isOpen) return;

    if (e.key === "Escape") {
      setMenuState(false);
      btn.focus();
      return;
    }

    if (e.key === "Tab") {
      const focusableSelector =
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const focusableElements = panel.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (firstFocusable && lastFocusable) {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    }
  }

  // Close menu when a link inside the collapse is clicked
  const links = panel.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  btn.addEventListener("click", toggle);
  document.addEventListener("click", clickOutside);
  document.addEventListener("keydown", handleKeyDown);

  // Cleanup on View Transition to avoid duplicating listeners
  function cleanup() {
    btn.removeEventListener("click", toggle);
    document.removeEventListener("click", clickOutside);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("astro:before-swap", cleanup);
  }
  document.addEventListener("astro:before-swap", cleanup, { once: true });
}

document.addEventListener("astro:page-load", initMobileMenu);

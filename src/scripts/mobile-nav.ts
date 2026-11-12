let currentActiveLink: HTMLAnchorElement | null = null;
let currentHoveredLink: HTMLAnchorElement | null = null;
let leaveTimer: ReturnType<typeof setTimeout> | null = null;

const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

function findMatchingLink(nav: HTMLElement, currentPath: string): HTMLAnchorElement | null {
  const cleanPath = currentPath === "/" ? "/" : currentPath.replace(/\/$/, "");
  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a.mobile-dock-link")];

  // Pass 1: Exact match (highest priority, avoids false prefix matching)
  for (const link of links) {
    const href = link.getAttribute("href") ?? "";
    const cleanHref = href === "/" ? "/" : href.replace(/\/$/, "");
    if (cleanPath === cleanHref) {
      return link;
    }
  }

  // Pass 2: Nested routes (e.g. /tours/desert matches /tours)
  for (const link of links) {
    const href = link.getAttribute("href") ?? "";
    const cleanHref = href === "/" ? "/" : href.replace(/\/$/, "");
    const isRootOrLocaleHome = cleanHref === "/" || /^\/[a-z]{2}$/.test(cleanHref);
    if (!isRootOrLocaleHome && cleanPath.startsWith(`${cleanHref}/`)) {
      return link;
    }
  }

  return links[0] ?? null;
}

function getLinkGeometry(
  nav: HTMLElement,
  links: HTMLAnchorElement[],
  targetIndex: number,
): { x: number; width: number } {
  const targetLink = links[targetIndex];
  if (!targetLink) return { x: 0, width: 0 };

  const comp = globalThis.getComputedStyle(nav);
  const paddingLeft = Number(comp.paddingLeft.replace("px", "")) || 4;
  const rawGap = comp.columnGap || comp.gap;
  const gap = Number(rawGap.replace("px", "")) || 2;

  // Measure actual collapsed width dynamically from an inactive sibling link
  const sampleCollapsed =
    links.find((l) => l !== targetLink && !l.dataset["indicator"])
    ?? links.find((l) => l !== targetLink);
  const collapsedWidth =
    sampleCollapsed && sampleCollapsed.offsetWidth > 0 ? sampleCollapsed.offsetWidth : 44;

  const label = targetLink.querySelector<HTMLElement>(".mobile-dock-label");
  const labelWidth = label ? label.scrollWidth : 0;
  const targetWidth = collapsedWidth + (labelWidth > 0 ? labelWidth + 8 : 0);

  const targetX = paddingLeft + targetIndex * (collapsedWidth + gap);

  return { x: targetX, width: targetWidth };
}

function setHovered(targetLink: HTMLAnchorElement | null, immediate = false): void {
  const nav = document.querySelector<HTMLElement>("#mobile-bottom-nav");
  const indicator = document.querySelector<HTMLElement>("#mobile-nav-indicator");
  if (!nav || !indicator) return;

  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a.mobile-dock-link")];
  const target = targetLink ?? currentActiveLink;
  if (!target) return;

  const targetIndex = links.indexOf(target);
  if (targetIndex === -1) return;

  const prefersReducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Synchronously animate all labels: target label expands, other labels shrink to 0
  for (const link of links) {
    const label = link.querySelector<HTMLElement>(".mobile-dock-label");
    if (!label) continue;

    if (link === target) {
      link.dataset["indicator"] = "true";
      label.style.transition =
        immediate || prefersReducedMotion ? "none" : (
          `width 260ms ${EASE_OUT}, opacity 200ms ease-out, margin-left 260ms ${EASE_OUT}`
        );
      label.style.width = `${label.scrollWidth}px`;
      label.style.opacity = "1";
      label.style.marginLeft = "8px";
    } else {
      delete link.dataset["indicator"];
      label.style.transition =
        immediate || prefersReducedMotion ? "none" : (
          `width 240ms ${EASE_OUT}, opacity 160ms ease-out, margin-left 240ms ${EASE_OUT}`
        );
      label.style.width = "0px";
      label.style.opacity = "0";
      label.style.marginLeft = "0px";
    }
  }

  let targetX: number;
  let targetWidth: number;

  if (immediate && target.offsetWidth > 0) {
    targetX = target.offsetLeft;
    targetWidth = target.offsetWidth;
  } else {
    const geometry = getLinkGeometry(nav, links, targetIndex);
    targetX = geometry.x;
    targetWidth = geometry.width;
  }

  // Animate the orange indicator in exact sync with the label
  indicator.style.transition =
    immediate || prefersReducedMotion ? "none" : (
      `transform 260ms ${EASE_OUT}, width 260ms ${EASE_OUT}, opacity 260ms ${EASE_OUT}`
    );
  indicator.style.transform = `translate3d(${targetX}px, 0, 0)`;
  indicator.style.width = `${targetWidth}px`;
  indicator.style.opacity = "1";
  indicator.style.visibility = "visible";

  // Re-sync with exact layout positions once the CSS transition completes
  if (!immediate && !prefersReducedMotion) {
    globalThis.setTimeout(() => {
      if (!(
        (currentActiveLink === target || currentHoveredLink === target)
        && target.offsetWidth > 0
      )) {
        return;
      }

      indicator.style.transition = "none";
      indicator.style.transform = `translate3d(${target.offsetLeft}px, 0, 0)`;
      indicator.style.width = `${target.offsetWidth}px`;
    }, 270);
  }
}

function setupMobileNav(): void {
  const nav = document.querySelector<HTMLElement>("#mobile-bottom-nav");
  if (!nav) return;
  const indicator = document.querySelector<HTMLElement>("#mobile-nav-indicator");

  currentActiveLink = findMatchingLink(nav, globalThis.location.pathname);

  if (currentActiveLink) {
    const links = [...nav.querySelectorAll<HTMLAnchorElement>("a.mobile-dock-link")];
    for (const link of links) {
      if (link === currentActiveLink) {
        link.setAttribute("aria-current", "page");
        link.dataset["active"] = "true";
      } else {
        link.removeAttribute("aria-current");
        delete link.dataset["active"];
      }
    }
    const alreadySettled =
      indicator !== null
      && indicator.style.visibility === "visible"
      && indicator.style.opacity === "1";
    setHovered(currentActiveLink, !alreadySettled);
  }

  if (nav.dataset["eventsBound"] === "true") return;
  nav.dataset["eventsBound"] = "true";

  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a.mobile-dock-link")];

  // Track hover via pointerover with target resolution: avoids jitter when elements expand
  nav.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    if (leaveTimer !== null) {
      clearTimeout(leaveTimer);
      leaveTimer = null;
    }
    const targetLink = (e.target as HTMLElement).closest<HTMLAnchorElement>("a.mobile-dock-link");
    if (!targetLink || targetLink === currentHoveredLink) return;
    currentHoveredLink = targetLink;
    setHovered(targetLink, false);
  });

  // Debounced pointerleave: prevents micro-flicker if mouse briefly exits during layout animation
  nav.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "touch") return;
    if (leaveTimer !== null) clearTimeout(leaveTimer);
    leaveTimer = globalThis.setTimeout(() => {
      currentHoveredLink = null;
      if (currentActiveLink) {
        setHovered(currentActiveLink, false);
      }
    }, 120);
  });

  for (const link of links) {
    link.addEventListener("click", () => {
      currentActiveLink = link;
      currentHoveredLink = link;
      for (const other of links) {
        if (other === link) {
          other.setAttribute("aria-current", "page");
          other.dataset["active"] = "true";
        } else {
          other.removeAttribute("aria-current");
          delete other.dataset["active"];
        }
      }
      setHovered(link, false);
    });
  }
}

if (typeof window !== "undefined") {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setupMobileNav();
  } else {
    document.addEventListener("DOMContentLoaded", setupMobileNav);
  }

  document.addEventListener("astro:page-load", () => {
    setupMobileNav();
  });

  if ("fonts" in document) {
    void (async () => {
      try {
        await document.fonts.ready;
        setupMobileNav();
      } catch {
        // Ignored
      }
    })();
  }

  const mobileMedia = globalThis.matchMedia("(max-width: 1023px)");
  mobileMedia.addEventListener("change", () => {
    setupMobileNav();
  });

  let resizeTimer: number | null = null;
  const handleResize = () => {
    if (resizeTimer !== null) cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(() => {
      setupMobileNav();
    });
  };

  window.addEventListener("resize", handleResize, { passive: true });
}

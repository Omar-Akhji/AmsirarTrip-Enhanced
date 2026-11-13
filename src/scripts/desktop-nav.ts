let currentActiveLink: HTMLAnchorElement | null = null;
let currentHoveredLink: HTMLAnchorElement | null = null;
let leaveTimer: ReturnType<typeof setTimeout> | null = null;
let lastIndicatorX = 0;
let lastIndicatorWidth = 0;
let lastIndicatorVisible = false;

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

function isTabletMode(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}

/** Reads the active link rendered server-side by Navbar.astro. */
function getActiveLink(nav: HTMLElement): HTMLAnchorElement | null {
  return nav.querySelector<HTMLAnchorElement>('a.desktop-nav-link[aria-current="page"]');
}

/**
 * Measures the label's natural content width. Cached per element so a transient 0 reading during a
 * transition can never shrink the sliding indicator.
 */
const labelWidths = new WeakMap<HTMLElement, number>();

function getLabelWidth(label: HTMLElement): number {
  const width = Math.max(labelWidths.get(label) ?? 0, label.scrollWidth);
  if (width > 0) {
    labelWidths.set(label, width);
  }
  return width;
}

function getTabletLinkGeometry(
  nav: HTMLElement,
  links: HTMLAnchorElement[],
  targetIndex: number,
): { x: number; width: number } {
  const targetLink = links[targetIndex];
  if (!targetLink) return { x: 0, width: 0 };

  const comp = globalThis.getComputedStyle(nav);
  const paddingLeft = Number(comp.paddingLeft.replace("px", "")) || 6;
  const rawGap = comp.columnGap || comp.gap;
  const gap = Number(rawGap.replace("px", "")) || 4;

  const sampleCollapsed =
    links.find((l) => l !== targetLink && !l.dataset["expanded"])
    ?? links.find((l) => l !== targetLink);
  const collapsedWidth =
    sampleCollapsed && sampleCollapsed.offsetWidth > 0 ? sampleCollapsed.offsetWidth : 44;

  const label = targetLink.querySelector<HTMLElement>(".desktop-nav-label");
  const labelWidth = label ? getLabelWidth(label) : 0;
  const targetWidth = collapsedWidth + (labelWidth > 0 ? labelWidth + 8 : 0);
  const targetX = paddingLeft + targetIndex * (collapsedWidth + gap);

  return { x: targetX, width: targetWidth };
}

function setIndicator(targetLink: HTMLAnchorElement | null, immediate = false): void {
  const nav = document.querySelector<HTMLElement>("#desktop-nav");
  const indicator = document.querySelector<HTMLElement>("#desktop-nav-indicator");
  if (!nav || !indicator) return;

  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a.desktop-nav-link")];
  const target = targetLink ?? currentActiveLink;

  // Update data-indicator attribute so only the link under the indicator has solid white text
  for (const link of links) {
    if (target && link === target) {
      link.dataset["indicator"] = "true";
    } else {
      delete link.dataset["indicator"];
    }
  }

  if (!target || target.offsetWidth === 0) {
    indicator.style.transition = `opacity 200ms ${EASE_OUT}, visibility 200ms ${EASE_OUT}`;
    indicator.style.opacity = "0";
    indicator.style.visibility = "hidden";
    lastIndicatorVisible = false;
    return;
  }

  const inTablet = isTabletMode();
  const prefersReducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let targetX = target.offsetLeft;
  let targetWidth = target.offsetWidth;

  if (inTablet) {
    const targetIndex = links.indexOf(target);
    if (targetIndex === -1) return;

    if (immediate && target.offsetWidth > 0) {
      targetX = target.offsetLeft;
      targetWidth = target.offsetWidth;
    } else {
      const geometry = getTabletLinkGeometry(nav, links, targetIndex);
      targetX = geometry.x;
      targetWidth = geometry.width;
    }

    // Synchronously animate all labels: target label expands, others shrink to 0 (identical to mobile bottom nav dock)
    for (const link of links) {
      const label = link.querySelector<HTMLElement>(".desktop-nav-label");
      if (!label) continue;

      if (link === target) {
        label.dataset["expanded"] = "true";
        label.style.transition =
          immediate || prefersReducedMotion ? "none" : (
            `width 220ms ${EASE_OUT}, opacity 220ms ${EASE_OUT}, margin-left 220ms ${EASE_OUT}`
          );
        // `width: auto` interpolates from 0 thanks to `interpolate-size: allow-keywords`
        label.style.width = "auto";
        label.style.opacity = "1";
        label.style.marginLeft = "8px";
      } else {
        delete label.dataset["expanded"];
        label.style.transition =
          immediate || prefersReducedMotion ? "none" : (
            `width 200ms ${EASE_OUT}, opacity 200ms ${EASE_OUT}, margin-left 200ms ${EASE_OUT}`
          );
        label.style.width = "0px";
        label.style.opacity = "0";
        label.style.marginLeft = "0px";
      }
    }

    // Animate the orange indicator in exact sync with the label
    indicator.style.transition =
      immediate || prefersReducedMotion ? "none" : (
        `transform 220ms ${EASE_OUT}, width 220ms ${EASE_OUT}, opacity 220ms ${EASE_OUT}`
      );

    // Re-sync with exact layout positions once the transition completes
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
      }, 230);
    }
  } else {
    // Desktop mode (>= 1024px)
    for (const link of links) {
      const label = link.querySelector<HTMLElement>(".desktop-nav-label");
      if (!label) continue;
      label.style.removeProperty("transition");
      label.style.removeProperty("width");
      label.style.removeProperty("opacity");
      label.style.removeProperty("margin-left");
    }

    const isAlreadyAtTarget =
      lastIndicatorVisible
      && Math.abs(lastIndicatorX - targetX) < 1
      && Math.abs(lastIndicatorWidth - targetWidth) < 1;

    indicator.style.transition =
      immediate || !lastIndicatorVisible || isAlreadyAtTarget || prefersReducedMotion ?
        "none"
      : `transform 180ms ${EASE_OUT}, width 180ms ${EASE_OUT}, opacity 180ms ${EASE_OUT}`;
  }

  indicator.style.transform = `translate3d(${targetX}px, 0, 0)`;
  indicator.style.width = `${targetWidth}px`;
  indicator.style.opacity = "1";
  indicator.style.visibility = "visible";
  lastIndicatorX = targetX;
  lastIndicatorWidth = targetWidth;
  lastIndicatorVisible = true;
}

function setupDesktopNav(): void {
  const nav = document.querySelector<HTMLElement>("#desktop-nav");
  if (!nav?.offsetParent) return;

  currentActiveLink = getActiveLink(nav);

  setIndicator(currentActiveLink, true);

  if (nav.dataset["eventsBound"] === "true") return;
  nav.dataset["eventsBound"] = "true";

  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a.desktop-nav-link")];

  // Track hover via pointerover with target resolution: prevents jitter when labels expand (matches mobile dock pattern)
  nav.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    if (leaveTimer !== null) {
      clearTimeout(leaveTimer);
      leaveTimer = null;
    }
    const targetLink = (e.target as HTMLElement).closest<HTMLAnchorElement>("a.desktop-nav-link");
    if (!targetLink || targetLink === currentHoveredLink) return;
    currentHoveredLink = targetLink;
    setIndicator(targetLink, false);
  });

  // Debounced pointerleave: prevents micro-flicker if mouse briefly exits during layout animation
  nav.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "touch") return;
    if (leaveTimer !== null) clearTimeout(leaveTimer);
    leaveTimer = globalThis.setTimeout(() => {
      currentHoveredLink = null;
      setIndicator(currentActiveLink, false);
    }, 120);
  });

  for (const link of links) {
    link.addEventListener("click", () => {
      currentActiveLink = link;
      currentHoveredLink = link;
      for (const other of links) {
        other.toggleAttribute("aria-current", other === link);
      }
      setIndicator(link, false);
    });
  }
}

if (typeof window !== "undefined") {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setupDesktopNav();
  } else {
    document.addEventListener("DOMContentLoaded", setupDesktopNav);
  }

  document.addEventListener("astro:page-load", () => {
    setupDesktopNav();
  });

  if ("fonts" in document) {
    void (async () => {
      try {
        await document.fonts.ready;
        setupDesktopNav();
      } catch {
        // Ignored
      }
    })();
  }

  const tabletMedia = globalThis.matchMedia("(max-width: 1023px)");
  tabletMedia.addEventListener("change", () => {
    setupDesktopNav();
  });

  let resizeTimer: number | null = null;
  const handleResize = () => {
    if (resizeTimer !== null) cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(() => {
      setupDesktopNav();
    });
  };

  window.addEventListener("resize", handleResize, { passive: true });
}

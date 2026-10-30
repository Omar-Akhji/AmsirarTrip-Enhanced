import gsap from "gsap";

let currentActiveLink: HTMLAnchorElement | null = null;
let currentHoveredLink: HTMLAnchorElement | null = null;
let leaveTimer: ReturnType<typeof setTimeout> | null = null;

function isTabletMode(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}

function findMatchingLink(nav: HTMLElement, currentPath: string): HTMLAnchorElement | null {
  const cleanPath = currentPath === "/" ? "/" : currentPath.replace(/\/$/, "");
  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a.desktop-nav-link")];

  // Pass 1: Exact match (highest priority, avoids false prefix matching)
  for (const link of links) {
    const href = link.getAttribute("href") ?? "";
    const cleanHref = href === "/" ? "/" : href.replace(/\/$/, "");
    if (cleanPath === cleanHref) {
      return link;
    }
  }

  // Pass 2: Nested routes (e.g. /tours/desert-safari matches /tours)
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

function getLabelWidth(label: HTMLElement): number {
  const current = (label as HTMLElement & { _naturalWidth?: number })._naturalWidth ?? 0;
  const measured = label.scrollWidth;
  const width = Math.max(current, measured);
  if (width > 0) {
    (label as HTMLElement & { _naturalWidth?: number })._naturalWidth = width;
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
  const collapsedWidth = 44;

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
    gsap.killTweensOf(indicator);
    gsap.to(indicator, { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
    return;
  }

  const inTablet = isTabletMode();
  const prefersReducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (inTablet) {
    const targetIndex = links.indexOf(target);
    if (targetIndex === -1) return;

    const { x: targetX, width: targetWidth } = getTabletLinkGeometry(nav, links, targetIndex);

    // Synchronously animate all labels: target label expands, others shrink to 0 (identical to mobile bottom nav dock)
    for (const link of links) {
      const label = link.querySelector<HTMLElement>(".desktop-nav-label");
      if (!label) continue;

      if (link === target) {
        label.dataset["expanded"] = "true";
        gsap.killTweensOf(label);
        const targetLabelWidth = getLabelWidth(label);
        if (immediate || prefersReducedMotion) {
          gsap.set(label, { width: targetLabelWidth, opacity: 1, marginLeft: 8 });
        } else {
          gsap.to(label, {
            width: targetLabelWidth,
            opacity: 1,
            marginLeft: 8,
            duration: 0.22,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      } else {
        delete label.dataset["expanded"];
        gsap.killTweensOf(label);
        if (immediate || prefersReducedMotion) {
          gsap.set(label, { width: 0, opacity: 0, marginLeft: 0 });
        } else {
          gsap.to(label, {
            width: 0,
            opacity: 0,
            marginLeft: 0,
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      }
    }

    // Animate the orange indicator in exact sync with the label
    gsap.killTweensOf(indicator);
    if (immediate || prefersReducedMotion) {
      gsap.set(indicator, { x: targetX, width: targetWidth, autoAlpha: 1 });
    } else {
      gsap.to(indicator, {
        x: targetX,
        width: targetWidth,
        autoAlpha: 1,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  } else {
    // Desktop mode (>= 1024px)
    for (const link of links) {
      const label = link.querySelector<HTMLElement>(".desktop-nav-label");
      if (!label) continue;
      gsap.killTweensOf(label);
      gsap.set(label, { clearProps: "width,opacity,marginLeft" });
    }

    const targetX = target.offsetLeft;
    const targetWidth = target.offsetWidth;

    gsap.killTweensOf(indicator);

    const currentAlpha = Number(gsap.getProperty(indicator, "autoAlpha"));
    const currentX = Number(gsap.getProperty(indicator, "x"));
    const currentWidth = Number(gsap.getProperty(indicator, "width"));

    const isAlreadyAtTarget =
      currentAlpha > 0.5
      && Math.abs(currentX - targetX) < 1
      && Math.abs(currentWidth - targetWidth) < 1;

    if (immediate || currentAlpha === 0 || isAlreadyAtTarget || prefersReducedMotion) {
      gsap.set(indicator, { x: targetX, width: targetWidth, autoAlpha: 1 });
    } else {
      gsap.to(indicator, {
        x: targetX,
        width: targetWidth,
        autoAlpha: 1,
        duration: 0.18,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }
}

function syncActiveLink(nav: HTMLElement): HTMLAnchorElement | null {
  const currentPath = globalThis.location.pathname;
  const activeLink = findMatchingLink(nav, currentPath);
  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a.desktop-nav-link")];

  for (const link of links) {
    if (activeLink && link === activeLink) {
      link.setAttribute("aria-current", "page");
      link.dataset["active"] = "true";
    } else {
      link.removeAttribute("aria-current");
      delete link.dataset["active"];
    }
  }

  return activeLink;
}

function setupDesktopNav(): void {
  const nav = document.querySelector<HTMLElement>("#desktop-nav");
  if (!nav?.offsetParent) return;

  currentActiveLink = syncActiveLink(nav);

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
      if (currentActiveLink) {
        setIndicator(currentActiveLink, false);
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

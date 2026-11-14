const SUPPORTS_NATIVE_ANCHOR =
  typeof CSS !== "undefined"
  && CSS.supports("left", "anchor(left)")
  && CSS.supports("selector(:has(*))");

let currentActiveLink: HTMLAnchorElement | null = null;
let currentHoveredLink: HTMLAnchorElement | null = null;
let leaveTimer: ReturnType<typeof setTimeout> | null = null;
let lastIndicatorX = 0;
let lastIndicatorWidth = 0;
let lastIndicatorVisible = false;

function getActiveLink(nav: HTMLElement): HTMLAnchorElement | null {
  return nav.querySelector<HTMLAnchorElement>('a.desktop-nav-link[aria-current="page"]');
}

function setIndicator(targetLink: HTMLAnchorElement | null, immediate = false): void {
  const nav = document.querySelector<HTMLElement>("#desktop-nav");
  const indicator = document.querySelector<HTMLElement>("#desktop-nav-indicator");
  if (!nav || !indicator || window.innerWidth < 1024) return;

  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a.desktop-nav-link")];
  const target = targetLink ?? currentActiveLink;

  for (const link of links) {
    if (target && link === target) {
      link.dataset["indicator"] = "true";
    } else {
      delete link.dataset["indicator"];
    }
  }

  if (!target || target.offsetWidth === 0) {
    delete indicator.dataset["visible"];
    delete indicator.dataset["immediate"];
    lastIndicatorVisible = false;
    return;
  }

  const prefersReducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targetX = target.offsetLeft;
  const targetWidth = target.offsetWidth;

  const isAlreadyAtTarget =
    lastIndicatorVisible
    && Math.abs(lastIndicatorX - targetX) < 1
    && Math.abs(lastIndicatorWidth - targetWidth) < 1;

  indicator.toggleAttribute(
    "data-immediate",
    immediate || !lastIndicatorVisible || isAlreadyAtTarget || prefersReducedMotion,
  );

  indicator.style.setProperty("--indicator-x", `${targetX}px`);
  indicator.style.setProperty("--indicator-w", `${targetWidth}px`);
  indicator.dataset["visible"] = "true";
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

if (typeof window !== "undefined" && !SUPPORTS_NATIVE_ANCHOR) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setupDesktopNav();
  } else {
    document.addEventListener("DOMContentLoaded", setupDesktopNav);
  }

  document.addEventListener("astro:page-load", () => {
    setupDesktopNav();
  });

  let resizeTimer: number | null = null;
  window.addEventListener(
    "resize",
    () => {
      if (resizeTimer !== null) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        setupDesktopNav();
      });
    },
    { passive: true },
  );
}

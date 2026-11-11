/**
 * Theme Manager for Amsirar Trip Handles light/dark mode with localStorage persistence, system
 * preference sync, Astro View Transitions, and theme-color meta tag updates.
 */

const STORAGE_KEY = "amsirar-theme";

export type Theme = "light" | "dark";

export function getPreferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // localStorage might be unavailable or disabled
  }
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const isDark = theme === "dark";

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = theme;

  // Update color-scheme meta tag per Modern Web Guidance
  const colorSchemeMeta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (colorSchemeMeta) {
    colorSchemeMeta.content = theme;
  }

  // Update theme-color meta tag for mobile browsers and PWA chrome
  const themeColorLight = document.querySelector('meta[name="theme-color"][media*="light"]');
  const themeColorDark = document.querySelector('meta[name="theme-color"][media*="dark"]');
  const genericThemeColor = document.querySelector('meta[name="theme-color"]:not([media])');

  if (genericThemeColor) {
    genericThemeColor.setAttribute("content", isDark ? "#09090b" : "#efefef");
  } else if (themeColorLight && themeColorDark) {
    // Both specific tags exist, so mobile browser automatically matches the root color-scheme
  }

  // Update toggle buttons aria-label and state across the page
  const toggles = document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]");
  toggles.forEach((btn) => {
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    btn.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
    btn.dataset["theme"] = theme;
  });

  // Dispatch custom event for components/canvas/maps that need to react
  globalThis.dispatchEvent(new CustomEvent("theme-change", { detail: { theme } }));
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
  applyTheme(theme);
}

export function toggleTheme(): Theme {
  const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
  const next: Theme = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

const handleMediaChange = (e: MediaQueryListEvent): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      applyTheme(e.matches ? "dark" : "light");
    }
  } catch {
    applyTheme(e.matches ? "dark" : "light");
  }
};

const handleToggleClick = (e: MouseEvent): void => {
  const target = (e.target as Element | null)?.closest<HTMLButtonElement>("[data-theme-toggle]");
  if (!target) {
    return;
  }

  e.preventDefault();
  toggleTheme();
};

let listenersInitialized = false;

function initThemeListeners(): void {
  if (listenersInitialized) {
    return;
  }
  listenersInitialized = true;

  // Listen to OS system preference changes (only applies if user hasn't explicitly set a preference)
  const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", handleMediaChange);

  // Bind delegated click handler to document once
  document.addEventListener("click", handleToggleClick);

  // Sync across tabs
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
      applyTheme(e.newValue);
    }
  });
}

// Preserve theme on incoming document during Astro View Transitions before swap
document.addEventListener("astro:before-swap", (e: Event) => {
  const swapEvent = e as unknown as { newDocument?: Document };
  if (swapEvent.newDocument) {
    const isDark = getPreferredTheme() === "dark";
    swapEvent.newDocument.documentElement.classList.toggle("dark", isDark);
    swapEvent.newDocument.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }
});

// Re-sync theme state after DOM swap
document.addEventListener("astro:after-swap", () => {
  applyTheme(getPreferredTheme());
});

// Setup on page load (initial and client-side view transition navigations)
document.addEventListener("astro:page-load", () => {
  applyTheme(getPreferredTheme());
  initThemeListeners();
});

// Immediately initialize on first script run
applyTheme(getPreferredTheme());
initThemeListeners();

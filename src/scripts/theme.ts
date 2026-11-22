/**
 * Theme Manager for Amsirar Trip: light/dark persistence, system preference sync, Astro View
 * Transitions state preservation, and native circular View Transition reveal.
 */

const STORAGE_KEY = "amsirar-theme";

export type Theme = "light" | "dark";
export interface Point {
  readonly x: number;
  readonly y: number;
}

export function getPreferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // localStorage might be unavailable
  }
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const isDark = theme === "dark";

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = theme;

  const colorSchemeMeta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (colorSchemeMeta) {
    colorSchemeMeta.content = theme;
  }

  const genericThemeColor = document.querySelector('meta[name="theme-color"]:not([media])');
  if (genericThemeColor) {
    genericThemeColor.setAttribute("content", isDark ? "#09090b" : "#efefef");
  }

  const toggles = document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]");
  for (const btn of toggles) {
    const label =
      isDark ?
        (btn.dataset["labelLight"] ?? "Switch to light mode")
      : (btn.dataset["labelDark"] ?? "Switch to dark mode");
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
    btn.dataset["theme"] = theme;
  }

  globalThis.dispatchEvent(new CustomEvent("theme-change", { detail: { theme } }));
}

export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore storage restriction
  }
  applyTheme(theme);
}

function applyCrossfadeFallback(next: Theme): void {
  const root = document.documentElement;
  root.classList.add("theme-fade");
  setTheme(next);
  globalThis.setTimeout(() => {
    root.classList.remove("theme-fade");
  }, 300);
}

export function toggleTheme(origin?: Point): Theme {
  const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
  const next: Theme = current === "dark" ? "light" : "dark";
  const reducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // eslint-disable-next-line baseline-js/use-baseline -- feature-checked progressive enhancement
  if (reducedMotion || typeof document.startViewTransition !== "function") {
    if (reducedMotion) {
      setTheme(next);
    } else {
      applyCrossfadeFallback(next);
    }
    return next;
  }

  const x = origin?.x ?? globalThis.innerWidth / 2;
  const y = origin?.y ?? globalThis.innerHeight / 2;
  const maxRadius = Math.hypot(
    Math.max(x, globalThis.innerWidth - x),
    Math.max(y, globalThis.innerHeight - y),
  );

  const root = document.documentElement;
  root.classList.add("theme-transition");

  // eslint-disable-next-line baseline-js/use-baseline -- guarded above via typeof document.startViewTransition === "function"
  const transition = document.startViewTransition(() => {
    setTheme(next);
  });

  // eslint-disable-next-line baseline-js/use-baseline -- guarded ViewTransition API
  void transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`] },
        {
          duration: 480,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
      // Transition skipped or aborted; theme state is already applied.
    });

  // eslint-disable-next-line baseline-js/use-baseline -- guarded ViewTransition API
  void transition.finished.finally(() => {
    root.classList.remove("theme-transition");
  });

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
  const target =
    e.target instanceof Element ? e.target.closest<HTMLButtonElement>("[data-theme-toggle]") : null;
  if (!target) return;

  e.preventDefault();
  let origin: Point | undefined;
  if (e.detail === 0) {
    const rect = target.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
  } else {
    origin = { x: e.clientX, y: e.clientY };
  }
  toggleTheme(origin);
};

let listenersInitialized = false;

function initThemeListeners(): void {
  if (listenersInitialized) return;
  listenersInitialized = true;

  globalThis
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", handleMediaChange);
  document.addEventListener("click", handleToggleClick);
  globalThis.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
      applyTheme(e.newValue);
    }
  });
}

applyTheme(getPreferredTheme());
initThemeListeners();

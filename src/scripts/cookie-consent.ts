/**
 * Amsirar Trip - Cookie Consent & Privacy Manager Compliant with GDPR, ePrivacy Directive, and
 * Moroccan Law 09-08 (CNDP).
 *
 * Provides:
 *
 * - Persistent consent tracking (Cookie & LocalStorage)
 * - Granular categories: Strictly Necessary, Analytics & Performance, Functional & Experience
 * - Dynamic custom events: "amsirar:consent-changed"
 * - Full Astro View Transitions compatibility
 * - Keyboard accessible modal & focus management
 */

import gsap from "gsap";

export interface CookiePreferences {
  readonly necessary: true;
  readonly analytics: boolean;
  readonly functional: boolean;
  readonly timestamp: string;
  readonly version: number;
}

const COOKIE_NAME = "amsirar_cookie_consent";
const STORAGE_KEY = "amsirar_cookie_consent_v1";
const CONSENT_VERSION = 1;
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/** Type guard verifying that a value structurally conforms to CookiePreferences. */
export function isCookiePreferences(value: unknown): value is CookiePreferences {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate["necessary"] === true
    && typeof candidate["analytics"] === "boolean"
    && typeof candidate["functional"] === "boolean"
    && typeof candidate["timestamp"] === "string"
    && candidate["version"] === CONSENT_VERSION
  );
}

/** Retrieves the current user cookie preferences, or null if not yet determined. */
export function getCookieConsent(): CookiePreferences | null {
  if (typeof document === "undefined") return null;

  try {
    const cookieMatch = /(?:^|;\s*)amsirar_cookie_consent=([^;]+)/.exec(document.cookie);
    if (cookieMatch?.[1]) {
      const parsed: unknown = JSON.parse(decodeURIComponent(cookieMatch[1]));
      if (isCookiePreferences(parsed)) {
        return parsed;
      }
    }

    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed: unknown = JSON.parse(local);
      if (isCookiePreferences(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("[Amsirar Privacy] Error reading cookie preferences:", error);
  }

  return null;
}

/**
 * Stores cookie preferences in both document.cookie and localStorage, and notifies the document
 * with a custom event.
 */
export function setCookieConsent(preferences: {
  analytics: boolean;
  functional: boolean;
}): CookiePreferences {
  const consent: CookiePreferences = {
    necessary: true,
    analytics: preferences.analytics,
    functional: preferences.functional,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  try {
    const serialized = JSON.stringify(consent);
    const isSecure = globalThis.location.protocol === "https:";
    // eslint-disable-next-line unicorn/no-document-cookie
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(serialized)}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn("[Amsirar Privacy] Error saving cookie preferences:", error);
  }

  // Dispatch custom event for analytics/maps scripts
  globalThis.dispatchEvent(
    new CustomEvent("amsirar:consent-changed", { detail: consent, bubbles: true }),
  );

  return consent;
}

let lastFocusedElement: HTMLElement | null = null;

function getBannerElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>("#cookie-banner");
}

function getModalElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>("#cookie-preferences-modal");
}

function getBadgeButton(): HTMLElement | null {
  return document.querySelector<HTMLElement>("#cookie-badge-btn");
}

/**
 * Animate a specific toggle switch track & thumb using GSAP. Translates thumb, morphs track
 * background and glow, and applies responsive spring dynamics.
 */
export function animateToggleSwitch(input: HTMLInputElement, animate = true): void {
  const label = input.closest("label");
  if (!label) return;

  const track = label.querySelector<HTMLElement>(".amsirar-toggle-track");
  if (!track || track.classList.contains("is-locked")) return;

  const thumb = track.querySelector<HTMLElement>(".amsirar-toggle-thumb");
  if (!thumb) return;

  const isChecked = input.checked;
  const prefersReduced =
    typeof globalThis !== "undefined"
    && typeof globalThis.matchMedia === "function"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!animate || prefersReduced) {
    gsap.killTweensOf([track, thumb]);
    gsap.set(thumb, { x: isChecked ? 20 : 0 });
    gsap.set(track, {
      backgroundColor: isChecked ? "#c2410c" : "#27272a",
      borderColor: isChecked ? "rgba(234, 88, 12, 0.8)" : "rgba(255, 255, 255, 0.2)",
    });
    return;
  }

  const tl = gsap.timeline({ overwrite: "auto" });

  tl.to(
    track,
    {
      backgroundColor: isChecked ? "#c2410c" : "#27272a",
      borderColor: isChecked ? "rgba(234, 88, 12, 0.8)" : "rgba(255, 255, 255, 0.2)",
      duration: 0.2,
      ease: "power2.out",
    },
    0,
  );

  tl.to(thumb, { x: isChecked ? 20 : 0, duration: 0.2, ease: "power2.out" }, 0);
}

/** Synchronize all toggle switches in the preferences modal with GSAP. */
export function syncAllToggleSwitches(animate = false): void {
  const toggleInputs = document.querySelectorAll<HTMLInputElement>(
    ".amsirar-toggle-input:not([disabled])",
  );
  for (const input of toggleInputs) {
    animateToggleSwitch(input, animate);
  }
}

export function showBanner(): void {
  const banner = getBannerElement();
  if (!banner) return;
  banner.classList.remove("hidden");
  requestAnimationFrame(() => {
    banner.classList.remove("opacity-0", "translate-y-3");
    banner.classList.add("opacity-100", "translate-y-0");
  });
}

export function hideBanner(): void {
  const banner = getBannerElement();
  if (!banner) return;
  banner.classList.add("opacity-0", "translate-y-3");
  banner.classList.remove("opacity-100", "translate-y-0");
  setTimeout(() => {
    banner.classList.add("hidden");
  }, 300);
}

export function openPreferencesModal(triggerElement?: HTMLElement): void {
  const modal = getModalElement();
  if (!modal) return;

  const banner = getBannerElement();
  if (banner && !banner.classList.contains("hidden")) {
    banner.classList.add("hidden", "opacity-0", "translate-y-3");
    banner.classList.remove("opacity-100", "translate-y-0");
  }

  if (triggerElement) {
    lastFocusedElement = triggerElement;
  } else if (document.activeElement instanceof HTMLElement) {
    lastFocusedElement = document.activeElement;
  }

  const current = getCookieConsent();
  const analyticsInput = document.querySelector<HTMLInputElement>("#cookie-toggle-analytics");
  const functionalInput = document.querySelector<HTMLInputElement>("#cookie-toggle-functional");

  if (analyticsInput) {
    analyticsInput.checked = Boolean(current?.analytics);
  }
  if (functionalInput) {
    functionalInput.checked = Boolean(current?.functional);
  }

  syncAllToggleSwitches(false);

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  requestAnimationFrame(() => {
    modal.classList.remove("opacity-0");
    modal.classList.add("opacity-100");
  });
  document.body.classList.add("overflow-hidden");

  const closeBtn = modal.querySelector<HTMLElement>("[data-cookie-close-preferences]");
  closeBtn?.focus();
}

export function closePreferencesModal(): void {
  const modal = getModalElement();
  if (!modal || modal.classList.contains("hidden")) return;

  modal.classList.add("opacity-0");
  modal.classList.remove("opacity-100");
  document.body.classList.remove("overflow-hidden");

  const consent = getCookieConsent();
  if (!consent) {
    showBanner();
  }

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 250);

  if (lastFocusedElement && document.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
  }
}

function handleAcceptAll(): void {
  const analyticsInput = document.querySelector<HTMLInputElement>("#cookie-toggle-analytics");
  const functionalInput = document.querySelector<HTMLInputElement>("#cookie-toggle-functional");
  if (analyticsInput) analyticsInput.checked = true;
  if (functionalInput) functionalInput.checked = true;
  syncAllToggleSwitches(true);

  setCookieConsent({ analytics: true, functional: true });
  hideBanner();
  closePreferencesModal();
  updateBadgeVisibility();
}

function handleRejectAll(): void {
  const analyticsInput = document.querySelector<HTMLInputElement>("#cookie-toggle-analytics");
  const functionalInput = document.querySelector<HTMLInputElement>("#cookie-toggle-functional");
  if (analyticsInput) analyticsInput.checked = false;
  if (functionalInput) functionalInput.checked = false;
  syncAllToggleSwitches(true);

  setCookieConsent({ analytics: false, functional: false });
  hideBanner();
  closePreferencesModal();
  updateBadgeVisibility();
}

function handleSavePreferences(): void {
  const analyticsInput = document.querySelector<HTMLInputElement>("#cookie-toggle-analytics");
  const functionalInput = document.querySelector<HTMLInputElement>("#cookie-toggle-functional");

  setCookieConsent({
    analytics: Boolean(analyticsInput?.checked),
    functional: Boolean(functionalInput?.checked),
  });

  hideBanner();
  closePreferencesModal();
  updateBadgeVisibility();
}

function updateBadgeVisibility(): void {
  const badge = getBadgeButton();
  if (!badge) return;
  const consent = getCookieConsent();
  badge.classList.toggle("hidden", !consent);
}

/** Initializes listeners on current page load (and on Astro View Transitions). */
export function initCookieConsent(): void {
  const consent = getCookieConsent();

  if (consent) {
    hideBanner();
  } else {
    setTimeout(showBanner, 600);
  }

  updateBadgeVisibility();

  const toggleInputs = document.querySelectorAll<HTMLInputElement>(
    ".amsirar-toggle-input:not([disabled])",
  );
  for (const input of toggleInputs) {
    input.addEventListener("change", () => {
      animateToggleSwitch(input, true);
    });
  }

  syncAllToggleSwitches(false);

  const acceptButtons = document.querySelectorAll<HTMLElement>("[data-cookie-accept-all]");
  for (const btn of acceptButtons) {
    btn.addEventListener("click", handleAcceptAll);
  }

  const rejectButtons = document.querySelectorAll<HTMLElement>("[data-cookie-reject-all]");
  for (const btn of rejectButtons) {
    btn.addEventListener("click", handleRejectAll);
  }

  const openPrefButtons = document.querySelectorAll<HTMLElement>("[data-cookie-open-preferences]");
  for (const btn of openPrefButtons) {
    btn.addEventListener("click", () => {
      openPreferencesModal(btn);
    });
  }

  const closePrefButtons = document.querySelectorAll<HTMLElement>(
    "[data-cookie-close-preferences]",
  );
  for (const btn of closePrefButtons) {
    btn.addEventListener("click", closePreferencesModal);
  }

  const savePrefButtons = document.querySelectorAll<HTMLElement>("[data-cookie-save-preferences]");
  for (const btn of savePrefButtons) {
    btn.addEventListener("click", handleSavePreferences);
  }

  // Any button in the entire app with `data-open-cookie-settings`
  const globalOpenTriggers = document.querySelectorAll<HTMLElement>("[data-open-cookie-settings]");
  for (const trigger of globalOpenTriggers) {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openPreferencesModal(trigger);
    });
  }

  // Modal backdrop click
  const modal = getModalElement();
  const backdrop = modal?.querySelector<HTMLElement>("[data-modal-backdrop]");
  backdrop?.addEventListener("click", closePreferencesModal);
}

// Global keydown listener for keyboard accessibility (Escape close + Tab focus trap)
if (typeof window !== "undefined") {
  globalThis.addEventListener("keydown", (event: KeyboardEvent) => {
    const modal = getModalElement();
    if (!modal || modal.classList.contains("hidden")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closePreferencesModal();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const focusableElements = [...focusable].filter(
      (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);
    if (!firstElement || !lastElement) return;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  // Re-run setup on View Transitions page swap
  document.addEventListener("astro:page-load", initCookieConsent);

  // Expose global controller on window for debug/manual invocation
  Object.assign(globalThis, {
    __amsirarCookieConsent: {
      get: getCookieConsent,
      set: setCookieConsent,
      openModal: openPreferencesModal,
      closeModal: closePreferencesModal,
    },
  });
}

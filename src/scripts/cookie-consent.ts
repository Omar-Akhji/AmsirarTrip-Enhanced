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
  necessary: true;
  analytics: boolean;
  functional: boolean;
  timestamp: string;
  version: number;
}

const COOKIE_NAME = "amsirar_cookie_consent";
const STORAGE_KEY = "amsirar_cookie_consent_v1";
const CONSENT_VERSION = 1;
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/** Retrieves the current user cookie preferences, or null if not yet determined. */
export function getCookieConsent(): CookiePreferences | null {
  if (typeof document === "undefined") return null;

  try {
    // 1. Try reading cookie
    const cookieMatch = /(?:^|;\s*)amsirar_cookie_consent=([^;]+)/.exec(document.cookie);
    if (cookieMatch?.[1]) {
      const parsed = JSON.parse(decodeURIComponent(cookieMatch[1])) as CookiePreferences;
      if (parsed && typeof parsed === "object" && parsed.version === CONSENT_VERSION) {
        return parsed;
      }
    }

    // 2. Fallback to localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local) as CookiePreferences;
      if (parsed && typeof parsed === "object" && parsed.version === CONSENT_VERSION) {
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

// ── DOM UI Controllers ──────────────────────────────────────────

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
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!animate || prefersReduced) {
    gsap.killTweensOf([track, thumb]);
    gsap.set(thumb, { x: isChecked ? 22 : 0, scaleX: 1, scaleY: 1 });
    gsap.set(track, {
      backgroundColor: isChecked ? "#ea580c" : "#27272a",
      borderColor: isChecked ? "rgba(251, 146, 60, 0.7)" : "rgba(255, 255, 255, 0.15)",
      boxShadow:
        isChecked ? "0 0 14px rgba(234, 88, 12, 0.45)" : "inset 0 1px 2px rgba(0, 0, 0, 0.4)",
    });
    return;
  }

  const tl = gsap.timeline({ overwrite: "auto" });

  // 1. Morph track background color, border, and glow
  tl.to(
    track,
    {
      backgroundColor: isChecked ? "#ea580c" : "#27272a",
      borderColor: isChecked ? "rgba(251, 146, 60, 0.7)" : "rgba(255, 255, 255, 0.15)",
      boxShadow:
        isChecked ? "0 0 14px rgba(234, 88, 12, 0.45)" : "inset 0 1px 2px rgba(0, 0, 0, 0.4)",
      duration: 0.28,
      ease: "power2.out",
    },
    0,
  );

  // 2. Micro squash-and-stretch during travel
  tl.to(thumb, { scaleX: 1.15, scaleY: 0.9, duration: 0.09, ease: "power1.out" }, 0);

  // 3. Smooth glide with Apple-like spring overshoot
  tl.to(
    thumb,
    { x: isChecked ? 22 : 0, scaleX: 1, scaleY: 1, duration: 0.28, ease: "back.out(1.75)" },
    0.06,
  );
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

  // Populate checkboxes with current consent
  const current = getCookieConsent();
  const analyticsInput = document.querySelector<HTMLInputElement>("#cookie-toggle-analytics");
  const functionalInput = document.querySelector<HTMLInputElement>("#cookie-toggle-functional");

  if (analyticsInput) {
    analyticsInput.checked = Boolean(current?.analytics);
  }
  if (functionalInput) {
    functionalInput.checked = Boolean(current?.functional);
  }

  // Set initial GSAP switch states without layout flash
  syncAllToggleSwitches(false);

  modal.classList.remove("hidden");
  requestAnimationFrame(() => {
    modal.classList.remove("opacity-0");
    modal.classList.add("opacity-100");
  });
  document.body.classList.add("overflow-hidden");

  // Focus the close button or first interactive element
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

  // Attach change listeners to toggle switches for GSAP glide animations
  const toggleInputs = document.querySelectorAll<HTMLInputElement>(
    ".amsirar-toggle-input:not([disabled])",
  );
  for (const input of toggleInputs) {
    input.addEventListener("change", () => {
      animateToggleSwitch(input, true);
    });
  }

  // Initial sync with GSAP
  syncAllToggleSwitches(false);

  // Attach click handlers to elements with specific data attributes
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
  if (modal) {
    const backdrop = modal.querySelector<HTMLElement>("[data-modal-backdrop]");
    if (backdrop) {
      backdrop.addEventListener("click", closePreferencesModal);
    }
  }
}

// Global keydown listener for Escape key to close modal
if (typeof window !== "undefined") {
  globalThis.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closePreferencesModal();
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

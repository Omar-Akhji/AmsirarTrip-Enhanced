/**
 * Amsirar Trip - Cookie Consent & Privacy Manager Compliant with GDPR, ePrivacy Directive, and
 * Moroccan Law 09-08 (CNDP).
 */

export interface CookiePreferences {
  readonly analytics: boolean;
  readonly functional: boolean;
  readonly necessary: true;
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

/** Stores cookie preferences in both document.cookie and localStorage, and notifies the document. */
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

  globalThis.dispatchEvent(
    new CustomEvent("amsirar:consent-changed", { detail: consent, bubbles: true }),
  );

  return consent;
}

let lastFocusedElement: HTMLElement | null = null;
let showBannerTimer: ReturnType<typeof setTimeout> | null = null;

function getBannerElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>("#cookie-banner");
}

function getModalElement(): HTMLDialogElement | null {
  return document.querySelector<HTMLDialogElement>("#cookie-preferences-modal");
}

function getBadgeButton(): HTMLElement | null {
  return document.querySelector<HTMLElement>("#cookie-badge-btn");
}

export function showBanner(): void {
  const banner = getBannerElement();
  if (!banner) return;
  banner.dataset["open"] = "true";
}

export function hideBanner(): void {
  const banner = getBannerElement();
  if (!banner) return;
  banner.dataset["open"] = "false";
}

function syncModalCheckboxes(): void {
  const current = getCookieConsent();
  const analyticsInput = document.querySelector<HTMLInputElement>("#cookie-toggle-analytics");
  const functionalInput = document.querySelector<HTMLInputElement>("#cookie-toggle-functional");

  if (analyticsInput) {
    analyticsInput.checked = Boolean(current?.analytics);
  }
  if (functionalInput) {
    functionalInput.checked = Boolean(current?.functional);
  }
}

function preparePreferencesModalOpen(triggerElement?: HTMLElement): void {
  hideBanner();
  if (triggerElement) {
    lastFocusedElement = triggerElement;
  } else if (document.activeElement instanceof HTMLElement) {
    lastFocusedElement = document.activeElement;
  }
  syncModalCheckboxes();
}

export function openPreferencesModal(triggerElement?: HTMLElement): void {
  const modal = getModalElement();
  if (!modal) return;
  preparePreferencesModalOpen(triggerElement);
  if (!modal.open) {
    modal.showModal();
  }
}

export function closePreferencesModal(): void {
  const modal = getModalElement();
  if (modal?.open) {
    modal.close();
  }
}

function handleConsentSaved(analytics: boolean, functional: boolean): void {
  const analyticsInput = document.querySelector<HTMLInputElement>("#cookie-toggle-analytics");
  const functionalInput = document.querySelector<HTMLInputElement>("#cookie-toggle-functional");
  if (analyticsInput) analyticsInput.checked = analytics;
  if (functionalInput) functionalInput.checked = functional;

  setCookieConsent({ analytics, functional });
  hideBanner();
  closePreferencesModal();
  updateBadgeVisibility();
}

function handleSavePreferences(): void {
  const analyticsInput = document.querySelector<HTMLInputElement>("#cookie-toggle-analytics");
  const functionalInput = document.querySelector<HTMLInputElement>("#cookie-toggle-functional");
  handleConsentSaved(Boolean(analyticsInput?.checked), Boolean(functionalInput?.checked));
}

function updateBadgeVisibility(): void {
  const badge = getBadgeButton();
  if (!badge) return;
  badge.classList.toggle("hidden", !getCookieConsent());
}

function scheduleInitialBanner(modal: HTMLDialogElement): void {
  if (showBannerTimer !== null) {
    clearTimeout(showBannerTimer);
    showBannerTimer = null;
  }

  if (getCookieConsent()) {
    hideBanner();
    return;
  }

  showBannerTimer = globalThis.setTimeout(() => {
    showBannerTimer = null;
    if (!getCookieConsent() && !modal.open) {
      showBanner();
    }
  }, 600);
}

function bindConsentActionButtons(modal: HTMLDialogElement, signal: AbortSignal): void {
  for (const btn of document.querySelectorAll<HTMLElement>("[data-cookie-accept-all]")) {
    btn.addEventListener("click", () => handleConsentSaved(true, true), { signal });
  }

  for (const btn of document.querySelectorAll<HTMLElement>("[data-cookie-reject-all]")) {
    btn.addEventListener("click", () => handleConsentSaved(false, false), { signal });
  }

  for (const btn of document.querySelectorAll<HTMLElement>("[data-cookie-open-preferences]")) {
    btn.addEventListener(
      "click",
      () => {
        preparePreferencesModalOpen(btn);
        if (!("commandForElement" in HTMLButtonElement.prototype) && !modal.open) {
          modal.showModal();
        }
      },
      { signal },
    );
  }

  for (const btn of document.querySelectorAll<HTMLElement>("[data-cookie-save-preferences]")) {
    btn.addEventListener("click", handleSavePreferences, { signal });
  }

  for (const trigger of document.querySelectorAll<HTMLElement>("[data-open-cookie-settings]")) {
    trigger.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        openPreferencesModal(trigger);
      },
      { signal },
    );
  }
}

function bindModalDismissHandlers(modal: HTMLDialogElement, signal: AbortSignal): void {
  // Fallback for browsers without native closedby="any" light dismiss (e.g., Safari)
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    modal.addEventListener(
      "click",
      (event) => {
        if (event.target === modal) {
          closePreferencesModal();
        }
      },
      { signal },
    );
  }

  modal.addEventListener(
    "close",
    () => {
      if (!getCookieConsent()) {
        showBanner();
      }
      if (lastFocusedElement && document.contains(lastFocusedElement)) {
        lastFocusedElement.focus();
      }
    },
    { signal },
  );
}

/** Initializes listeners on current page load. */
export function initCookieConsent(): void {
  const banner = getBannerElement();
  const modal = getModalElement();
  if (!banner || !modal || banner.dataset["cookieInit"] === "true") return;
  banner.dataset["cookieInit"] = "true";

  scheduleInitialBanner(modal);
  updateBadgeVisibility();

  const controller = new AbortController();
  const { signal } = controller;
  bindConsentActionButtons(modal, signal);
  bindModalDismissHandlers(modal, signal);

  globalThis.addEventListener(
    "pagehide",
    () => {
      if (showBannerTimer !== null) {
        clearTimeout(showBannerTimer);
        showBannerTimer = null;
      }
      controller.abort();
      delete banner.dataset["cookieInit"];
    },
    { once: true },
  );
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCookieConsent, { once: true });
  } else {
    initCookieConsent();
  }

  Object.assign(globalThis, {
    __amsirarCookieConsent: {
      get: getCookieConsent,
      set: setCookieConsent,
      openModal: openPreferencesModal,
      closeModal: closePreferencesModal,
    },
  });
}

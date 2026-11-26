import { actions } from "astro:actions";
import { isLocale, type Locale } from "@/i18n/locales";
import { hasCaptcha, TURNSTILE_SITE_KEY } from "@/lib/client-env";
import { getTurnstileApi, loadTurnstileApi } from "@/lib/turnstile-client";

const AUTO_CLOSE_DELAY_MS = 4000;
const ERROR_FEEDBACK_DURATION_MS = 4000;
const SUBMIT_TIMEOUT_MS = 20_000;

type NewsletterStatusKey =
  | "footer.newsletterSuccess"
  | "footer.newsletterRateLimited"
  | "footer.newsletterCaptchaError"
  | "footer.newsletterFailure";

interface NewsletterElements {
  readonly dialog: HTMLDialogElement;
  readonly form: HTMLFormElement;
  readonly submitBtn: HTMLButtonElement;
  readonly submitLabel: HTMLElement;
  readonly turnstileSlot: HTMLElement | null;
  readonly turnstileWrap: HTMLElement;
}

interface NewsletterConfig {
  readonly labels: { readonly sending: string; readonly subscribe: string };
  readonly messages: Record<NewsletterStatusKey, string>;
}

function resolveDocumentLanguage(): Locale {
  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : "en";
}

function readNewsletterConfig(form: HTMLFormElement): NewsletterConfig {
  return {
    labels: {
      subscribe: form.dataset["labelSubscribe"] ?? "Subscribe",
      sending: form.dataset["labelSending"] ?? "Sending...",
    },
    messages: {
      "footer.newsletterSuccess": form.dataset["msgSuccess"] ?? "",
      "footer.newsletterRateLimited": form.dataset["msgRateLimited"] ?? "",
      "footer.newsletterCaptchaError": form.dataset["msgCaptcha"] ?? "",
      "footer.newsletterFailure": form.dataset["msgFailure"] ?? "",
    },
  };
}

function queryNewsletterElements(): NewsletterElements | null {
  const dialog = document.querySelector<HTMLDialogElement>("#newsletter-dialog");
  const form = dialog?.querySelector<HTMLFormElement>("[data-newsletter-form]");
  const submitBtn = form?.querySelector<HTMLButtonElement>("[data-newsletter-submit]");
  const submitLabel = form?.querySelector<HTMLElement>("[data-newsletter-submit-label]");
  const turnstileWrap = form?.querySelector<HTMLElement>("[data-newsletter-turnstile-wrap]");
  const turnstileSlot =
    form?.querySelector<HTMLElement>("[data-newsletter-turnstile-slot]") ?? null;

  return dialog && form && submitBtn && submitLabel && turnstileWrap ?
      { dialog, form, submitBtn, submitLabel, turnstileSlot, turnstileWrap }
    : null;
}

function createTurnstileController(elements: NewsletterElements) {
  const { dialog, turnstileSlot, turnstileWrap } = elements;
  let widgetId: string | null = null;
  let renderPromise: Promise<void> | null = null;

  const setCaptchaError = (hasError: boolean): void => {
    turnstileWrap.dataset["captchaError"] = hasError ? "true" : "false";
  };

  const reset = (): void => {
    if (widgetId) {
      getTurnstileApi()?.reset(widgetId);
    }
  };

  const getToken = (): string => (widgetId ? (getTurnstileApi()?.getResponse(widgetId) ?? "") : "");

  const remove = (): void => {
    if (widgetId) {
      getTurnstileApi()?.remove(widgetId);
      widgetId = null;
    }
  };

  const ensureRendered = async (): Promise<void> => {
    if (!hasCaptcha || !TURNSTILE_SITE_KEY || !turnstileSlot || widgetId !== null) return;
    if (renderPromise) return renderPromise;

    renderPromise = (async () => {
      const api = await loadTurnstileApi();
      if (!api || !dialog.isConnected || !turnstileSlot.isConnected) return;

      try {
        widgetId = api.render(turnstileSlot, {
          action: "newsletter",
          language: resolveDocumentLanguage(),
          sitekey: TURNSTILE_SITE_KEY,
          size: "normal",
          theme: "dark",
          callback: () => {
            setCaptchaError(false);
          },
          "error-callback": () => {
            setCaptchaError(true);
          },
        });
      } catch {
        widgetId = null;
      }
    })();

    try {
      await renderPromise;
    } finally {
      renderPromise = null;
    }
  };

  return { ensureRendered, getToken, remove, reset, setCaptchaError };
}

async function submitWithTimeout(formData: FormData, signal: AbortSignal) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    const onAbort = (): void => {
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      reject(new Error("Request timed out"));
    }, SUBMIT_TIMEOUT_MS);
  });

  try {
    return await Promise.race([actions.newsletter(formData), timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

interface NewsletterEventBindings {
  readonly abortPendingSubmit: () => void;
  readonly clearTimers: () => void;
  readonly dialog: HTMLDialogElement;
  readonly form: HTMLFormElement;
  readonly onSubmit: () => Promise<void>;
  readonly resetToIdle: () => void;
  readonly signal: AbortSignal;
  readonly turnstile: ReturnType<typeof createTurnstileController>;
}

function bindNewsletterEvents({
  abortPendingSubmit,
  clearTimers,
  dialog,
  form,
  onSubmit,
  resetToIdle,
  signal,
  turnstile,
}: NewsletterEventBindings): void {
  // Fallback for browsers without native Invoker Commands (Safari < 26.2)
  if (!("commandForElement" in HTMLButtonElement.prototype)) {
    document.addEventListener(
      "click",
      (event) => {
        if (!(event.target instanceof Element)) return;
        if (event.target.closest("[data-newsletter-open]") && !dialog.open) {
          dialog.showModal();
        }
      },
      { signal },
    );
  }

  // Fallback for browsers without native closedby="any" light dismiss (e.g., Safari)
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    dialog.addEventListener(
      "click",
      (event) => {
        if (event.target === dialog) {
          dialog.close();
        }
      },
      { signal },
    );
  }

  dialog.addEventListener(
    "close",
    () => {
      abortPendingSubmit();
      clearTimers();
      turnstile.setCaptchaError(false);
      resetToIdle();
    },
    { signal },
  );

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      void onSubmit();
    },
    { signal },
  );
}

function setupNewsletterModal(): void {
  type SubmitState = "idle" | "submitting" | "success" | "error";
  const elements = queryNewsletterElements();
  if (!elements || elements.dialog.dataset["newsletterInit"] === "true") return;

  const { dialog, form, submitBtn, submitLabel } = elements;
  dialog.dataset["newsletterInit"] = "true";

  const { labels, messages } = readNewsletterConfig(form);
  const turnstile = createTurnstileController(elements);

  let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let errorResetTimer: ReturnType<typeof setTimeout> | null = null;
  let currentState: SubmitState = "idle";
  let submitController: AbortController | null = null;

  const clearTimers = (): void => {
    if (autoCloseTimer !== null) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
    if (errorResetTimer !== null) {
      clearTimeout(errorResetTimer);
      errorResetTimer = null;
    }
  };

  const abortPendingSubmit = (): void => {
    submitController?.abort();
    submitController = null;
  };

  const setSubmitState = (nextState: SubmitState, errorMessage?: string): void => {
    currentState = nextState;
    submitBtn.dataset["state"] = nextState;
    submitBtn.disabled = nextState === "submitting" || nextState === "success";
    submitBtn.setAttribute("aria-busy", nextState === "submitting" ? "true" : "false");

    if (nextState === "success" || nextState === "error") {
      submitLabel.setAttribute("role", "status");
    } else if (submitLabel.hasAttribute("role")) {
      submitLabel.removeAttribute("role");
    }

    switch (nextState) {
      case "submitting": {
        submitLabel.textContent = labels.sending;
        break;
      }
      case "success": {
        submitLabel.textContent = messages["footer.newsletterSuccess"];
        break;
      }
      case "error": {
        submitLabel.textContent = errorMessage ?? messages["footer.newsletterFailure"];
        break;
      }
      case "idle": {
        submitLabel.textContent = labels.subscribe;
        break;
      }
    }
  };

  const showErrorInButton = (message: string): void => {
    clearTimers();
    setSubmitState("error", message);
    errorResetTimer = setTimeout(() => {
      errorResetTimer = null;
      if (currentState === "error") {
        setSubmitState("idle");
      }
    }, ERROR_FEEDBACK_DURATION_MS);
  };

  const handleSubmit = async (): Promise<void> => {
    if (currentState === "submitting" || currentState === "success" || !form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const nameValue = formData.get("name");
    const emailValue = formData.get("email");
    const name = typeof nameValue === "string" ? nameValue.trim() : "";
    const email = typeof emailValue === "string" ? emailValue.trim() : "";

    if (!email || name.length < 2) {
      showErrorInButton(messages["footer.newsletterFailure"]);
      return;
    }

    await turnstile.ensureRendered();
    const recaptchaToken = turnstile.getToken();
    if (!recaptchaToken) {
      turnstile.setCaptchaError(true);
      showErrorInButton(messages["footer.newsletterCaptchaError"]);
      return;
    }

    formData.set("name", name);
    formData.set("email", email);
    formData.set("recaptchaToken", recaptchaToken);
    formData.set("language", resolveDocumentLanguage());

    turnstile.setCaptchaError(false);
    clearTimers();
    setSubmitState("submitting");

    abortPendingSubmit();
    const activeSubmit = new AbortController();
    submitController = activeSubmit;

    try {
      const { data, error } = await submitWithTimeout(formData, activeSubmit.signal);
      if (activeSubmit.signal.aborted || !dialog.isConnected) return;

      if (error || !data.ok) {
        turnstile.reset();
        const key: NewsletterStatusKey = error ? "footer.newsletterFailure" : data.statusKey;
        turnstile.setCaptchaError(key === "footer.newsletterCaptchaError");
        showErrorInButton(messages[key]);
        return;
      }

      form.reset();
      turnstile.reset();
      clearTimers();
      setSubmitState("success");

      autoCloseTimer = setTimeout(() => {
        autoCloseTimer = null;
        dialog.close();
      }, AUTO_CLOSE_DELAY_MS);
    } catch {
      if (activeSubmit.signal.aborted || !dialog.isConnected) return;
      turnstile.reset();
      showErrorInButton(messages["footer.newsletterFailure"]);
    } finally {
      if (submitController === activeSubmit) {
        submitController = null;
      }
    }
  };

  const lifecycleController = new AbortController();
  const { signal } = lifecycleController;

  const openObserver = new MutationObserver(() => {
    if (dialog.open) {
      void turnstile.ensureRendered();
    }
  });
  openObserver.observe(dialog, { attributes: true, attributeFilter: ["open"] });

  if (dialog.open) {
    void turnstile.ensureRendered();
  }

  bindNewsletterEvents({
    abortPendingSubmit,
    clearTimers,
    dialog,
    form,
    onSubmit: handleSubmit,
    resetToIdle: () => {
      if (currentState !== "idle") setSubmitState("idle");
    },
    signal,
    turnstile,
  });

  globalThis.addEventListener(
    "pagehide",
    () => {
      abortPendingSubmit();
      clearTimers();
      openObserver.disconnect();
      lifecycleController.abort();
      turnstile.remove();
      delete dialog.dataset["newsletterInit"];
    },
    { once: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupNewsletterModal, { once: true });
} else {
  setupNewsletterModal();
}

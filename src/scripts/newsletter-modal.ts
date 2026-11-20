import { actions } from "astro:actions";
import { isLocale, type Locale } from "@/i18n/locales";
import { hasCaptcha, TURNSTILE_SITE_KEY } from "@/lib/client-env";
import { getTurnstileApi, loadTurnstileApi } from "@/lib/turnstile-client";

const AUTO_CLOSE_DELAY_MS = 4000;

function resolveDocumentLanguage(): Locale {
  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : "en";
}

function setupNewsletterModal(): void {
  type NewsletterStatusKey =
    | "footer.newsletterSuccess"
    | "footer.newsletterRateLimited"
    | "footer.newsletterCaptchaError"
    | "footer.newsletterFailure";

  type SubmitState = "idle" | "submitting" | "success";

  const dialog = document.querySelector<HTMLDialogElement>("#newsletter-dialog");
  const form = dialog?.querySelector<HTMLFormElement>("[data-newsletter-form]");
  const statusEl = form?.querySelector<HTMLOutputElement>("[data-newsletter-status]");
  const submitBtn = form?.querySelector<HTMLButtonElement>("[data-newsletter-submit]");
  const submitLabel = form?.querySelector<HTMLElement>("[data-newsletter-submit-label]");
  const turnstileWrap = form?.querySelector<HTMLElement>("[data-newsletter-turnstile-wrap]");
  const turnstileSlot = form?.querySelector<HTMLElement>("[data-newsletter-turnstile-slot]");

  if (
    !dialog
    || !form
    || !statusEl
    || !submitBtn
    || !submitLabel
    || !turnstileWrap
    || dialog.dataset["newsletterInit"] === "true"
  ) {
    return;
  }

  dialog.dataset["newsletterInit"] = "true";

  const labels = {
    subscribe: form.dataset["labelSubscribe"] ?? "Subscribe",
    sending: form.dataset["labelSending"] ?? "Sending...",
  };

  const messages: Record<NewsletterStatusKey, string> = {
    "footer.newsletterSuccess": form.dataset["msgSuccess"] ?? "",
    "footer.newsletterRateLimited": form.dataset["msgRateLimited"] ?? "",
    "footer.newsletterCaptchaError": form.dataset["msgCaptcha"] ?? "",
    "footer.newsletterFailure": form.dataset["msgFailure"] ?? "",
  };

  let widgetId: string | null = null;
  let renderPromise: Promise<void> | null = null;
  let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let currentState: SubmitState = "idle";

  const clearAutoClose = (): void => {
    if (autoCloseTimer !== null) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  };

  const setCaptchaError = (hasError: boolean): void => {
    turnstileWrap.dataset["captchaError"] = hasError ? "true" : "false";
  };

  const showErrorStatus = (message: string): void => {
    statusEl.textContent = message;
    statusEl.classList.remove("hidden");
  };

  const clearStatus = (): void => {
    statusEl.textContent = "";
    statusEl.classList.add("hidden");
  };

  const setSubmitState = (nextState: SubmitState): void => {
    currentState = nextState;
    submitBtn.dataset["state"] = nextState;
    submitBtn.disabled = nextState !== "idle";
    submitBtn.setAttribute("aria-busy", nextState === "submitting" ? "true" : "false");

    if (nextState === "submitting") {
      submitLabel.textContent = labels.sending;
    } else if (nextState === "success") {
      submitLabel.textContent = messages["footer.newsletterSuccess"];
    } else {
      submitLabel.textContent = labels.subscribe;
    }
  };

  const resetCaptcha = (): void => {
    if (widgetId) {
      getTurnstileApi()?.reset(widgetId);
    }
  };

  const ensureTurnstileRendered = async (): Promise<void> => {
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

  const handleSubmit = async (): Promise<void> => {
    if (currentState !== "idle" || !form.reportValidity()) return;

    const formData = new FormData(form);
    const nameValue = formData.get("name");
    const emailValue = formData.get("email");
    const name = typeof nameValue === "string" ? nameValue.trim() : "";
    const email = typeof emailValue === "string" ? emailValue.trim() : "";

    if (!email || name.length < 2) {
      showErrorStatus(messages["footer.newsletterFailure"]);
      return;
    }

    await ensureTurnstileRendered();
    const recaptchaToken = widgetId ? (getTurnstileApi()?.getResponse(widgetId) ?? "") : "";
    if (!recaptchaToken) {
      setCaptchaError(true);
      showErrorStatus(messages["footer.newsletterCaptchaError"]);
      return;
    }

    setCaptchaError(false);
    clearStatus();
    setSubmitState("submitting");

    try {
      const { data, error } = await actions.newsletter({
        name,
        email,
        recaptchaToken,
        language: resolveDocumentLanguage(),
      });

      if (error || !data.ok) {
        resetCaptcha();
        const key: NewsletterStatusKey = error ? "footer.newsletterFailure" : data.statusKey;
        setCaptchaError(key === "footer.newsletterCaptchaError");
        showErrorStatus(messages[key]);
        setSubmitState("idle");
        return;
      }

      form.reset();
      resetCaptcha();
      clearStatus();
      setSubmitState("success");

      clearAutoClose();
      autoCloseTimer = setTimeout(() => {
        autoCloseTimer = null;
        dialog.close();
      }, AUTO_CLOSE_DELAY_MS);
    } catch {
      resetCaptcha();
      showErrorStatus(messages["footer.newsletterFailure"]);
      setSubmitState("idle");
    }
  };

  const controller = new AbortController();
  const { signal } = controller;

  const openObserver = new MutationObserver(() => {
    if (dialog.open) {
      void ensureTurnstileRendered();
    }
  });
  openObserver.observe(dialog, { attributes: true, attributeFilter: ["open"] });

  if (dialog.open) {
    void ensureTurnstileRendered();
  }

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

  // Fallback for browsers without native closedby="any" light dismiss (Safari < 26.2)
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
      clearAutoClose();
      clearStatus();
      setCaptchaError(false);
      if (currentState !== "idle") {
        setSubmitState("idle");
      }
    },
    { signal },
  );

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      void handleSubmit();
    },
    { signal },
  );

  document.addEventListener(
    "astro:before-swap",
    () => {
      clearAutoClose();
      openObserver.disconnect();
      controller.abort();
      if (widgetId) {
        getTurnstileApi()?.remove(widgetId);
        widgetId = null;
      }
      delete dialog.dataset["newsletterInit"];
    },
    { once: true },
  );
}

setupNewsletterModal();
document.addEventListener("astro:page-load", setupNewsletterModal);

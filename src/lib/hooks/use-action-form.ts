import { nextTick, onBeforeUnmount, onMounted, ref, type Ref, type ShallowRef } from "vue";
import type { FormState } from "@/lib/form-types";
import {
  getFormErrorMessage,
  useSubmitFeedback,
  type SubmitFeedback,
} from "@/lib/hooks/use-submit-feedback";
import type { TurnstileInstance } from "@/lib/turnstile-client";

export interface ActionFormMessages {
  readonly captchaError: string;
  readonly genericError: string;
  readonly success: string;
  readonly validationError: string;
}

export type ActionFormStatus =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | {
      readonly status: "error";
      readonly message: string;
      readonly errors?: Readonly<Record<string, string>>;
    }
  | { readonly status: "success"; readonly message: string };

export type FormActionExecutor = (
  formData: FormData,
) => Promise<{
  readonly data?: FormState | undefined;
  readonly error?: { readonly message?: string | undefined } | undefined;
}>;

export interface UseActionFormOptions {
  readonly action: FormActionExecutor;
  readonly debounceMs?: number;
  readonly getMessages: () => ActionFormMessages;
  readonly initialState?: FormState | null | undefined;
  readonly recaptchaRef: Readonly<ShallowRef<TurnstileInstance | null>>;
  readonly requiredTrimmedFields: readonly string[];
  readonly statusRef?: Readonly<ShallowRef<HTMLElement | null>>;
}

export interface UseActionFormReturn {
  readonly feedback: Ref<SubmitFeedback | null>;
  readonly formKey: Ref<number>;
  readonly formStatus: Ref<ActionFormStatus>;
  readonly handleSubmit: (event: Event) => Promise<void>;
  readonly isMounted: Ref<boolean>;
  readonly isSubmitting: Ref<boolean>;
  readonly state: Ref<FormState | null>;
}

const DEFAULT_DEBOUNCE_MS = 500;
const SUBMIT_TIMEOUT_MS = 20_000;

function toInitialStatus(initialState?: FormState | null): ActionFormStatus {
  if (!initialState) return { status: "idle" };
  if (initialState.success) {
    return { status: "success", message: initialState.message };
  }
  return {
    status: "error",
    message: initialState.message,
    ...(initialState.errors && { errors: initialState.errors }),
  };
}

async function runActionWithTimeout(
  action: FormActionExecutor,
  formData: FormData,
  signal: AbortSignal,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const abortPromise = new Promise<never>((_, reject) => {
    const onAbort = (): void => {
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    timeoutId = globalThis.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      reject(new Error("Request timed out"));
    }, SUBMIT_TIMEOUT_MS);
  });

  try {
    return await Promise.race([action(formData), abortPromise]);
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export function useActionForm(options: UseActionFormOptions): UseActionFormReturn {
  const {
    action,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    getMessages,
    initialState = null,
    recaptchaRef,
    requiredTrimmedFields,
    statusRef,
  } = options;

  const isMounted = ref(false);
  const formKey = ref(0);
  const state = ref<FormState | null>(initialState);
  const formStatus = ref<ActionFormStatus>(toInitialStatus(initialState));
  const isSubmitting = ref(false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let activeController: AbortController | null = null;

  const { feedback, showFeedback, clearFeedback } = useSubmitFeedback();

  onMounted(() => {
    isMounted.value = true;
  });

  const clearDebounce = (): void => {
    if (debounceTimer !== null) {
      globalThis.clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  };

  onBeforeUnmount(() => {
    activeController?.abort();
    activeController = null;
    clearDebounce();
  });

  const focusFeedback = async (form?: HTMLFormElement): Promise<void> => {
    await nextTick();
    const firstError = form?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      firstError.focus({ preventScroll: true });
      return;
    }
    statusRef?.value?.focus({ preventScroll: true });
  };

  const applyError = async (
    message: string,
    errors: Readonly<Record<string, string>> = {},
    transient = false,
    form?: HTMLFormElement,
  ): Promise<void> => {
    state.value = { success: false, message, errors };
    formStatus.value = { status: "error", message, errors };
    if (transient) {
      showFeedback("error", message, () => {
        state.value = null;
        formStatus.value = { status: "idle" };
      });
    } else {
      showFeedback("error", message);
    }
    await focusFeedback(form);
  };

  const handleSubmit = async (event: Event): Promise<void> => {
    if (isSubmitting.value) return;

    const form =
      event.currentTarget instanceof HTMLFormElement ? event.currentTarget
      : event.target instanceof HTMLFormElement ? event.target
      : null;
    if (!form) return;

    clearDebounce();

    const messages = getMessages();
    const formData = new FormData(form);

    for (const fieldName of requiredTrimmedFields) {
      const value = formData.get(fieldName);
      if (typeof value !== "string" || !value.trim()) {
        await applyError(messages.validationError, {}, true);
        return;
      }
    }

    const recaptchaToken = recaptchaRef.value?.getValue() ?? "";
    if (!recaptchaToken) {
      await applyError(messages.captchaError, { recaptchaToken: messages.captchaError }, true);
      return;
    }

    formData.set("recaptchaToken", recaptchaToken);
    clearFeedback();
    isSubmitting.value = true;
    state.value = null;
    formStatus.value = { status: "submitting" };

    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;

    try {
      const { data, error } = await runActionWithTimeout(action, formData, controller.signal);
      if (controller.signal.aborted) return;

      if (error || !data) {
        recaptchaRef.value?.reset();
        const fallback = error?.message;
        await applyError(
          fallback && fallback.length > 0 ? fallback : messages.genericError,
          {},
          true,
        );
        return;
      }

      state.value = data;
      if (data.success) {
        formKey.value += 1;
        formStatus.value = { status: "success", message: data.message };
        recaptchaRef.value?.reset();
        showFeedback("success", messages.success, () => {
          state.value = null;
          formStatus.value = { status: "idle" };
        });
        await focusFeedback();
        return;
      }

      recaptchaRef.value?.reset();
      await applyError(
        getFormErrorMessage(data, messages.genericError),
        data.errors ?? {},
        false,
        form,
      );
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      recaptchaRef.value?.reset();
      await applyError(error instanceof Error ? error.message : messages.genericError, {}, true);
    } finally {
      if (activeController === controller) {
        activeController = null;
      }
      if (debounceMs > 0) {
        debounceTimer = globalThis.setTimeout(() => {
          isSubmitting.value = false;
          debounceTimer = null;
        }, debounceMs);
      } else {
        isSubmitting.value = false;
      }
    }
  };

  return { feedback, formKey, formStatus, handleSubmit, isMounted, isSubmitting, state };
}

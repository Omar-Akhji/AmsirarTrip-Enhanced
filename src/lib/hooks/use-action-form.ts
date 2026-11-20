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
  readonly recaptchaRef: Readonly<ShallowRef<TurnstileInstance | null>>;
  readonly requiredTrimmedFields: readonly string[];
}

export interface UseActionFormReturn {
  readonly feedback: Ref<SubmitFeedback | null>;
  readonly formKey: Ref<number>;
  readonly handleSubmit: (event: Event) => Promise<void>;
  readonly isMounted: Ref<boolean>;
  readonly isSubmitting: Ref<boolean>;
  readonly state: Ref<FormState | null>;
}

const DEFAULT_DEBOUNCE_MS = 500;

export function useActionForm(options: UseActionFormOptions): UseActionFormReturn {
  const {
    action,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    getMessages,
    recaptchaRef,
    requiredTrimmedFields,
  } = options;

  const isMounted = ref(false);
  const formKey = ref(0);
  const state = ref<FormState | null>(null);
  const isSubmitting = ref(false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const { feedback, showFeedback, clearFeedback } = useSubmitFeedback();

  onMounted(() => {
    isMounted.value = true;
  });

  const clearDebounce = (): void => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  };

  onBeforeUnmount(clearDebounce);

  const showTransientError = (
    message: string,
    errors: Readonly<Record<string, string>> = {},
  ): void => {
    state.value = { success: false, message, errors };
    showFeedback("error", message, () => {
      state.value = null;
    });
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
        showTransientError(messages.validationError);
        return;
      }
    }

    const recaptchaToken = recaptchaRef.value?.getValue() ?? "";
    if (!recaptchaToken) {
      showTransientError(messages.captchaError, { recaptchaToken: messages.captchaError });
      return;
    }

    formData.set("recaptchaToken", recaptchaToken);
    clearFeedback();
    isSubmitting.value = true;
    state.value = null;

    try {
      const { data, error } = await action(formData);

      if (error || !data) {
        recaptchaRef.value?.reset();
        const fallback = error?.message;
        showTransientError(fallback && fallback.length > 0 ? fallback : messages.genericError);
        return;
      }

      state.value = data;
      if (data.success) {
        formKey.value += 1;
        recaptchaRef.value?.reset();
        showFeedback("success", messages.success, () => {
          state.value = null;
        });
        return;
      }

      recaptchaRef.value?.reset();
      showFeedback("error", getFormErrorMessage(data, messages.genericError));
      await nextTick();
      const firstError = form.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error: unknown) {
      recaptchaRef.value?.reset();
      showTransientError(error instanceof Error ? error.message : messages.genericError);
    } finally {
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

  return { feedback, formKey, handleSubmit, isMounted, isSubmitting, state };
}

import { onUnmounted, ref, type Ref } from "vue";
import type { FormState } from "@/lib/form-types";

export interface SubmitFeedback {
  readonly kind: "success" | "error";
  readonly message: string;
}

export interface UseSubmitFeedbackReturn {
  readonly clearFeedback: () => void;
  readonly feedback: Ref<SubmitFeedback | null>;
  readonly showFeedback: (
    kind: "success" | "error",
    message: string,
    afterClear?: () => void,
  ) => void;
}

const FEEDBACK_DURATION_MS = 4000;

export function getFormErrorMessage(state: FormState | null | undefined, fallback: string): string {
  if (!state || state.success) return fallback;
  const firstFieldError = state.errors ? Object.values(state.errors).find(Boolean) : undefined;
  return firstFieldError ?? (state.message.length > 0 ? state.message : fallback);
}

export function useSubmitFeedback(
  initialFeedback: SubmitFeedback | null = null,
): UseSubmitFeedbackReturn {
  const feedback = ref<SubmitFeedback | null>(initialFeedback);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function clearFeedback(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    feedback.value = null;
  }

  function showFeedback(kind: "success" | "error", message: string, afterClear?: () => void): void {
    clearFeedback();
    feedback.value = { kind, message };
    timer = globalThis.setTimeout(() => {
      feedback.value = null;
      timer = null;
      afterClear?.();
    }, FEEDBACK_DURATION_MS);
  }

  onUnmounted(clearFeedback);

  return { feedback, showFeedback, clearFeedback };
}

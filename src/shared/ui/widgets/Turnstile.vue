<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import { hasCaptcha, TURNSTILE_SITE_KEY } from "@/lib/client-env";
import { getTurnstileApi, loadTurnstileApi, type TurnstileInstance } from "@/lib/turnstile-client";
import type { TurnstileAction } from "@/services/turnstile";

interface Props {
  action?: TurnstileAction;
  hasError?: boolean;
  language?: string;
  missingConfigLabel?: string;
  size?: "compact" | "normal";
  theme?: "auto" | "dark" | "light";
}

const props = withDefaults(defineProps<Props>(), {
  action: "contact",
  hasError: false,
  language: "auto",
  missingConfigLabel: "CAPTCHA not configured",
  size: "normal",
  theme: "auto",
});

const emit = defineEmits<{ error: []; expired: []; verify: [token: string] }>();

const containerRef = useTemplateRef<HTMLElement>("containerRef");
const currentToken = ref<string>("");
let widgetId: string | null = null;
let isUnmounted = false;

onMounted(async () => {
  if (!hasCaptcha || !TURNSTILE_SITE_KEY) return;
  const api = await loadTurnstileApi();
  if (!api || isUnmounted || !containerRef.value) {
    if (!isUnmounted) {
      emit("error");
    }
    return;
  }

  try {
    widgetId = api.render(containerRef.value, {
      action: props.action,
      callback: (token: string) => {
        currentToken.value = token;
        emit("verify", token);
      },
      "error-callback": () => {
        currentToken.value = "";
        emit("error");
      },
      "expired-callback": () => {
        currentToken.value = "";
        emit("expired");
      },
      language: props.language,
      "refresh-expired": "auto",
      sitekey: TURNSTILE_SITE_KEY,
      size: props.size,
      theme: props.theme,
    });
  } catch {
    currentToken.value = "";
    emit("error");
  }
});

onBeforeUnmount(() => {
  isUnmounted = true;
  if (widgetId) {
    getTurnstileApi()?.remove(widgetId);
    widgetId = null;
  }
});

const getValue = (): string =>
  widgetId ? (getTurnstileApi()?.getResponse(widgetId) ?? currentToken.value) : currentToken.value;

const reset = (): void => {
  currentToken.value = "";
  if (widgetId) {
    getTurnstileApi()?.reset(widgetId);
  }
};

defineExpose<TurnstileInstance>({ getValue, reset });
</script>

<template>
  <div
    class="w-fit rounded-2xl border border-dashed p-1.5 transition-all"
    :class="
      hasError ?
        'border-red-400 bg-red-50/30 dark:border-red-400/80 dark:bg-red-950/20'
      : 'border-stone-300 bg-stone-50/40 dark:border-white/15 dark:bg-white/2'
    "
  >
    <div
      v-if="hasCaptcha"
      class="m-0 flex flex-col items-center justify-center p-0 leading-none"
    >
      <div
        ref="containerRef"
        class="min-h-16.25 min-w-75"
      />
    </div>
    <div
      v-else
      class="rounded-xl border border-stone-200 bg-stone-100 p-2 font-mono text-xs text-stone-600 dark:border-white/10 dark:bg-stone-800 dark:text-stone-300"
    >
      {{ missingConfigLabel }}
    </div>
  </div>
</template>

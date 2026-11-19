<script lang="ts">
interface TurnstileRenderOptions {
  readonly action?: string;
  readonly callback?: (token: string) => void;
  readonly "error-callback"?: () => void;
  readonly "expired-callback"?: () => void;
  readonly language?: string;
  readonly "refresh-expired"?: "auto" | "manual" | "never";
  readonly sitekey: string;
  readonly size?: "compact" | "normal";
  readonly theme?: "auto" | "dark" | "light";
}

interface TurnstileApi {
  readonly getResponse: (widgetId?: string) => string | undefined;
  readonly remove: (widgetId?: string) => void;
  readonly render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  readonly reset: (widgetId?: string) => void;
}

interface TurnstileGlobal {
  readonly turnstile?: TurnstileApi;
}

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let sharedScriptPromise: Promise<TurnstileApi | null> | null = null;

function getTurnstileApi(): TurnstileApi | null {
  return typeof window === "undefined" ? null : (
      ((globalThis as unknown as TurnstileGlobal).turnstile ?? null)
    );
}

async function loadTurnstileApi(): Promise<TurnstileApi | null> {
  if (typeof window === "undefined") return null;
  const loaded = getTurnstileApi();
  if (loaded) return loaded;
  if (sharedScriptPromise) return sharedScriptPromise;

  sharedScriptPromise = new Promise<TurnstileApi | null>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CSS.escape(TURNSTILE_SCRIPT_SRC)}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(getTurnstileApi()), { once: true });
      existing.addEventListener(
        "error",
        () => {
          existing.remove();
          sharedScriptPromise = null;
          resolve(null);
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(getTurnstileApi()), { once: true });
    script.addEventListener(
      "error",
      () => {
        script.remove();
        sharedScriptPromise = null;
        resolve(null);
      },
      { once: true },
    );
    document.head.append(script);
  });

  return sharedScriptPromise;
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";
import { TURNSTILE_SITE_KEY } from "@/lib/client-env";
import type { TurnstileAction } from "@/services/turnstile";

interface Props {
  action?: TurnstileAction;
  language?: string;
  size?: "compact" | "normal";
  theme?: "auto" | "dark" | "light";
}

export interface TurnstileInstance {
  readonly getValue: () => string;
  readonly reset: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  action: "contact",
  language: "auto",
  size: "normal",
  theme: "auto",
});

const emit = defineEmits<{ error: []; expired: []; verify: [token: string] }>();

const containerRef = useTemplateRef<HTMLElement>("containerRef");
const currentToken = ref<string>("");
let widgetId: string | null = null;
let isUnmounted = false;

onMounted(async () => {
  if (!TURNSTILE_SITE_KEY) return;
  const api = await loadTurnstileApi();
  if (!api || isUnmounted || !containerRef.value) {
    if (!isUnmounted) {
      emit("error");
    }
    return;
  }

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
  <div class="m-0 flex flex-col items-center justify-center p-0 leading-none">
    <div
      ref="containerRef"
      class="min-h-16.25 min-w-75"
    />
  </div>
</template>

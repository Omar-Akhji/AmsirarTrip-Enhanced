<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { CAP_API_ENDPOINT } from "@/lib/client-env";

interface Props {
  endpoint?: string;
  theme?: "light" | "dark";
  size?: "normal" | "compact";
}

const props = withDefaults(defineProps<Props>(), {
  endpoint: () => CAP_API_ENDPOINT,
  theme: "light",
  size: "normal",
});

const emit = defineEmits<{ verify: [token: string]; expired: []; error: [] }>();

const isDev = import.meta.env.DEV;
const rawEndpoint = props.endpoint || CAP_API_ENDPOINT || "/api/cap/";
const activeEndpoint = rawEndpoint.endsWith("/") ? rawEndpoint : `${rawEndpoint}/`;
const capWidget = useTemplateRef<HTMLElement>("capWidget");
const currentToken = ref<string>("");
const isDevBypassed = ref<boolean>(false);

const onCapSolve = (event: Event) => {
  const customEvent = event as CustomEvent<{ token?: string }>;
  const widget = capWidget.value as unknown as { token?: string } | null;
  const token = customEvent.detail?.token ?? widget?.token ?? "";
  if (!token) return;
  currentToken.value = token;
  isDevBypassed.value = false;
  emit("verify", token);
};

const onCapReset = () => {
  currentToken.value = "";
  isDevBypassed.value = false;
  emit("expired");
};

const onCapError = () => {
  if (isDev) {
    currentToken.value = "cap_dev_token";
    isDevBypassed.value = true;
    emit("verify", "cap_dev_token");
    return;
  }
  currentToken.value = "";
  emit("error");
};

onMounted(async () => {
  try {
    await import("cap-widget");
    if (capWidget.value) {
      capWidget.value.addEventListener("solve", onCapSolve);
      capWidget.value.addEventListener("reset", onCapReset);
      capWidget.value.addEventListener("error", onCapError);
    }
  } catch (error) {
    console.error("[cap] Failed to load cap-widget:", error);
  }
});

onUnmounted(() => {
  if (!capWidget.value) {
    return;
  }

  capWidget.value.removeEventListener("solve", onCapSolve);
  capWidget.value.removeEventListener("reset", onCapReset);
  capWidget.value.removeEventListener("error", onCapError);
});

const getValue = (): string => {
  if (capWidget.value) {
    const widget = capWidget.value as unknown as { token?: string; tokenValue?: string };
    return widget.token ?? widget.tokenValue ?? currentToken.value;
  }
  return currentToken.value;
};

const reset = () => {
  currentToken.value = "";
  if (capWidget.value) {
    (capWidget.value as unknown as { reset?: () => void }).reset?.();
  }
};

export interface RecaptchaInstance {
  readonly getValue: () => string;
  readonly reset: () => void;
}

defineExpose<RecaptchaInstance>({ getValue, reset });
</script>

<template>
  <div class="m-0 flex flex-col items-center justify-center p-0 leading-none">
    <cap-widget
      ref="capWidget"
      :data-cap-api-endpoint="activeEndpoint"
      data-cap-hidden-field-name="recaptchaToken"
      class="m-0 block max-w-full p-0 [--cap-border-radius:0.625rem] [--cap-focus-ring:#ea580c] dark:[--cap-background:#1a1a1a] dark:[--cap-border-color:rgb(255_255_255/0.15)] dark:[--cap-color:#fafafa]"
    />
  </div>
</template>

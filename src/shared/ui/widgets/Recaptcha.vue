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

const activeEndpoint = props.endpoint || CAP_API_ENDPOINT || "http://localhost:3000/";
const capWidget = useTemplateRef<HTMLElement>("capWidget");
const currentToken = ref<string>("");

const onCapSolve = (event: Event) => {
  const customEvent = event as CustomEvent<{ token: string }>;
  const token =
    customEvent.detail?.token || (capWidget.value as unknown as { token?: string })?.token || "";
  if (!token) return;
  currentToken.value = token;
  emit("verify", token);
};

const onCapReset = () => {
  currentToken.value = "";
  emit("expired");
};

const onCapError = () => {
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
    return widget.token || widget.tokenValue || currentToken.value;
  }
  return currentToken.value;
};

const reset = () => {
  currentToken.value = "";
  if (capWidget.value) {
    (capWidget.value as unknown as { reset?: () => void })?.reset?.();
  }
};

defineExpose({ getValue, reset });
</script>

<template>
  <div class="m-0 flex items-center justify-center p-0 leading-none">
    <cap-widget
      ref="capWidget"
      :data-cap-api-endpoint="activeEndpoint"
      data-cap-hidden-field-name="recaptchaToken"
      class="cap-theme-adaptive max-w-full"
    />
  </div>
</template>

<style scoped>
.cap-theme-adaptive {
  --cap-border-radius: 0.625rem;
  --cap-focus-ring: #ea580c;
  display: block;
  margin: 0;
  padding: 0;
}

:global(.dark) .cap-theme-adaptive {
  --cap-background: #1a1a1a;
  --cap-border-color: rgba(255, 255, 255, 0.15);
  --cap-color: #fafafa;
}
</style>

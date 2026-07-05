<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Props {
  sitekey: string;
  theme?: "light" | "dark";
  size?: "normal" | "compact";
}

const props = withDefaults(defineProps<Props>(), { theme: "light", size: "normal" });

const emit = defineEmits<{
  (e: "verify", token: string): void;
  (e: "expired"): void;
  (e: "error"): void;
}>();

const container = ref<HTMLElement | null>(null);
let widgetId: number | null = null;

interface ReCaptchaInstance {
  render(container: HTMLElement, options: Record<string, unknown>): number;
  getResponse(widgetId: number): string;
  reset(widgetId: number): void;
}

const getGrecaptcha = (): ReCaptchaInstance | undefined => {
  return (globalThis as typeof globalThis & { grecaptcha?: ReCaptchaInstance }).grecaptcha;
};

// Dynamic loader for the script
const loadRecaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const grecaptcha = getGrecaptcha();
    if (grecaptcha) {
      resolve();
      return;
    }

    // Check if script is already added
    const existing = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existing) {
      // Script is loading, poll for grecaptcha
      const interval = setInterval(() => {
        const gc = getGrecaptcha();
        if (!gc?.render) return;
        clearInterval(interval);
        resolve();
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      // Wait for grecaptcha to be initialized
      const interval = setInterval(() => {
        const gc = getGrecaptcha();
        if (!gc?.render) return;
        clearInterval(interval);
        resolve();
      }, 50);
    });
    script.addEventListener("error", () => reject(new Error("Failed to load reCAPTCHA script")));
    document.head.append(script);
  });
};

const renderRecaptcha = () => {
  const grecaptcha = getGrecaptcha();
  if (!container.value || !grecaptcha) return;

  try {
    widgetId = grecaptcha.render(container.value, {
      sitekey: props.sitekey,
      theme: props.theme,
      size: props.size,
      callback: (token: string) => emit("verify", token),
      "expired-callback": () => emit("expired"),
      "error-callback": () => emit("error"),
    });
  } catch (error) {
    console.error("Error rendering reCAPTCHA:", error);
  }
};

onMounted(async () => {
  try {
    await loadRecaptchaScript();
    // Give a small tick for safety
    setTimeout(renderRecaptcha, 50);
  } catch (error) {
    console.error(error);
  }
});

// Methods exposed to parent via defineExpose
const getValue = (): string => {
  const grecaptcha = getGrecaptcha();
  if (widgetId !== null && grecaptcha) {
    return grecaptcha.getResponse(widgetId);
  }
  return "";
};

const reset = () => {
  const grecaptcha = getGrecaptcha();
  if (widgetId !== null && grecaptcha) {
    grecaptcha.reset(widgetId);
  }
};

defineExpose({ getValue, reset });
</script>

<template>
  <div ref="container"></div>
</template>

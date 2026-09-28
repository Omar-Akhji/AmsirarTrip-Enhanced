<script setup lang="ts">
/**
 * Language Selector with built-in error boundary and loading state. Wraps the actual
 * LanguageSelector to provide graceful degradation.
 */
import { ref, onErrorCaptured, onMounted, onUnmounted } from "vue";

const hasError = ref(false);
const errorMsg = ref("");
const isReady = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

onErrorCaptured((err: unknown) => {
  hasError.value = true;
  errorMsg.value = err instanceof Error ? err.message : "Failed to load";
  console.error("[LanguageSelector] Error:", err);
  return false;
});

onMounted(() => {
  timer = setTimeout(() => {
    isReady.value = true;
  }, 50);
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<template>
  <div>
    <!-- Error fallback -->
    <div
      v-if="hasError"
      class="flex items-center justify-center rounded-full border-2 border-white/60 bg-white/10 px-3 py-2 text-white"
      role="alert"
    >
      <span class="text-xs">EN</span>
    </div>

    <!-- Loading skeleton -->
    <div
      v-else-if="!isReady"
      class="size-11 animate-pulse rounded-full bg-white/20"
      aria-hidden="true"
    />

    <!-- Actual component -->
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, onMounted } from "vue";

interface Props {
  /** Fallback content shown during hydration */
  fallback?: string;
  /** Error message prefix */
  errorPrefix?: string;
}

withDefaults(defineProps<Props>(), {
  fallback: "Loading...",
  errorPrefix: "Component failed to load",
});

const hasError = ref(false);
const errorMessage = ref("");
const isHydrated = ref(false);

onMounted(() => {
  // Give a small delay for hydration to complete
  setTimeout(() => {
    isHydrated.value = true;
  }, 100);
});

// Capture errors from child components
onErrorCaptured((err: Error) => {
  hasError.value = true;
  errorMessage.value = err?.message || "Unknown error";
  console.error("[HydrationBoundary] Captured error:", err);
  return false; // Prevent error propagation
});
</script>

<template>
  <div class="hydration-wrapper">
    <!-- Loading state during hydration -->
    <div
      v-if="!isHydrated"
      class="hydration-loading"
      aria-live="polite"
      aria-busy="true"
    >
      <slot name="loading">
        <div class="flex items-center justify-center p-4">
          <div
            class="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"
            aria-hidden="true"
          />
          <span class="sr-only">{{ fallback }}</span>
        </div>
      </slot>
    </div>

    <!-- Error state -->
    <div
      v-else-if="hasError"
      class="hydration-error rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      role="alert"
    >
      <p class="font-semibold">{{ errorPrefix }}</p>
      <p class="mt-1 text-red-600">{{ errorMessage }}</p>
    </div>

    <!-- Main content slot -->
    <slot v-else />
  </div>
</template>

<style scoped>
.hydration-loading {
  min-height: 2rem;
}

.hydration-error {
  /* Ensures error doesn't break layout */
  max-width: 100%;
  overflow: hidden;
}
</style>

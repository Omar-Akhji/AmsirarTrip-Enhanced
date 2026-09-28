<script setup lang="ts">
/**
 * Error boundary wrapper for Vue components that handles:
 *
 * 1. Loading state during hydration
 * 2. Error state if component fails
 * 3. Graceful degradation
 */
import { ref, onErrorCaptured, onMounted, onUnmounted } from "vue";

interface Props {
  /** Fallback content shown during hydration */
  fallback?: string;
  /** Error message prefix */
  errorPrefix?: string;
  /** Minimum time to show loading state (ms) */
  minLoadingTime?: number;
}

const {
  fallback = "Loading...",
  errorPrefix = "Component Error",
  minLoadingTime = 100,
} = defineProps<Props>();

function reload() {
  globalThis.location.reload();
}

const hasError = ref(false);
const errorMessage = ref("");
const isReady = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

// Capture errors from child components
onErrorCaptured((err: unknown) => {
  hasError.value = true;
  errorMessage.value = err instanceof Error ? err.message : "Unknown error";
  console.error(`[ErrorBoundary] ${errorPrefix}:`, err);
  return false; // Prevent error propagation
});

onMounted(() => {
  // Ensure minimum loading time for smooth UX
  timer = setTimeout(() => {
    isReady.value = true;
  }, minLoadingTime);
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<template>
  <div class="error-boundary">
    <!-- Loading state -->
    <div
      v-if="!isReady"
      class="error-boundary-loading"
      aria-live="polite"
    >
      <slot name="loading">
        <div
          class="flex animate-pulse items-center justify-center rounded-lg bg-light-grey-alt/50 p-4"
        >
          <span class="sr-only">{{ fallback }}</span>
        </div>
      </slot>
    </div>

    <!-- Error state -->
    <div
      v-else-if="hasError"
      class="error-boundary-error"
      role="alert"
    >
      <slot name="error">
        <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
          <p class="font-semibold text-red-800">
            {{ errorPrefix }}
          </p>
          <p class="mt-1 text-red-600">
            {{ errorMessage }}
          </p>
          <button
            type="button"
            class="mt-2 rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
            @click="reload"
          >
            Reload page
          </button>
        </div>
      </slot>
    </div>

    <!-- Main content -->
    <slot v-else />
  </div>
</template>

<style scoped>
.error-boundary-loading,
.error-boundary-error {
  min-height: 2rem;
}

.error-boundary {
  /* Ensure consistent sizing when content loads */
  display: contents;
}
</style>

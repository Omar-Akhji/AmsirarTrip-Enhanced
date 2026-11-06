<script setup lang="ts">
interface Props {
  submitError?: string;
  success?: boolean;
  successMessage?: string;
}

const { submitError, success, successMessage } = defineProps<Props>();
</script>

<template>
  <div
    v-if="submitError"
    class="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900"
    role="alert"
    aria-live="assertive"
  >
    <div class="flex items-start gap-2">
      <svg
        class="mbs-0.5 size-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <line
          x1="12"
          x2="12"
          y1="8"
          y2="12"
        />
        <line
          x1="12"
          x2="12.01"
          y1="16"
          y2="16"
        />
      </svg>
      <span>{{ submitError }}</span>
    </div>
  </div>

  <output
    v-if="success && successMessage"
    class="block rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    aria-live="polite"
    aria-label="Submission status"
  >
    {{ successMessage }}
  </output>
</template>

<script setup lang="ts">
interface Props {
  submitError?: string;
  success?: boolean;
  successMessage?: string;
}

defineProps<Props>();
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
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ submitError }}</span>
    </div>
  </div>

  <output
    v-if="success && successMessage"
    class="block rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    aria-live="polite"
  >
    {{ successMessage }}
  </output>
</template>

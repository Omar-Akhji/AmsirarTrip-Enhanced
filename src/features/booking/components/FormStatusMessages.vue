<script setup lang="ts">
import { CircleAlert } from "lucide-vue-next";

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
      <CircleAlert class="mbs-0.5 size-5 shrink-0" />
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

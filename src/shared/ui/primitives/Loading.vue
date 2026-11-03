<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: "sm" | "md" | "lg";
}

const { size = "md" } = defineProps<Props>();

const sizeClass = computed(() => {
  if (size === "sm") {
    return "size-4 border-2";
  }
  return size === "lg" ? "size-12 border-4" : "size-8 border-3";
});
</script>

<template>
  <output
    class="animate-spin rounded-full border-orange-500 border-t-transparent"
    :class="[sizeClass]"
    aria-label="Loading"
  >
    <span class="sr-only">Loading…</span>
  </output>
</template>

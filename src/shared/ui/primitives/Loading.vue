<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: "sm" | "md" | "lg";
  variant?: "orange" | "white";
}

const { size = "md", variant = "orange" } = defineProps<Props>();

const sizeClass = computed(() => {
  if (size === "sm") {
    return "size-4 border-2";
  }
  return size === "lg" ? "size-12 border-4" : "size-8 border-3";
});

const variantClass = computed(() =>
  variant === "white" ?
    "border-white border-t-transparent"
  : "border-orange-500 border-t-transparent",
);
</script>

<template>
  <output
    class="animate-spin rounded-full"
    :class="[sizeClass, variantClass]"
    aria-label="Loading"
  >
    <span class="sr-only">Loading…</span>
  </output>
</template>

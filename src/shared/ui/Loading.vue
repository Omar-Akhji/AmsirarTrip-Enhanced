<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), { size: "md" });

const sizeClass = computed(() => {
  if (props.size === "sm") {
    return "size-4 border-2";
  }
  if (props.size === "lg") {
    return "size-12 border-4";
  }
  return "size-8 border-3";
});
</script>

<template>
  <output
    :class="[sizeClass, 'animate-spin rounded-full border-orange-500 border-t-transparent']"
    aria-label="Loading"
  >
    <span class="sr-only">Loading…</span>
  </output>
</template>

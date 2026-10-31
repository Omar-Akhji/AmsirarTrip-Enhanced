<script setup lang="ts">
import { computed, type StyleValue } from "vue";

interface Props {
  readonly src: string;
  readonly alt: string;
  readonly fill?: boolean;
  readonly quality?: number;
  readonly priority?: boolean;
  readonly sizes?: string;
  readonly decoding?: "async" | "sync" | "auto";
  readonly fetchpriority?: "high" | "low" | "auto";
  readonly loading?: "lazy" | "eager";
  readonly style?: StyleValue;
}

const {
  src,
  alt,
  fill = false,
  priority = false,
  sizes,
  decoding = "async",
  fetchpriority,
  loading,
  style,
} = defineProps<Props>();

const computedDecoding = computed(() => decoding);
const computedFetchPriority = computed(() => fetchpriority ?? (priority ? "high" : undefined));
const computedLoading = computed(() => loading ?? (priority ? "eager" : "lazy"));
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    :class="fill ? 'absolute inset-0 size-full' : undefined"
    :style="style"
    :decoding="computedDecoding"
    :fetchpriority="computedFetchPriority"
    :loading="computedLoading"
    :sizes="sizes"
  />
</template>

<script setup lang="ts">
import { computed, type StyleValue } from "vue";

interface Props {
  src: string;
  alt: string;
  fill?: boolean;
  quality?: number;
  priority?: boolean;
  sizes?: string;
  decoding?: "async" | "sync" | "auto";
  fetchpriority?: "high" | "low" | "auto";
  loading?: "lazy" | "eager";
  style?: StyleValue;
}

const {
  src,
  alt,
  fill = false,
  priority = false,
  sizes,
  decoding,
  fetchpriority,
  loading,
  style,
} = defineProps<Props>();

const imageStyle = computed<StyleValue>(() => {
  const fillStyle =
    fill ?
      { position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0 }
    : {};

  if (Array.isArray(style)) {
    return [fillStyle, ...style] as StyleValue;
  }
  return typeof style === "string" ?
      ([fillStyle, style] as StyleValue)
    : ({ ...fillStyle, ...style } as StyleValue);
});

const computedDecoding = computed(() => decoding ?? "async");
const computedFetchPriority = computed(() => fetchpriority ?? (priority ? "high" : undefined));
const computedLoading = computed(() => loading ?? (priority ? "eager" : "lazy"));
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    :style="imageStyle"
    :decoding="computedDecoding"
    :fetchpriority="computedFetchPriority"
    :loading="computedLoading"
    :sizes="sizes"
  />
</template>

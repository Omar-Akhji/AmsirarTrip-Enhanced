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

const imageStyle = computed<StyleValue>(() => {
  const fillStyle =
    fill ?
      { position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0 }
    : {};

  if (Array.isArray(style)) {
    return [fillStyle, ...style];
  }
  return typeof style === "string" ?
      [fillStyle, style]
    : { ...fillStyle, ...(typeof style === "object" && style !== null && style) };
});

const computedDecoding = computed(() => decoding);
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

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

const props = withDefaults(defineProps<Props>(), { fill: false, priority: false });

const imageStyle = computed<StyleValue>(() => {
  const fillStyle =
    props.fill ?
      { position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0 }
    : {};

  if (Array.isArray(props.style)) {
    return [fillStyle, ...props.style] as StyleValue;
  }
  if (typeof props.style === "string") {
    return [fillStyle, props.style] as StyleValue;
  }
  return { ...fillStyle, ...props.style } as StyleValue;
});

const computedDecoding = computed(() => props.decoding ?? "async");
const computedFetchPriority = computed(
  () => props.fetchpriority ?? (props.priority ? "high" : undefined),
);
const computedLoading = computed(() => props.loading ?? (props.priority ? "eager" : "lazy"));
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

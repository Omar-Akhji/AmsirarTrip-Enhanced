<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
import { asciiSkeletonHTML, type SkeletonSpec, type SkeletonVariant } from "ascii-reveal/core";

interface Props {
  variant?: SkeletonVariant;
  lines?: number;
  widths?: (string | number)[];
  rows?: number;
  seed?: number;
  animate?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "dither",
  animate: true,
  seed: () => Math.floor(Math.random() * 100_000),
  class: "",
});

const html = computed(() => {
  const spec: SkeletonSpec = {
    variant: props.variant,
    seed: props.seed,
    animate: props.animate,
    css: false,
    ...(props.lines !== undefined && { lines: props.lines }),
    ...(props.widths !== undefined && { widths: props.widths }),
    ...(props.rows !== undefined && { rows: props.rows }),
  };

  const rawHtml = asciiSkeletonHTML(spec);

  return props.class ?
      rawHtml.replace('class="ars ', () => `class="ars ${cn(props.class)} `)
    : rawHtml;
});
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span
    class="contents"
    v-html="html"
  />
</template>

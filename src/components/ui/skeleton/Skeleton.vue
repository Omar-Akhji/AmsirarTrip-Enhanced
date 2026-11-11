<script setup lang="ts">
import { computed } from "vue";

defineOptions({ inheritAttrs: false });

const props = defineProps<{ class?: string }>();
const hasCustomRadius = computed(() => Boolean(props.class && /\brounded-/.test(props.class)));
</script>

<template>
  <div
    aria-hidden="true"
    class="animate-pulse bg-stone-200/80 motion-reduce:animate-none dark:bg-stone-800/80"
    :class="[hasCustomRadius ? '' : 'rounded-md', props.class]"
    v-bind="$attrs"
  />
</template>

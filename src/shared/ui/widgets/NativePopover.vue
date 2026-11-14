<script setup lang="ts">
import { ref, watch, useId, nextTick, useTemplateRef } from "vue";

interface Props {
  isOpen: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

const { isOpen, className = "", id = "", ariaLabel } = defineProps<Props>();

const emit = defineEmits<{ "update:isOpen": [value: boolean] }>();

const generatedId = useId().replaceAll(":", "");
const popoverId = id || generatedId;

const popoverRef = useTemplateRef<HTMLDialogElement>("popoverRef");
const isLocallyOpen = ref(isOpen);

const isPopoverOpen = (el: HTMLElement) => {
  try {
    return el.matches(":popover-open");
  } catch {
    return false;
  }
};

// Sync browser popover state -> parent (including light-dismiss)
const handleToggle = (event: Event): void => {
  const toggleEvent = event as ToggleEvent;
  const isOpenNow = toggleEvent.newState === "open";
  isLocallyOpen.value = isOpenNow;
  if (isOpenNow !== isOpen) {
    emit("update:isOpen", isOpenNow);
  }
  if (!isOpenNow) return;

  void nextTick(() => {
    const target = popoverRef.value;
    if (!target) return;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    target.querySelector<HTMLElement>(focusableSelector)?.focus();
  });
};

watch(
  () => isOpen,
  (newOpen) => {
    isLocallyOpen.value = newOpen;

    const popover = popoverRef.value;
    if (!popover || typeof popover.showPopover !== "function") return;

    try {
      const currentlyOpen = isPopoverOpen(popover);
      if (newOpen && !currentlyOpen) {
        popover.showPopover();
      } else if (!newOpen && currentlyOpen) {
        popover.hidePopover();
      }
    } catch {
      // ignore
    }
  },
);
</script>

<template>
  <div class="relative block inline-full">
    <button
      type="button"
      :popovertarget="popoverId"
      popovertargetaction="toggle"
      class="group block cursor-pointer rounded-xl border-none bg-transparent p-0 text-start inline-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
      :style="{ anchorName: `--popover-trigger-${popoverId}` }"
      :aria-expanded="isOpen || isLocallyOpen"
      :aria-controls="popoverId"
      :aria-label="ariaLabel"
    >
      <slot name="trigger" />
    </button>

    <dialog
      :id="popoverId"
      ref="popoverRef"
      popover="auto"
      :aria-label="ariaLabel || 'Popover dialog'"
      class="fixed inset-0 z-50 m-auto border-none bg-transparent p-0 outline-hidden max-inline-[calc(100vw-2rem)] backdrop:bg-black/20 supports-[top:anchor(bottom)]:inset-auto supports-[top:anchor(bottom)]:top-[calc(anchor(bottom)+8px)] supports-[top:anchor(bottom)]:left-[anchor(left)] supports-[top:anchor(bottom)]:m-0 supports-[top:anchor(bottom)]:[position-try-fallbacks:flip-block,flip-inline]"
      :style="{ positionAnchor: `--popover-trigger-${popoverId}` }"
      :class="[className]"
      @toggle="handleToggle"
    >
      <div
        v-if="isOpen || isLocallyOpen"
        class="animate-fade-in-scale"
      >
        <slot />
      </div>
    </dialog>
  </div>
</template>

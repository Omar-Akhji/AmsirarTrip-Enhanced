<script setup lang="ts">
/* eslint-disable unicorn/prefer-observer-apis */
import { ref, watch, onMounted, onUnmounted, useId, nextTick, useTemplateRef } from "vue";

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
let focusTimer: ReturnType<typeof setTimeout> | null = null;

const isPopoverOpen = (el: HTMLElement) => {
  try {
    return el.matches(":popover-open");
  } catch {
    return false;
  }
};

const positionPopover = () => {
  const popover = popoverRef.value;
  if (!popover) return;
  if (typeof popover.matches === "function" && !isPopoverOpen(popover)) return;

  const triggerElement = popover.previousElementSibling as HTMLElement | null;
  if (!triggerElement) return;

  const triggerRect = triggerElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = triggerRect.bottom + 8;
  let left = triggerRect.left;

  const popoverRect = popover.getBoundingClientRect();
  const popoverWidth = popoverRect.width || 340;
  const popoverHeight = popoverRect.height || 400;

  if (left + popoverWidth > viewportWidth) {
    left = Math.max(8, viewportWidth - popoverWidth - 16);
  }

  if (top + popoverHeight > viewportHeight && triggerRect.top > popoverHeight) {
    top = triggerRect.top - popoverHeight - 8;
  }

  Object.assign(popover.style, {
    position: "fixed",
    margin: "0",
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
  });
};

// Focus trap
const handleKeyDown = (event: KeyboardEvent) => {
  if (!(isOpen || isLocallyOpen.value) || event.key !== "Tab") return;

  const popover = popoverRef.value;
  if (!popover) return;

  const focusableSelector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusableElements = popover.querySelectorAll<HTMLElement>(focusableSelector);
  if (focusableElements.length === 0) return;

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable?.focus();
    }
  } else if (document.activeElement === lastFocusable) {
    event.preventDefault();
    firstFocusable?.focus();
  }
};

// Sync browser popover state → parent (e.g. on light-dismiss)
const handleToggle = async (event: Event) => {
  const toggleEvent = event as ToggleEvent;
  const isOpennow = toggleEvent.newState === "open";
  isLocallyOpen.value = isOpennow;
  if (isOpennow !== isOpen) {
    emit("update:isOpen", isOpennow);
  }
  await nextTick();
  if (isOpennow) {
    positionPopover();
  }
};

// Handle trigger click reliably
const handleTriggerClick = (event: MouseEvent) => {
  event.preventDefault();
  const willOpen = !(isOpen || isLocallyOpen.value);
  isLocallyOpen.value = willOpen;
  emit("update:isOpen", willOpen);

  const popover = popoverRef.value;
  if (!popover || typeof popover.showPopover !== "function") return;

  try {
    if (willOpen) {
      if (!isPopoverOpen(popover)) {
        popover.showPopover();
      }
      void nextTick(() => {
        positionPopover();
      });
    } else if (isPopoverOpen(popover)) {
      popover.hidePopover();
    }
  } catch {
    // ignore
  }
};

// Focus + resize/scroll listeners
watch(
  () => isOpen,
  async (newOpen) => {
    isLocallyOpen.value = newOpen;
    if (focusTimer) {
      clearTimeout(focusTimer);
      focusTimer = null;
    }

    const popover = popoverRef.value;
    if (popover && typeof popover.showPopover === "function") {
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
    }

    if (newOpen) {
      await nextTick();
      positionPopover();
      focusTimer = setTimeout(() => {
        const target = popoverRef.value;
        if (!target) return;
        const focusableSelector =
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
        const first = target.querySelector<HTMLElement>(focusableSelector);
        first?.focus();
      }, 50);
      window.addEventListener("resize", positionPopover, { passive: true });
      window.addEventListener("scroll", positionPopover, { capture: true, passive: true });
    } else {
      window.removeEventListener("resize", positionPopover);
      window.removeEventListener("scroll", positionPopover, { capture: true });
    }
  },
);

onMounted(() => {
  popoverRef.value?.addEventListener("toggle", handleToggle);
  popoverRef.value?.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  if (focusTimer) {
    clearTimeout(focusTimer);
  }
  popoverRef.value?.removeEventListener("toggle", handleToggle);
  popoverRef.value?.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("resize", positionPopover);
  window.removeEventListener("scroll", positionPopover, { capture: true });
});
</script>

<template>
  <div class="relative block inline-full">
    <button
      type="button"
      :popovertarget="popoverId"
      popovertargetaction="toggle"
      class="group block cursor-pointer rounded-xl border-none bg-transparent p-0 text-start inline-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
      :aria-expanded="isOpen || isLocallyOpen"
      :aria-controls="popoverId"
      :aria-label="ariaLabel"
      @click="handleTriggerClick"
    >
      <slot name="trigger" />
    </button>

    <dialog
      :id="popoverId"
      ref="popoverRef"
      popover="auto"
      aria-modal="true"
      :aria-label="ariaLabel || 'Popover dialog'"
      class="fixed inset-auto m-0 border-none bg-transparent p-0 outline-hidden backdrop:bg-black/20"
      :class="[className]"
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

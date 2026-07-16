<script setup lang="ts">
/* eslint-disable unicorn/prefer-observer-apis */
import { ref, watch, onMounted, onUnmounted, useId, nextTick, computed } from "vue";

interface Props {
  isOpen: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), { id: "", className: "" });

interface Emits {
  (e: "update:isOpen", value: boolean): void;
}

const emit = defineEmits<Emits>();

const generatedId = useId().replaceAll(":", "");
const popoverId = props.id || generatedId;

const popoverRef = ref<HTMLDialogElement | null>(null);

const positionPopover = () => {
  const popover = popoverRef.value;
  if (!popover || !props.isOpen) return;

  const triggerElement = popover.previousElementSibling as HTMLElement | null;
  if (!triggerElement) return;

  const triggerRect = triggerElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = triggerRect.bottom + 8;
  let left = triggerRect.left;

  const popoverWidth = 340;
  const popoverHeight = 400;

  if (left + popoverWidth > viewportWidth) {
    left = Math.max(8, viewportWidth - popoverWidth - 16);
  }

  if (top + popoverHeight > viewportHeight && triggerRect.top > popoverHeight) {
    top = triggerRect.top - popoverHeight - 8;
  }

  Object.assign(popover.style, {
    position: "fixed",
    margin: "0",
    top: `${top}px`,
    left: `${left}px`,
  });
};

// Focus trap
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.isOpen || event.key !== "Tab") return;

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
  } else {
    if (document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable?.focus();
    }
  }
};

// Sync browser popover state → parent
const handleToggle = async (event: Event) => {
  const toggleEvent = event as ToggleEvent;
  const isOpennow = toggleEvent.newState === "open";
  emit("update:isOpen", isOpennow);
  await nextTick();
  if (isOpennow) {
    positionPopover();
  }
};

// Focus + resize/scroll listeners
watch(
  () => props.isOpen,
  (newOpen) => {
    if (newOpen) {
      setTimeout(() => {
        const popover = popoverRef.value;
        if (!popover) return;
        const focusableSelector =
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
        const first = popover.querySelector<HTMLElement>(focusableSelector);
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
  popoverRef.value?.removeEventListener("toggle", handleToggle);
  popoverRef.value?.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("resize", positionPopover);
  window.removeEventListener("scroll", positionPopover, { capture: true });
});

const labelledBy = computed(() => (props.ariaLabel ? undefined : popoverId));
</script>

<template>
  <div class="relative inline-block inline-full">
    <button
      type="button"
      command="toggle-popover"
      :commandfor="popoverId"
      class="cursor-pointer border-none bg-transparent p-0 inline-full"
      :aria-expanded="isOpen"
      :aria-controls="popoverId"
    >
      <slot name="trigger" />
    </button>

    <dialog
      :id="popoverId"
      ref="popoverRef"
      popover="auto"
      aria-modal="true"
      :aria-label="ariaLabel"
      :aria-labelledby="labelledBy ? popoverId : undefined"
      :class="[
        'fixed inset-auto m-0 border-none p-0 outline-hidden backdrop:bg-black/20',
        className,
      ]"
    >
      <div
        v-if="isOpen"
        class="animate-in fade-in zoom-in-95 duration-200"
      >
        <slot />
      </div>
    </dialog>
  </div>
</template>

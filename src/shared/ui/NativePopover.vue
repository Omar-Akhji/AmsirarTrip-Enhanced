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
const triggerRef = ref<HTMLButtonElement | null>(null);

const positionPopover = () => {
  const popover = popoverRef.value;
  const triggerElement = triggerRef.value;
  if (!popover || !triggerElement || !props.isOpen) return;

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

watch(
  () => props.isOpen,
  async (newOpen) => {
    await nextTick();
    const popover = popoverRef.value;
    if (!popover) return;

    if (newOpen) {
      try {
        if (!popover.matches(":popover-open")) {
          popover.showPopover();
          positionPopover();
        }
      } catch (error) {
        console.warn("Popover error:", error);
      }
    } else {
      try {
        if (popover.matches(":popover-open")) {
          popover.hidePopover();
        }
      } catch {}
    }
  },
);

// Toggle listener
const handleToggle = (event: Event) => {
  const toggleEvent = event as ToggleEvent;
  const isNewState = toggleEvent.newState === "open";
  if (isNewState !== props.isOpen) {
    emit("update:isOpen", isNewState);
  }
};

// Keyboard listener for focus trap
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

const setupFocus = () => {
  const popover = popoverRef.value;
  if (!popover) return;

  const focusableSelector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusableElements = popover.querySelectorAll<HTMLElement>(focusableSelector);
  const firstFocusable = focusableElements[0];
  firstFocusable?.focus();
};

watch(
  () => props.isOpen,
  (newOpen) => {
    if (newOpen) {
      setTimeout(() => {
        setupFocus();
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
  const popover = popoverRef.value;
  if (popover) {
    popover.addEventListener("toggle", handleToggle);
    popover.addEventListener("keydown", handleKeyDown);
  }
});

onUnmounted(() => {
  const popover = popoverRef.value;
  if (popover) {
    popover.removeEventListener("toggle", handleToggle);
    popover.removeEventListener("keydown", handleKeyDown);
  }
  window.removeEventListener("resize", positionPopover);
  window.removeEventListener("scroll", positionPopover, { capture: true });
});

const labelledBy = computed(() => (props.ariaLabel ? undefined : popoverId));
</script>

<template>
  <div class="relative inline-block inline-full">
    <button
      ref="triggerRef"
      type="button"
      class="cursor-pointer border-none bg-transparent p-0 inline-full"
      :aria-expanded="isOpen"
      :aria-controls="popoverId"
      @click="emit('update:isOpen', !isOpen)"
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
        'fixed inset-auto m-0 border-none bg-transparent p-0 outline-hidden backdrop:bg-black/20',
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

<script setup lang="ts">
import { computed, nextTick, ref, useId, useTemplateRef } from "vue";
import type { ContactFormCopy, ContactTopicOption } from "@/lib/form-copy";
import type { FormState } from "@/lib/form-types";
import PhoneInput from "@/shared/ui/widgets/PhoneInput.vue";

interface Props {
  copy: ContactFormCopy;
  locale?: string;
  state: FormState | null;
}

const { copy, locale = "en", state } = defineProps<Props>();

const topicPopoverId = `topic-popover-${useId().replaceAll(":", "")}`;
const topicPopoverRef = useTemplateRef<HTMLElement>("topicPopoverRef");
const customTopicInputRef = useTemplateRef<HTMLInputElement>("customTopicInputRef");

const selectedTopic = ref("");
const customTopic = ref("");

const isOtherSelected = computed(() =>
  copy.topics.some((topic) => Boolean(topic.isOther) && topic.label === selectedTopic.value),
);

const submittedTopic = computed(() =>
  isOtherSelected.value ? customTopic.value.trim() || selectedTopic.value : selectedTopic.value,
);

function chooseTopic(option: ContactTopicOption): void {
  selectedTopic.value = option.label;
  topicPopoverRef.value?.hidePopover();
  if (option.isOther) {
    void nextTick(() => customTopicInputRef.value?.focus());
  }
}

function handleListboxKeydown(event: KeyboardEvent): void {
  const buttons = [
    ...(topicPopoverRef.value?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []),
  ];
  if (buttons.length === 0) return;

  const activeIdx = buttons.indexOf(document.activeElement as HTMLButtonElement);
  switch (event.key) {
    case "ArrowDown": {
      event.preventDefault();
      buttons[(activeIdx + 1) % buttons.length]?.focus();
      break;
    }
    case "ArrowUp": {
      event.preventDefault();
      buttons[(activeIdx - 1 + buttons.length) % buttons.length]?.focus();
      break;
    }
    case "End": {
      event.preventDefault();
      buttons.at(-1)?.focus();
      break;
    }
    case "Home": {
      event.preventDefault();
      buttons[0]?.focus();
      break;
    }
    default: {
      break;
    }
  }
}
</script>

<template>
  <fieldset class="m-0 flex flex-col gap-5 border-0 p-0">
    <legend class="sr-only">
      {{ copy.details }}
    </legend>
    <div class="grid gap-5 md:grid-cols-2">
      <div class="min-w-0">
        <label
          for="contact-name"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-stone-300"
        >
          {{ copy.name }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <div class="group relative">
          <svg
            class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500 dark:text-stone-500"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="6"
              r="4"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <input
            id="contact-name"
            name="name"
            type="text"
            class="h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full placeholder:text-stone-400 user-invalid:border-red-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden user-invalid:focus:ring-red-400/20 dark:border-white/10 dark:bg-white/5 dark:text-mist-100 dark:placeholder:text-mist-500 dark:focus:border-orange-500 dark:focus:bg-white/10"
            :placeholder="copy.namePlaceholder"
            :minlength="2"
            :maxlength="100"
            toolparamdescription="The full name of the contact person"
            autocomplete="name"
            required
            :aria-invalid="state?.errors?.['name'] ? 'true' : 'false'"
            :aria-describedby="state?.errors?.['name'] ? 'name-error' : undefined"
          />
        </div>
        <p
          v-if="state?.errors?.['name']"
          id="name-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors["name"] }}
        </p>
      </div>

      <div class="min-w-0">
        <label
          for="contact-email"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-stone-300"
        >
          {{ copy.email }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <div class="group relative">
          <svg
            class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500 dark:text-stone-500"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C21.4816 5.82475 21.7706 6.69989 21.8985 8"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M18 8L15.8411 9.79908C14.0045 11.3296 13.0861 12.0949 12 12.0949C11.3507 12.0949 10.7614 11.8214 10 11.2744M6 8L6.9 8.75L7.8 9.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <input
            id="contact-email"
            name="email"
            type="email"
            class="h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full placeholder:text-stone-400 user-invalid:border-red-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden user-invalid:focus:ring-red-400/20 dark:border-white/10 dark:bg-white/5 dark:text-mist-100 dark:placeholder:text-mist-500 dark:focus:border-orange-500 dark:focus:bg-white/10"
            :placeholder="copy.emailPlaceholder"
            :maxlength="254"
            toolparamdescription="The email address of the contact person"
            autocomplete="email"
            required
            :aria-invalid="state?.errors?.['email'] ? 'true' : 'false'"
            :aria-describedby="state?.errors?.['email'] ? 'email-error' : undefined"
          />
        </div>
        <p
          v-if="state?.errors?.['email']"
          id="email-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors["email"] }}
        </p>
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <div class="min-w-0">
        <label
          for="contact-phone"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-stone-300"
        >
          {{ copy.phone }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <PhoneInput
          id="contact-phone"
          name="phone"
          :labels="copy.phoneLabels"
          :locale="locale"
          :placeholder="copy.phonePlaceholder"
          toolparamdescription="The phone/WhatsApp number of the contact person"
          :aria-invalid="state?.errors?.['phone'] ? 'true' : 'false'"
          :aria-describedby="state?.errors?.['phone'] ? 'phone-error' : undefined"
          required
        />
        <p
          v-if="state?.errors?.['phone']"
          id="phone-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors["phone"] }}
        </p>
      </div>

      <div class="min-w-0">
        <label
          for="contact-topic"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-stone-300"
        >
          {{ copy.topic }}
        </label>
        <div class="group relative [anchor-scope:--contact-topic]">
          <svg
            class="pointer-events-none absolute inset-s-3.5 top-1/2 z-10 size-4.5 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500 group-has-[:popover-open]:text-orange-500 dark:text-stone-500"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M13.024 14.5601C10.7142 15.484 9.5593 15.946 8.89964 15.4977C8.74324 15.3914 8.60834 15.2565 8.50206 15.1001C8.0538 14.4405 8.51575 13.2856 9.43967 10.9758C9.63673 10.4831 9.73527 10.2368 9.90474 10.0435C9.94792 9.99429 9.99429 9.94792 10.0435 9.90474C10.2368 9.73527 10.4831 9.63673 10.9758 9.43966C13.2856 8.51575 14.4405 8.0538 15.1001 8.50206C15.2565 8.60834 15.3914 8.74324 15.4977 8.89964C15.946 9.5593 15.484 10.7142 14.5601 13.024C14.363 13.5166 14.2645 13.763 14.095 13.9562C14.0518 14.0055 14.0055 14.0518 13.9562 14.095C13.763 14.2645 13.5166 14.363 13.024 14.5601Z"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>

          <input
            type="hidden"
            name="topic"
            :value="submittedTopic"
            toolparamdescription="The specific enquiry type, e.g., book a tour, plan a custom route, existing booking"
          />

          <button
            id="contact-topic"
            type="button"
            :popovertarget="topicPopoverId"
            popovertargetaction="toggle"
            :aria-controls="topicPopoverId"
            aria-haspopup="listbox"
            class="flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-stone-200/90 bg-stone-50/50 ps-10.5 pe-3.5 text-start font-sans text-sm transition-colors [anchor-name:--contact-topic] group-has-[:popover-open]:border-orange-500 group-has-[:popover-open]:bg-white group-has-[:popover-open]:ring-2 group-has-[:popover-open]:ring-orange-500/20 hover:bg-stone-100/70 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:group-has-[:popover-open]:border-orange-500 dark:group-has-[:popover-open]:bg-white/10 dark:hover:bg-white/10 dark:focus:border-orange-500 dark:focus:bg-white/10"
            :class="
              selectedTopic ?
                'text-stone-900 dark:text-mist-100'
              : 'text-stone-600 dark:text-mist-300'
            "
          >
            <span class="truncate">
              {{ selectedTopic || copy.topicPlaceholder }}
            </span>
            <svg
              class="size-3.5 shrink-0 text-stone-400 transition-colors group-has-[:popover-open]:text-stone-700 dark:text-mist-400 dark:group-has-[:popover-open]:text-mist-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              aria-hidden="true"
            >
              <path
                d="M13.5 19.5L12 21L6 15M16.5 16.5L18 15M13.5 4.5L12 3L6 9M16.5 7.5L18 9"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <div
            :id="topicPopoverId"
            ref="topicPopoverRef"
            popover="auto"
            class="fixed inset-0 z-50 m-auto w-[min(24rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-stone-200/90 bg-white p-0 text-stone-900 opacity-0 shadow-xl shadow-stone-900/10 transition-[opacity,transform,display,overlay] transition-discrete duration-200 [position-anchor:--contact-topic] backdrop:bg-black/20 open:opacity-100 supports-[top:anchor(bottom)]:inset-auto supports-[top:anchor(bottom)]:top-[calc(anchor(bottom)+6px)] supports-[top:anchor(bottom)]:left-[anchor(left)] supports-[top:anchor(bottom)]:m-0 supports-[top:anchor(bottom)]:[position-try-fallbacks:flip-block,flip-inline] supports-[top:anchor(bottom)]:backdrop:bg-transparent supports-[width:anchor-size(width)]:w-[anchor-size(width)] dark:border-white/10 dark:bg-surface-card dark:text-mist-100 dark:shadow-[0_16px_40px_rgba(0,0,0,0.65)] starting:open:opacity-0"
          >
            <div
              class="flex flex-col px-(--scrollbar-space) py-1 [--scrollbar-space:8px] [--scrollbar-theme:hsl(0deg_0%_75%)]"
            >
              <div
                role="listbox"
                tabindex="-1"
                :aria-label="copy.topic"
                class="max-h-48 divide-y divide-stone-100/60 overflow-x-hidden overflow-y-auto overscroll-y-contain pe-(--scrollbar-space) supports-[-moz-appearance:none]:scrollbar-thin supports-[-moz-appearance:none]:[scrollbar-color:color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_28%)_transparent] dark:divide-white/5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0 [&::-webkit-scrollbar-thumb]:rounded-[1000px] [&::-webkit-scrollbar-thumb]:bg-[color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_28%)] [&::-webkit-scrollbar-thumb:hover]:bg-[color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_12%)] [&::-webkit-scrollbar-track]:my-2.5 [&::-webkit-scrollbar-track]:rounded-[1000px] [&::-webkit-scrollbar-track]:bg-[color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_82%)] [&::-webkit-scrollbar-track]:bg-clip-padding"
                @keydown="handleListboxKeydown"
              >
                <button
                  v-for="option in copy.topics"
                  :key="option.label"
                  type="button"
                  role="option"
                  :aria-selected="selectedTopic === option.label"
                  class="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-none px-3 py-2.5 text-start font-sans text-xs/snug wrap-break-word text-stone-800 transition-colors hover:bg-stone-100 focus:bg-stone-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset active:bg-stone-200/70 aria-selected:bg-stone-100 aria-selected:font-medium aria-selected:text-stone-900 dark:text-mist-200 dark:hover:bg-white/5 dark:focus:bg-white/5 dark:aria-selected:bg-white/10 dark:aria-selected:text-mist-100"
                  @click="chooseTopic(option)"
                >
                  <span>{{ option.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <input
          v-if="isOtherSelected"
          id="contact-custom-topic"
          ref="customTopicInputRef"
          v-model="customTopic"
          type="text"
          autocomplete="off"
          :maxlength="120"
          :placeholder="copy.customTopicPlaceholder"
          :aria-label="copy.customTopicPlaceholder"
          class="mbs-2.5 h-12 w-full rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 font-sans text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:text-mist-100 dark:placeholder:text-mist-500 dark:focus:border-orange-500 dark:focus:bg-white/10"
        />
      </div>
    </div>

    <div>
      <label
        for="contact-message"
        class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-stone-300"
      >
        {{ copy.message }}
        <span
          class="text-orange-600"
          aria-hidden="true"
          >*</span
        >
      </label>
      <div class="group relative">
        <svg
          class="pointer-events-none absolute inset-s-3.5 top-3.5 size-4.5 text-stone-400 transition-colors group-focus-within:text-orange-500 dark:text-stone-500"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 12H9M16 12H12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M16 8H15M12 8H8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M8 16H13"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M3 14V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C20.4816 3.82476 20.7706 4.69989 20.8985 6M21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3.51839 20.1752 3.22937 19.3001 3.10149 18"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <textarea
          id="contact-message"
          name="message"
          class="field-sizing-content overflow-auto rounded-xl border border-stone-200/90 bg-stone-50/50 py-3 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full max-block-80 min-block-40 placeholder:text-stone-400 user-invalid:border-red-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden user-invalid:focus:ring-red-400/20 dark:border-white/10 dark:bg-white/5 dark:text-mist-100 dark:placeholder:text-mist-500 dark:focus:border-orange-500 dark:focus:bg-white/10"
          :placeholder="copy.messagePlaceholder"
          :minlength="10"
          :maxlength="1000"
          toolparamdescription="The detailed message or description of the custom Morocco itinerary/dream tour request"
          autocomplete="off"
          required
          :aria-invalid="state?.errors?.['message'] ? 'true' : 'false'"
          :aria-describedby="state?.errors?.['message'] ? 'message-error' : undefined"
        />
      </div>
      <p
        v-if="state?.errors?.['message']"
        id="message-error"
        class="mbs-1 font-sans text-xs text-red-600"
      >
        {{ state.errors["message"] }}
      </p>
    </div>
  </fieldset>
</template>

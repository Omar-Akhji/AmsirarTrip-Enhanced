<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { actions } from "astro:actions";
import type { BookingFormCopy } from "@/lib/form-copy";
import type { FormState } from "@/lib/form-types";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { TurnstileInstance } from "@/lib/turnstile-client";
import FormSubmitButton from "@/shared/ui/widgets/FormSubmitButton.vue";
import Turnstile from "@/shared/ui/widgets/Turnstile.vue";
import BookingPersonalFields from "./BookingPersonalFields.vue";
import BookingTripDetails from "./BookingTripDetails.vue";

interface Props {
  actionUrl?: string;
  copy: BookingFormCopy;
  excursionId?: string;
  excursionTitle?: string;
  initialState?: FormState | null;
  locale: string;
  tourDuration?: number | null;
  tourId?: string;
  tourTitle?: string;
}

const {
  actionUrl,
  copy,
  excursionTitle = "",
  initialState = null,
  locale,
  tourDuration = null,
  tourTitle = "",
} = defineProps<Props>();

const recaptchaRef = useTemplateRef<TurnstileInstance>("recaptchaRef");
const selectedTour = computed(() => tourTitle || excursionTitle);

const { feedback, formKey, handleSubmit, isMounted, isSubmitting, state } = useActionForm({
  action: actions.booking,
  debounceMs: 0,
  getMessages: () => ({
    captchaError: copy.captchaError,
    genericError: copy.genericError,
    success: copy.success,
    validationError: copy.validationError,
  }),
  initialState,
  recaptchaRef,
  requiredTrimmedFields: ["fullName", "email"],
});
</script>

<template>
  <section
    id="booking"
    aria-labelledby="booking-heading"
    class="relative isolate overflow-x-clip border-bs border-stone-200 bg-stone-50 py-12 sm:py-16 lg:py-24 dark:border-white/10 dark:bg-surface-base"
  >
    <div
      class="mx-auto px-2 inline-full max-inline-7xl sm:px-6 lg:px-8 2xl:max-inline-360 3xl:max-inline-420"
    >
      <div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-golden lg:gap-6 xl:gap-8">
        <div
          class="inline-full"
          data-scroll-split="start"
        >
          <div
            class="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs block-full sm:p-8 dark:border-white/10 dark:bg-surface-card/90 dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          >
            <div class="mbe-6 border-be border-stone-100 pbe-5 dark:border-white/10">
              <span
                class="font-mono text-xs font-semibold tracking-[0.14em] text-orange-600 uppercase dark:text-orange"
              >
                {{ copy.badge }}
              </span>
              <h3
                id="booking-heading"
                class="mbs-1 text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-mist-100"
              >
                {{ copy.makeReservation }}
              </h3>
            </div>

            <form
              :action="actionUrl"
              class="flex flex-col gap-5"
              data-form="booking"
              :data-hydrated="isMounted"
              method="POST"
              toolname="submit_booking_request"
              tooldescription="Submits a booking reservation request for a specific tour or excursion"
              @submit.prevent="handleSubmit"
            >
              <div
                aria-hidden="true"
                class="hidden"
              >
                <input
                  type="text"
                  name="website"
                  tabindex="-1"
                  autocomplete="new-password"
                  aria-hidden="true"
                  aria-label="Leave this field empty"
                  toolparamdescription="A honeypot field that must be left blank"
                />
              </div>

              <input
                type="hidden"
                name="language"
                toolparamdescription="The current language/locale code of the user"
                :value="locale"
              />
              <div
                v-if="selectedTour"
                class="hidden"
              >
                <input
                  type="hidden"
                  name="reservationType"
                  toolparamdescription="The type of reservation: e.g. booking a specific tour or excursion"
                  :value="selectedTour"
                />
                <input
                  v-if="tourDuration"
                  type="hidden"
                  name="duration"
                  toolparamdescription="The duration in days of the selected tour"
                  :value="tourDuration"
                />
                <input
                  type="hidden"
                  name="selectedTourDisplay"
                  toolparamdescription="Readonly field showing the selected tour title"
                  :value="selectedTour"
                />
                <input
                  v-if="excursionTitle"
                  type="hidden"
                  name="selectedExcursionDisplay"
                  toolparamdescription="Readonly field showing the selected excursion title"
                  :value="excursionTitle"
                />
              </div>

              <div
                :key="formKey"
                class="flex flex-col gap-5"
              >
                <BookingPersonalFields
                  :copy="copy"
                  :locale="locale"
                  :state="state"
                />
                <BookingTripDetails
                  :copy="copy"
                  :locale="locale"
                  :state="state"
                />
              </div>

              <div class="flex flex-col gap-5 pbs-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex flex-col items-center gap-1.5 sm:items-start">
                  <Turnstile
                    ref="recaptchaRef"
                    action="booking"
                    :has-error="Boolean(state?.errors?.['recaptchaToken'])"
                    :language="locale"
                    :missing-config-label="copy.captchaNotConfigured"
                  />
                </div>

                <FormSubmitButton
                  :feedback="feedback"
                  :idle-label="copy.cta"
                  :is-submitting="isSubmitting"
                  :sending-label="copy.sending"
                />
              </div>
            </form>
          </div>
        </div>

        <div
          class="inline-full lg:block-full"
          data-scroll-split="booking-aside"
        >
          <slot name="sidebar" />
        </div>
      </div>
    </div>
  </section>
</template>

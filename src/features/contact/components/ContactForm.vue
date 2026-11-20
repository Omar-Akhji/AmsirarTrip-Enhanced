<script setup lang="ts">
import { useTemplateRef } from "vue";
import { actions } from "astro:actions";
import type { ContactFormCopy } from "@/lib/form-copy";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { TurnstileInstance } from "@/lib/turnstile-client";
import FormSubmitButton from "@/shared/ui/widgets/FormSubmitButton.vue";
import Turnstile from "@/shared/ui/widgets/Turnstile.vue";
import ContactFormFields from "./ContactFormFields.vue";

interface Props {
  copy: ContactFormCopy;
  locale: string;
}

const { copy, locale } = defineProps<Props>();

const recaptchaRef = useTemplateRef<TurnstileInstance>("recaptchaRef");

const { feedback, formKey, handleSubmit, isMounted, isSubmitting, state } = useActionForm({
  action: actions.contact,
  debounceMs: 500,
  getMessages: () => ({
    captchaError: copy.captchaError,
    genericError: copy.genericError,
    success: copy.success,
    validationError: copy.validationError,
  }),
  recaptchaRef,
  requiredTrimmedFields: ["name", "email"],
});
</script>

<template>
  <div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-golden lg:gap-6 xl:gap-8">
    <div
      class="inline-full"
      data-scroll-split="start"
    >
      <div
        class="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs shadow-stone-900/5 block-full sm:p-8 dark:border-white/10 dark:bg-surface-card/90 dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
      >
        <div class="mbe-6 border-b border-stone-100 pbe-5 dark:border-stone-800">
          <span
            class="font-mono text-xs font-semibold tracking-[0.14em] text-orange-700 uppercase dark:text-orange-400"
          >
            {{ copy.badge }}
          </span>
          <h3
            id="contact-heading"
            class="mbs-1 text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-100"
          >
            {{ copy.title }}
          </h3>
        </div>

        <form
          class="flex flex-col gap-5"
          data-form="contact"
          :data-hydrated="isMounted"
          toolname="submit_custom_tour_request"
          tooldescription="Submits a custom private Morocco tour and itinerary request for planning"
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
            :value="locale"
          />

          <div
            :key="formKey"
            class="flex flex-col gap-5"
          >
            <ContactFormFields
              :copy="copy"
              :state="state"
            />
          </div>

          <div class="flex flex-col gap-5 pbs-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-col items-center gap-1.5 sm:items-start">
              <Turnstile
                ref="recaptchaRef"
                action="contact"
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

    <aside
      aria-label="Contact Information"
      class="block-full inline-full"
      data-scroll-split="contact-aside"
    >
      <div
        class="flex flex-col justify-between rounded-2xl border border-slate-900 bg-slate-950 p-6 text-white shadow-xl block-full sm:p-8"
      >
        <slot name="sidebar" />
      </div>
    </aside>
  </div>
</template>

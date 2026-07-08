<script setup lang="ts">
import { ref } from "vue";
import { actions } from "astro:actions";
import { hasRecaptchaV2, RECAPTCHA_V2_SITE_KEY } from "@/lib/client-env";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import Loading from "@/shared/ui/Loading.vue";
import Recaptcha from "@/shared/ui/Recaptcha.vue";
import ContactFormFields from "./ContactFormFields.vue";
import ContactInfoSidebar from "./ContactInfoSidebar.vue";

const { t } = useTranslation();
const recaptchaRef = ref<InstanceType<typeof Recaptcha> | null>(null);

const formKey = ref(0);
const captchaToken = ref("");
const state = ref<FormState | null>(null);
const isSubmitting = ref(false);
const submitTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Debounce submission to prevent double-clicks (500ms window)
const DEBOUNCE_MS = 500;

const alertClasses = {
  success: "bg-green-50 text-green-800 border border-green-100",
  error: "bg-rose-50 text-rose-700 border border-rose-100",
};

const handleVerify = (token: string) => {
  captchaToken.value = token;
};

const handleExpired = () => {
  captchaToken.value = "";
};

const handleSubmit = async (event: Event) => {
  // Clear any pending submission
  if (submitTimeout.value) {
    clearTimeout(submitTimeout.value);
    submitTimeout.value = null;
  }

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name.trim() || !email.trim() || isSubmitting.value) return;

  // Debounce: set a flag for 500ms to prevent rapid submissions
  isSubmitting.value = true;

  const recaptchaToken = recaptchaRef.value?.getValue() ?? "";
  if (!recaptchaToken) {
    state.value = {
      success: false,
      message: t("contact.form.errors.captcha", "Recaptcha verification is required"),
      errors: {
        recaptchaToken: t("contact.form.errors.captcha", "Recaptcha verification is required"),
      },
    };
    isSubmitting.value = false;
    return;
  }
  formData.set("recaptchaToken", recaptchaToken);

  state.value = null;

  try {
    const { data, error } = await actions.contact(formData);

    if (error) {
      state.value = {
        success: false,
        message: error.message || "Form submission failed",
        errors: {},
      };
      recaptchaRef.value?.reset();
      captchaToken.value = "";
    } else if (data) {
      state.value = data;
      if (data.success) {
        // Reset form
        formKey.value += 1;
        captchaToken.value = "";
      } else {
        recaptchaRef.value?.reset();
        captchaToken.value = "";
        setTimeout(() => {
          const firstError = document.querySelector('[aria-invalid="true"]');
          firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Form submission failed";
    state.value = { success: false, message, errors: {} };
    recaptchaRef.value?.reset();
    captchaToken.value = "";
  } finally {
    // Debounce: re-enable after delay
    submitTimeout.value = setTimeout(() => {
      isSubmitting.value = false;
      submitTimeout.value = null;
    }, DEBOUNCE_MS);
  }
};
</script>

<template>
  <section
    id="contact-tailwind"
    aria-labelledby="contact-heading"
    class="bg-neutral-50 py-12 md:py-16"
  >
    <div class="mx-auto px-4 max-inline-6xl sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div
          class="inline-full lg:col-span-3"
          data-animate="creative-slide-right"
        >
          <div class="overflow-hidden rounded-3xl bg-white block-full">
            <div class="bg-linear-to-r from-orange-500 to-orange-600 px-6 py-8 text-white">
              <p class="text-xs font-semibold tracking-[0.35em] text-orange-100 uppercase">
                {{ t("contact.form.badge", "Plan with locals") }}
              </p>
              <h2
                id="contact-heading"
                class="mbs-2 text-2xl font-semibold md:text-3xl"
              >
                {{ t("contact.form.title", "Design Your Custom Morocco Tour & Private Itinerary") }}
              </h2>
              <p class="mbs-3 text-sm text-orange-50/90 md:text-base">
                {{
                  t(
                    "contact.form.subtitle",
                    "Share a few details and we will craft a bespoke itinerary for you.",
                  )
                }}
              </p>
            </div>

            <form
              :key="formKey"
              noValidate
              class="space-y-5 p-6 md:p-8"
              data-form="contact"
              @submit.prevent="handleSubmit"
            >
              <output
                v-if="state?.['message']"
                :class="[
                  'block rounded-2xl px-4 py-3 text-sm font-medium',
                  state?.['success'] ? alertClasses['success'] : alertClasses['error'],
                ]"
                :role="state?.['success'] ? undefined : 'alert'"
                aria-live="polite"
              >
                {{ state?.["message"] }}
              </output>

              <div
                v-if="state?.['errors'] && Object.keys(state['errors']).length > 0"
                class="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
                role="alert"
              >
                <p class="mbe-2 text-sm font-semibold text-orange-900">
                  {{ t("contact.form.errors.title", "Please complete these fields:") }}
                </p>
                <ul class="space-y-1 text-xs text-orange-800">
                  <li
                    v-for="[field, error] in Object.entries(state['errors'])"
                    :key="field"
                    class="flex items-start gap-2"
                  >
                    <svg
                      class="mbs-0.5 size-4 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span>{{ error }}</span>
                  </li>
                </ul>
              </div>

              <!-- Honeypot -->
              <div
                aria-hidden="true"
                class="absolute -left-2499.75 h-0 overflow-hidden"
              >
                <input
                  type="text"
                  name="website"
                  tabindex="-1"
                  autocomplete="off"
                  aria-label="Leave this field empty"
                />
              </div>

              <ContactFormFields :state="state" />

              <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div class="flex justify-center inline-full lg:justify-start">
                  <div
                    :class="[
                      'w-fit origin-center scale-85 rounded-2xl border border-dashed p-3 transition-all duration-500 sm:scale-100',
                      state?.['errors']?.['recaptchaToken'] ?
                        'border-red-300'
                      : 'border-neutral-200',
                    ]"
                  >
                    <Recaptcha
                      v-if="hasRecaptchaV2"
                      ref="recaptchaRef"
                      :sitekey="RECAPTCHA_V2_SITE_KEY"
                      @verify="handleVerify"
                      @expired="handleExpired"
                    />
                    <div
                      v-else
                      class="rounded-lg bg-amber-50 p-2 text-sm text-amber-600"
                    >
                      reCAPTCHA not configured
                    </div>
                  </div>
                </div>

                <p
                  v-if="state?.['errors']?.['recaptchaToken']"
                  id="recaptchaToken-error"
                  class="mbs-1 text-xs text-red-600"
                >
                  {{ state["errors"]["recaptchaToken"] }}
                </p>

                <button
                  type="submit"
                  class="inline-flex transform items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase shadow-lg shadow-orange-500/25 transition duration-300 ease-in-out inline-full disabled:opacity-60 md:inline-auto md:min-inline-50 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-xl pointer-fine:hover:brightness-110"
                  :disabled="isSubmitting"
                  :aria-busy="isSubmitting"
                >
                  <Loading
                    v-if="isSubmitting"
                    size="sm"
                  />
                  <span>
                    {{
                      isSubmitting ?
                        t("contact.form.sending", "Sending…")
                      : t("contact.form.cta", "Send message")
                    }}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div
          class="inline-full lg:col-span-2 lg:block-full"
          data-animate="creative-slide-left"
          data-delay="150"
        >
          <div
            class="flex flex-col justify-between rounded-3xl bg-slate-950 p-8 text-white block-full"
          >
            <ContactInfoSidebar />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onUnmounted, useTemplateRef, provide } from "vue";
import { actions } from "astro:actions";
import { hasRecaptchaV2, RECAPTCHA_V2_SITE_KEY } from "@/lib/client-env";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";
import Loading from "@/shared/ui/primitives/Loading.vue";
import Recaptcha from "@/shared/ui/widgets/Recaptcha.vue";
import ContactFormFields from "./ContactFormFields.vue";
import ContactInfoSidebar from "./ContactInfoSidebar.vue";

interface Props {
  locale?: string;
}

const { locale } = defineProps<Props>();
provide("app-locale", locale);

const { t } = useTranslation(locale);
const recaptchaRef = useTemplateRef<InstanceType<typeof Recaptcha>>("recaptchaRef");

const formKey = ref(0);
const captchaToken = ref("");
const state = ref<FormState | null>(null);
const isSubmitting = ref(false);
const submitTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Debounce submission to prevent double-clicks (500ms window)
const DEBOUNCE_MS = 500;

const alertClasses = {
  success: "bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs",
  error: "bg-rose-50 text-rose-700 border border-rose-200 font-mono text-xs",
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

  const form = event.currentTarget ?? event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const formData = new FormData(form);
  const name = formData.get("name");
  const email = formData.get("email");

  if (
    typeof name !== "string"
    || typeof email !== "string"
    || !name.trim()
    || !email.trim()
    || isSubmitting.value
  ) {
    return;
  }

  // Debounce: set a flag for 500ms to prevent rapid submissions
  isSubmitting.value = true;

  const recaptchaToken = recaptchaRef.value?.getValue() ?? "";
  if (!recaptchaToken) {
    state.value = {
      success: false,
      message: t("contact.form.errors.captcha"),
      errors: { recaptchaToken: t("contact.form.errors.captcha") },
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

onUnmounted(() => {
  if (submitTimeout.value) {
    clearTimeout(submitTimeout.value);
  }
});
</script>

<template>
  <div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-5">
    <!-- Left: Form Card -->
    <div
      class="inline-full lg:col-span-3"
      data-animate="creative-slide-right"
    >
      <div
        class="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs shadow-stone-900/5 transition-all duration-300 block-full hover:-translate-y-1 hover:border-stone-300 hover:shadow-md sm:p-8"
      >
        <div class="mbe-6 border-b border-stone-100 pbe-5">
          <span class="font-mono text-xs font-semibold tracking-[0.14em] text-orange-600 uppercase">
            {{ t("contact.form.badge", "Plan with locals") }}
          </span>
          <h3
            id="contact-heading"
            class="mbs-1 text-xl font-bold tracking-tight text-stone-900 sm:text-2xl"
          >
            {{ t("contact.form.title") }}
          </h3>
        </div>

        <form
          :key="formKey"
          novalidate
          class="flex flex-col gap-5"
          data-form="contact"
          toolname="submit_custom_tour_request"
          tooldescription="Submits a custom private Morocco tour and itinerary request for planning"
          @submit.prevent="handleSubmit"
        >
          <output
            v-if="state?.message"
            class="block rounded-2xl border px-4 py-3 font-mono text-xs leading-relaxed"
            :class="[state.success ? alertClasses.success : alertClasses.error]"
            :role="state.success ? undefined : 'alert'"
            aria-live="polite"
            aria-label="Submission status"
          >
            {{ state.message }}
          </output>

          <div
            v-if="state?.errors && Object.keys(state.errors).length > 0"
            class="rounded-2xl border border-orange-200/80 bg-orange-50/60 p-4"
            role="alert"
          >
            <p class="mbe-2 font-mono text-xs font-bold tracking-wider text-orange-900 uppercase">
              {{ t("contact.form.errors.title") }}
            </p>
            <ul class="space-y-1 font-mono text-xs text-orange-800">
              <li
                v-for="[field, error] in Object.entries(state.errors)"
                :key="field"
                class="flex items-start gap-2"
              >
                <svg
                  class="mbs-0.5 size-4 shrink-0 text-orange-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <line
                    x1="12"
                    x2="12"
                    y1="8"
                    y2="12"
                  />
                  <line
                    x1="12"
                    x2="12.01"
                    y1="16"
                    y2="16"
                  />
                </svg>
                <span>{{ error }}</span>
              </li>
            </ul>
          </div>

          <!-- Honeypot -->
          <div
            aria-hidden="true"
            class="absolute left-[-9999px] h-0 overflow-hidden"
          >
            <input
              type="text"
              name="website"
              tabindex="-1"
              autocomplete="off"
              aria-label="Leave this field empty"
              toolparamdescription="A honeypot field that must be left blank"
            />
          </div>

          <ContactFormFields :state="state" />

          <div class="flex flex-col gap-4 pbs-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex justify-center sm:justify-start">
              <div
                class="w-fit origin-center scale-85 rounded-xl border border-dashed p-2 transition-all sm:scale-100"
                :class="[state?.errors?.recaptchaToken ? 'border-red-300' : 'border-stone-200']"
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
                  class="rounded-lg bg-stone-100 p-2 font-mono text-xs text-stone-600"
                >
                  reCAPTCHA not configured
                </div>
              </div>
            </div>

            <p
              v-if="state?.errors?.recaptchaToken"
              id="recaptchaToken-error"
              class="mbs-1 font-mono text-xs text-red-600"
            >
              {{ state.errors.recaptchaToken }}
            </p>

            <button
              type="submit"
              data-ascii="fade"
              class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-linear-to-br from-amber-orange to-orange px-8 py-3 font-mono text-xs font-semibold tracking-wider text-white uppercase shadow-md shadow-orange/20 transition-all duration-200 hover:shadow-lg hover:shadow-orange/30 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
            >
              <Loading
                v-if="isSubmitting"
                size="sm"
              />
              <span>
                {{ t(isSubmitting ? "contact.form.sending" : "contact.form.cta") }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Right: Sidebar -->
    <aside
      aria-label="Contact Information"
      class="block-full inline-full lg:col-span-2"
      data-animate="creative-slide-left"
      data-delay="150"
    >
      <div
        class="flex flex-col justify-between rounded-2xl border border-slate-900 bg-slate-950 p-6 text-white shadow-xl transition-all duration-300 block-full hover:-translate-y-1 hover:border-slate-800 hover:shadow-2xl sm:p-8"
      >
        <ContactInfoSidebar />
      </div>
    </aside>
  </div>
</template>

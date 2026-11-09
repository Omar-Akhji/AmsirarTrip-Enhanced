<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, provide } from "vue";
import { actions } from "astro:actions";
import { hasRecaptchaV2, RECAPTCHA_V2_SITE_KEY } from "@/lib/client-env";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";
import Loading from "@/shared/ui/primitives/Loading.vue";
import Recaptcha from "@/shared/ui/widgets/Recaptcha.vue";
import BookingFormFields from "./BookingFormFields.vue";
import FormStatusMessages from "./FormStatusMessages.vue";

interface Props {
  locale?: string;
  tourTitle?: string;
  tourId?: string;
  tourDuration?: number | null;
  excursionTitle?: string;
  excursionId?: string;
  fullWidth?: boolean;
}

const {
  locale,
  tourTitle,
  tourId,
  tourDuration,
  excursionTitle,
  excursionId,
  fullWidth = false,
} = defineProps<Props>();

if (locale) {
  provide("app-locale", locale);
}

const { t, i18n } = useTranslation(locale);
const recaptchaRef = useTemplateRef<InstanceType<typeof Recaptcha>>("recaptchaRef");

const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});

const formKey = ref(0);
const calendarOpen = ref(false);
const reservationDate = ref<Date | null>(null);
const captchaToken = ref("");
const buttonText = ref("booking.checkAvailability");
const state = ref<FormState | null>(null);
const isSubmitting = ref(false);

const handleVerify = (token: string) => {
  captchaToken.value = token;
};

const handleExpired = () => {
  captchaToken.value = "";
};

const selectedTour = computed(() => {
  return tourTitle && tourDuration != null ?
      `${tourTitle} - Duration: ${tourDuration} Days`
    : tourTitle || excursionTitle || "";
});

const computedTourDuration = computed(() => tourDuration ?? null);

const handleSubmit = async (event: Event) => {
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;

  if (!fullName.trim() || !email.trim() || isSubmitting.value) return;

  const recaptchaToken = recaptchaRef.value?.getValue() ?? "";
  if (!recaptchaToken) {
    state.value = {
      success: false,
      message: t("booking.errors.captcha"),
      errors: { recaptchaToken: t("booking.errors.captcha") },
    };
    return;
  }
  formData.set("recaptchaToken", recaptchaToken);

  isSubmitting.value = true;
  state.value = null;

  try {
    const { data, error } = await actions.booking(formData);

    if (error) {
      state.value = {
        success: false,
        message: error.message || "Booking submission failed",
        errors: {},
      };
      recaptchaRef.value?.reset();
      captchaToken.value = "";
    } else if (data) {
      state.value = data;
      if (data.success) {
        buttonText.value = "Your booking request has been sent";
        reservationDate.value = null;
        captchaToken.value = "";

        setTimeout(() => {
          formKey.value += 1;
          buttonText.value = "booking.checkAvailability";
        }, 4000);
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
    const message = error instanceof Error ? error.message : "Booking submission failed";
    state.value = { success: false, message, errors: {} };
    recaptchaRef.value?.reset();
    captchaToken.value = "";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <section
    id="booking"
    aria-labelledby="booking-heading"
    class="relative isolate border-bs border-stone-200 bg-stone-50 py-12 sm:py-16 lg:py-24 dark:border-white/10 dark:bg-surface-base"
    :class="[fullWidth ? 'booking-form-fullwidth' : '']"
  >
    <div
      class="booking-form-inner mx-auto px-4 inline-full max-inline-7xl 2xl:max-inline-360 3xl:max-inline-420"
    >
      <div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-5">
        <!-- Left: Form Card -->
        <div
          class="inline-full lg:col-span-3"
          data-animate="creative-slide-right"
        >
          <div
            class="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs block-full sm:p-8 dark:border-white/10 dark:bg-surface-card/90 dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          >
            <div class="mbe-6 border-be border-stone-100 dark:border-white/10 pbe-4">
              <span
                class="font-mono text-xs font-semibold tracking-[0.14em] text-orange-600 dark:text-orange uppercase"
              >
                {{ t("contact.form.badge") }}
              </span>
              <h3
                id="booking-heading"
                class="mbs-1 text-xl font-bold tracking-tight text-stone-900 dark:text-mist-100 sm:text-2xl"
              >
                {{ t("booking.makeReservation") }}
              </h3>
            </div>

            <form
              :key="formKey"
              class="flex flex-col gap-6"
              novalidate
              data-form="booking"
              :data-hydrated="isMounted"
              toolname="submit_booking_request"
              tooldescription="Submits a booking reservation request for a specific tour or excursion"
              @submit.prevent="handleSubmit"
            >
              <FormStatusMessages
                v-bind="{
                  ...(state?.errors?.['submit'] ? { submitError: state.errors['submit'] } : {}),
                  ...(state?.success !== undefined ? { success: state.success } : {}),
                  ...(state?.message ? { successMessage: state.message } : {}),
                }"
              />

              <div
                v-if="
                  state?.errors
                  && Object.entries(state.errors).some(
                    ([k]) => k !== 'submit' && k !== 'recaptchaToken',
                  )
                "
                class="rounded-2xl border border-orange-200/80 bg-orange-50/60 p-4"
                role="alert"
              >
                <p
                  class="mbe-2 font-mono text-xs font-bold tracking-wider text-orange-900 uppercase"
                >
                  {{ t("contact.form.errors.title") }}
                </p>
                <ul class="flex flex-col gap-1 font-mono text-xs text-orange-800">
                  <li
                    v-for="[field, error] in Object.entries(state.errors).filter(
                      ([k]) => k !== 'submit' && k !== 'recaptchaToken',
                    )"
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

              <!-- Honeypot (hidden from layout, screen readers, and browser autofill) -->
              <div
                aria-hidden="true"
                class="hidden"
                style="display: none"
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

              <BookingFormFields
                v-model:calendar-open="calendarOpen"
                v-model:reservation-date="reservationDate"
                :state="state"
                :selected-tour="selectedTour"
                v-bind="{
                  ...(tourTitle ? { tourTitle } : {}),
                  ...(tourId ? { tourId } : {}),
                  ...(excursionTitle ? { excursionTitle } : {}),
                  ...(excursionId ? { excursionId } : {}),
                }"
                :tour-duration="computedTourDuration"
                :locale="i18n.language"
              />

              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex justify-center sm:justify-start">
                  <div
                    class="w-fit origin-center scale-85 rounded-xl border border-dashed p-2 transition-all sm:scale-100"
                    :class="[
                      state?.errors?.['recaptchaToken'] ? 'border-red-300' : 'border-stone-200',
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
                      class="rounded-lg bg-stone-100 p-2 font-mono text-xs text-stone-600"
                    >
                      reCAPTCHA not configured
                    </div>
                  </div>
                </div>

                <p
                  v-if="state?.errors?.['recaptchaToken']"
                  id="recaptchaToken-error"
                  class="mbs-1 font-mono text-xs text-red-600"
                >
                  {{ state.errors["recaptchaToken"] }}
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
                    {{
                      isSubmitting ? t("booking.sending")
                      : buttonText === "booking.checkAvailability" ? t(buttonText)
                      : buttonText
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
          <slot name="sidebar" />
        </div>
      </div>
    </div>
  </section>
</template>

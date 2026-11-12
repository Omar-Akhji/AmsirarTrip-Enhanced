<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, provide } from "vue";
import { actions } from "astro:actions";
import { hasCaptcha } from "@/lib/client-env";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";
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

interface RecaptchaInstance {
  readonly getValue: () => string;
  readonly reset: () => void;
}

const { locale, tourTitle, tourId, tourDuration, excursionTitle, excursionId, fullWidth } =
  defineProps<Props>();

if (locale) {
  provide("app-locale", locale);
}

const { t, i18n } = useTranslation(locale);
const recaptchaRef = useTemplateRef<RecaptchaInstance>("recaptchaRef");

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
    : (tourTitle ?? excursionTitle ?? "");
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
    } else {
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
      class="booking-form-inner mx-auto px-2 inline-full max-inline-7xl sm:px-6 lg:px-8 2xl:max-inline-360 3xl:max-inline-420"
    >
      <div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-golden lg:gap-6 xl:gap-8">
        <!-- Left: Form Card -->
        <div
          class="inline-full"
          data-animate="creative-slide-right"
        >
          <div
            class="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs block-full sm:p-8 dark:border-white/10 dark:bg-surface-card/90 dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          >
            <div class="mbe-6 border-be border-stone-100 pbe-5 dark:border-white/10">
              <span
                class="font-mono text-xs font-semibold tracking-[0.14em] text-orange-600 uppercase dark:text-orange"
              >
                {{ t("contact.form.badge") }}
              </span>
              <h3
                id="booking-heading"
                class="mbs-1 text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-mist-100"
              >
                {{ t("booking.makeReservation") }}
              </h3>
            </div>

            <form
              :key="formKey"
              class="flex flex-col gap-5"
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

              <div class="flex flex-col gap-5 pbs-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex flex-col items-center gap-1.5 sm:items-start">
                  <div
                    class="w-fit rounded-2xl border border-dashed p-1.5 transition-all"
                    :class="[
                      state?.errors?.['recaptchaToken'] ?
                        'border-red-400 bg-red-50/30 dark:border-red-400/80 dark:bg-red-950/20'
                      : 'border-stone-300 bg-stone-50/40 dark:border-white/15 dark:bg-white/2',
                    ]"
                  >
                    <Recaptcha
                      v-if="hasCaptcha"
                      ref="recaptchaRef"
                      @verify="handleVerify"
                      @expired="handleExpired"
                    />
                    <div
                      v-else
                      class="rounded-xl border border-stone-200 bg-stone-100 p-2 font-mono text-xs text-stone-600 dark:border-white/10 dark:bg-stone-800 dark:text-stone-300"
                    >
                      CAPTCHA not configured
                    </div>
                  </div>

                  <p
                    v-if="state?.errors?.['recaptchaToken']"
                    id="recaptchaToken-error"
                    class="font-mono text-xs text-red-600 dark:text-red-400"
                  >
                    {{ state.errors["recaptchaToken"] }}
                  </p>
                </div>

                <button
                  type="submit"
                  class="group inline-flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-full border border-white/10 bg-slate-950 py-1.5 ps-5 pe-1.5 font-mono text-xs font-semibold tracking-wider text-white uppercase shadow-lg shadow-black/25 transition-colors duration-200 hover:border-white/20 hover:bg-black hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-4 sm:ps-6 sm:pe-2 dark:border-stone-300 dark:bg-white dark:text-dark-surface dark:hover:bg-white"
                  :disabled="isSubmitting"
                  :aria-busy="isSubmitting"
                >
                  <span class="truncate">
                    {{
                      isSubmitting ? t("booking.sending")
                      : buttonText === "booking.checkAvailability" ? t(buttonText)
                      : buttonText
                    }}
                  </span>
                  <span
                    class="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-amber-orange to-orange text-white shadow-xs shadow-orange/40 transition-transform duration-300 ease-out group-hover:scale-105 group-active:scale-95"
                  >
                    <!-- Loading state: Solar Refresh Broken spinning icon -->
                    <svg
                      v-if="isSubmitting"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="size-4.5 animate-spin"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.67981 13L3.67981 11.3333C3.67981 6.73096 7.4402 3 12.0789 3C12.2201 3 12.3605 3.00346 12.5 3.01029M2 11.3333L3.67981 13L5.35962 11.3333M19.2545 7C18.567 5.88176 17.6215 4.9368 16.5 4.2466"
                      />
                      <path
                        d="M20.3137 11V12.6667C20.3137 17.269 16.5389 21 11.8825 21C11.7543 21 11.6268 20.9972 11.5 20.9916M21.9999 12.6667L20.3137 11L18.6274 12.6667M4.67944 17C5.38086 18.1366 6.34989 19.0942 7.5 19.7872"
                      />
                    </svg>

                    <template v-else>
                      <!-- Arrow Stage: Smooth sliding choreography -->
                      <div class="relative flex size-full items-center justify-center">
                        <!-- Default state: Solar Arrow Right-Up Broken (slides up-right & fades out on hover) -->
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="absolute size-4.5 transition-all duration-300 ease-out group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:opacity-0 rtl:-scale-x-100 rtl:group-hover:-translate-x-3"
                          aria-hidden="true"
                        >
                          <path d="M18 15V6H9M18 6L11.5 12.5M6 18L8.5 15.5" />
                        </svg>

                        <!-- Hover state: Solar Arrow Right Broken (slides in from left & settles centered) -->
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="absolute size-4.5 -translate-x-3 translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 rtl:translate-x-3 rtl:-scale-x-100 rtl:group-hover:translate-x-0"
                          aria-hidden="true"
                        >
                          <path d="M14 18L20 12L14 6M20 12H9.5M4 12H6.5" />
                        </svg>
                      </div>
                    </template>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div
          class="inline-full lg:block-full"
          data-animate="creative-slide-left"
          data-delay="150"
        >
          <slot name="sidebar" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { actions } from "astro:actions";
import { hasRecaptchaV2, RECAPTCHA_V2_SITE_KEY } from "@/lib/client-env";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import HydrationBoundary from "@/shared/ui/HydrationBoundary.vue";
import Loading from "@/shared/ui/Loading.vue";
import Recaptcha from "@/shared/ui/Recaptcha.vue";
import BookingFormFields from "./BookingFormFields.vue";
import BookingSidebar from "./BookingSidebar.vue";
import FormStatusMessages from "./FormStatusMessages.vue";

interface Props {
  tourTitle?: string;
  tourId?: string;
  tourDuration?: number | null;
  excursionTitle?: string;
  excursionId?: string;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), { fullWidth: false });

const { t, i18n } = useTranslation();
const recaptchaRef = ref<InstanceType<typeof Recaptcha> | null>(null);

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

const perks = computed(() => [
  { id: "experts", text: t("booking.perkLocalExperts", "Licensed local drivers & guides") },
  { id: "flexible", text: t("booking.perkFlexible", "Flexible departures from Marrakech") },
  { id: "support", text: t("booking.perkSupport", "Fast responses within 24 hours") },
]);

const selectedTour = computed(() => {
  if (props.tourTitle && props.tourDuration != null) {
    return `${props.tourTitle} - Duration: ${props.tourDuration} Days`;
  }
  return props.tourTitle || props.excursionTitle || "";
});

const tourDuration = computed(() => {
  return props.tourDuration ?? null;
});

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
      message: t("booking.errors.captcha", "Recaptcha verification is required"),
      errors: { recaptchaToken: t("booking.errors.captcha", "Recaptcha verification is required") },
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
  <HydrationBoundary
    :fallback="t('booking.loading', 'Loading booking form...')"
    error-prefix="Booking Form Error"
  >
    <section
      id="booking"
      aria-labelledby="booking-heading"
      :class="['bg-neutral-50 py-20 md:py-10', fullWidth ? 'booking-form-fullwidth' : '']"
    >
      <div
        :class="[
          'booking-form-inner mx-auto overflow-x-hidden inline-full max-inline-6xl',
          fullWidth ? 'px-4 sm:px-6 lg:px-10' : 'px-4 sm:px-6 lg:px-8',
        ]"
      >
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div
            class="inline-full lg:col-span-3"
            data-animate="creative-slide-right"
          >
            <div class="overflow-hidden rounded-3xl bg-white block-full">
              <div class="bg-linear-to-r from-orange-500 to-orange-600 px-6 py-8 text-white">
                <h2
                  id="booking-heading"
                  class="text-xl font-semibold sm:text-2xl md:text-3xl"
                >
                  {{ t("booking.makeReservation", "Make your reservation") }}
                </h2>
                <p class="mbs-3 text-sm text-orange-50/90 md:text-base">
                  {{ t("booking.description", "Book your perfect Morocco adventure with us") }}
                </p>
              </div>

              <form
                :key="formKey"
                class="space-y-5 p-6 md:p-8"
                noValidate
                data-form="booking"
                @submit.prevent="handleSubmit"
                toolname="submit_booking_request"
                tooldescription="Submits a booking reservation request for a specific tour or excursion"
              >
                <FormStatusMessages
                  v-bind="{
                    ...(state?.['errors']?.['submit'] ?
                      { submitError: state['errors']['submit'] }
                    : {}),
                    ...(state?.['success'] !== undefined ? { success: state['success'] } : {}),
                    ...(state?.['message'] ? { successMessage: state['message'] } : {}),
                  }"
                />

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
                  :tour-duration="tourDuration"
                  :locale="i18n.language"
                />

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
                    class="inline-flex transform items-center justify-center gap-2 rounded-full border border-orange-400 bg-linear-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold tracking-wide whitespace-nowrap text-white uppercase transition duration-300 ease-in-out inline-full disabled:cursor-not-allowed disabled:opacity-60 md:inline-auto md:min-inline-50 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:brightness-110"
                    :disabled="isSubmitting"
                    :aria-busy="isSubmitting"
                  >
                    <Loading
                      v-if="isSubmitting"
                      size="sm"
                    />
                    <span>
                      {{
                        isSubmitting ? t("booking.sending", "Sending...")
                        : buttonText === "booking.checkAvailability" ? t(buttonText, "Reserve Now")
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
            <BookingSidebar :perks="perks" />
          </div>
        </div>
      </div>
    </section>
  </HydrationBoundary>
</template>

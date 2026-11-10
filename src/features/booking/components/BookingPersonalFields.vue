<script setup lang="ts">
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";
import PhoneInput from "@/shared/ui/widgets/PhoneInput.vue";

interface Props {
  state: FormState | null;
}

const { state } = defineProps<Props>();

const { t } = useTranslation();
</script>

<template>
  <fieldset class="m-0 flex flex-col gap-5 border-0 p-0">
    <legend class="sr-only">
      {{ t("booking.personalDetails") }}
    </legend>
    <div class="grid items-start gap-5 md:grid-cols-2">
      <div>
        <label
          for="fullName"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-mist-200"
        >
          {{ t("booking.fullName") }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <div class="relative">
          <svg
            class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-stone-400 transition-colors peer-focus:text-orange-500 dark:text-mist-400"
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
            id="fullName"
            class="peer h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:text-mist-100 dark:placeholder:text-mist-500 dark:focus:border-orange-500 dark:focus:bg-white/10"
            :placeholder="t('booking.placeholders.fullName')"
            :maxlength="100"
            type="text"
            name="fullName"
            toolparamdescription="The full name of the guest booking the reservation"
            autocomplete="name"
            :aria-invalid="state?.errors?.fullName ? 'true' : 'false'"
            :aria-describedby="state?.errors?.fullName ? 'fullName-error' : undefined"
            required
          />
        </div>
        <p
          v-if="state?.errors?.fullName"
          id="fullName-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors.fullName }}
        </p>
      </div>

      <div>
        <label
          for="email"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-mist-200"
        >
          {{ t("booking.email") }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <div class="relative">
          <svg
            class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-stone-400 transition-colors peer-focus:text-orange-500 dark:text-mist-400"
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
            id="email"
            class="peer h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:text-mist-100 dark:placeholder:text-mist-500 dark:focus:border-orange-500 dark:focus:bg-white/10"
            :placeholder="t('booking.placeholders.email')"
            type="email"
            name="email"
            toolparamdescription="The email address of the guest"
            autocomplete="email"
            :aria-invalid="state?.errors?.email ? 'true' : 'false'"
            :aria-describedby="state?.errors?.email ? 'email-error' : undefined"
            required
          />
        </div>
        <p
          v-if="state?.errors?.email"
          id="email-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors.email }}
        </p>
      </div>
    </div>

    <div>
      <label
        for="booking-phone"
        class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-mist-200"
      >
        {{ t("booking.phone") }}
        <span
          class="text-orange-600"
          aria-hidden="true"
          >*</span
        >
      </label>
      <PhoneInput
        id="booking-phone"
        name="phone"
        :placeholder="t('booking.placeholders.phone')"
        toolparamdescription="The contact phone/WhatsApp number of the guest"
        :aria-invalid="state?.errors?.phone ? 'true' : 'false'"
        :aria-describedby="state?.errors?.phone ? 'phone-error' : undefined"
        required
      />
      <p
        v-if="state?.errors?.phone"
        id="phone-error"
        class="mbs-1 font-sans text-xs text-red-600"
      >
        {{ state.errors.phone }}
      </p>
    </div>
  </fieldset>
</template>

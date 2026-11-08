<script setup lang="ts">
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";

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
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
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
            class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-stone-400 transition-colors peer-focus:text-orange-500"
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
            class="peer h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
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
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
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
            class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-stone-400 transition-colors peer-focus:text-orange-500"
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
            class="peer h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
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
        for="phone"
        class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
      >
        {{ t("booking.phone") }}
        <span
          class="text-orange-600"
          aria-hidden="true"
          >*</span
        >
      </label>
      <div class="relative">
        <svg
          class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-stone-400 transition-colors peer-focus:text-orange-500"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4.00655 7.93309C3.93421 9.84122 4.41713 13.0817 7.6677 16.3323C8.45191 17.1165 9.23553 17.7396 10 18.2327M5.53781 4.93723C6.93076 3.54428 9.15317 3.73144 10.0376 5.31617L10.6866 6.4791C11.2723 7.52858 11.0372 8.90532 10.1147 9.8278C10.1147 9.8278 10.1147 9.8278 10.1147 9.8278C10.1146 9.82792 8.99588 10.9468 11.0245 12.9755C13.0525 15.0035 14.1714 13.8861 14.1722 13.8853C14.1722 13.8853 14.1722 13.8853 14.1722 13.8853C15.0947 12.9628 16.4714 12.7277 17.5209 13.3134L18.6838 13.9624C20.2686 14.8468 20.4557 17.0692 19.0628 18.4622C18.2258 19.2992 17.2004 19.9505 16.0669 19.9934C15.2529 20.0243 14.1963 19.9541 13 19.6111"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <input
          id="phone"
          class="peer h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          :placeholder="t('booking.placeholders.phone')"
          :maxlength="20"
          type="tel"
          name="phone"
          toolparamdescription="The contact phone/WhatsApp number of the guest"
          autocomplete="tel"
          :aria-invalid="state?.errors?.phone ? 'true' : 'false'"
          :aria-describedby="state?.errors?.phone ? 'phone-error' : undefined"
          required
        />
      </div>
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

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
      {{ t("booking.personalDetails", "Guest Details") }}
    </legend>
    <div class="grid items-start gap-5 md:grid-cols-2">
      <div>
        <label
          for="fullName"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
        >
          {{ t("booking.fullName", "Full Name") }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <input
          id="fullName"
          class="h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 font-sans text-sm text-stone-900 transition-colors inline-full focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          :maxlength="100"
          type="text"
          name="fullName"
          toolparamdescription="The full name of the guest booking the reservation"
          autocomplete="name"
          :aria-invalid="state?.errors?.fullName ? 'true' : 'false'"
          :aria-describedby="state?.errors?.fullName ? 'fullName-error' : undefined"
          required
        />
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
          {{ t("booking.email", "Email") }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <input
          id="email"
          class="h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 font-sans text-sm text-stone-900 transition-colors inline-full focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          type="email"
          name="email"
          toolparamdescription="The email address of the guest"
          autocomplete="email"
          :aria-invalid="state?.errors?.email ? 'true' : 'false'"
          :aria-describedby="state?.errors?.email ? 'email-error' : undefined"
          required
        />
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
        {{ t("booking.phone", "Phone Number") }}
        <span
          class="text-orange-600"
          aria-hidden="true"
          >*</span
        >
      </label>
      <input
        id="phone"
        class="h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 font-sans text-sm text-stone-900 transition-colors inline-full focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
        :maxlength="20"
        type="tel"
        name="phone"
        toolparamdescription="The contact phone/WhatsApp number of the guest"
        autocomplete="tel"
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

<script setup lang="ts">
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface Props {
  state: FormState | null;
}

defineProps<Props>();

const { t } = useTranslation();
</script>

<template>
  <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
    <div>
      <label
        for="fullName"
        class="sr-only"
      >
        {{ t("booking.fullName", "Full Name") }}
      </label>
      <input
        id="fullName"
        class="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
        :maxlength="100"
        type="text"
        name="fullName"
        :placeholder="t('booking.fullName', 'Full Name')"
        :aria-label="t('booking.fullName', 'Full Name')"
        autocomplete="name"
        :aria-invalid="state?.errors?.['fullName'] ? 'true' : 'false'"
        :aria-describedby="state?.errors?.['fullName'] ? 'fullName-error' : undefined"
        required
      />
      <p
        v-if="state?.errors?.['fullName']"
        id="fullName-error"
        class="mbs-1 text-xs text-red-600"
      >
        {{ state.errors["fullName"] }}
      </p>
    </div>

    <div>
      <label
        for="phone"
        class="sr-only"
      >
        {{ t("booking.phone", "Phone Number") }}
      </label>
      <input
        id="phone"
        class="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
        :maxlength="20"
        type="tel"
        name="phone"
        :placeholder="t('booking.phone', 'Phone Number')"
        :aria-label="t('booking.phone', 'Phone Number')"
        autocomplete="tel"
        :aria-invalid="state?.errors?.['phone'] ? 'true' : 'false'"
        :aria-describedby="state?.errors?.['phone'] ? 'phone-error' : undefined"
        required
      />
      <p
        v-if="state?.errors?.['phone']"
        id="phone-error"
        class="mbs-1 text-xs text-red-600"
      >
        {{ state.errors["phone"] }}
      </p>
    </div>
  </div>

  <div>
    <label
      for="email"
      class="sr-only"
    >
      {{ t("booking.email", "Email") }}
    </label>
    <input
      id="email"
      class="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
      type="email"
      name="email"
      :placeholder="t('booking.email', 'Email')"
      :aria-label="t('booking.email', 'Email')"
      autocomplete="email"
      :aria-invalid="state?.errors?.['email'] ? 'true' : 'false'"
      :aria-describedby="state?.errors?.['email'] ? 'email-error' : undefined"
      required
    />
    <p
      v-if="state?.errors?.['email']"
      id="email-error"
      class="mbs-1 text-xs text-red-600"
    >
      {{ state.errors["email"] }}
    </p>
  </div>
</template>

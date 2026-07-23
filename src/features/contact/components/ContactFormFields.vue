<script setup lang="ts">
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";

interface Props {
  state: FormState | null;
}

defineProps<Props>();

const { t } = useTranslation();
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2">
    <div>
      <label
        for="contact-name"
        class="sr-only"
      >
        {{ t("contact.form.fields.name", "Full name") }}
      </label>
      <input
        id="contact-name"
        name="name"
        type="text"
        class="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
        :maxlength="100"
        toolparamdescription="The full name of the contact person"
        :placeholder="t('contact.form.fields.name', 'Full name')"
        :aria-label="t('contact.form.fields.name', 'Full name')"
        autocomplete="name"
        required
        :aria-invalid="state?.errors?.['name'] ? 'true' : 'false'"
        :aria-describedby="state?.errors?.['name'] ? 'name-error' : undefined"
      />
      <p
        v-if="state?.errors?.['name']"
        id="name-error"
        class="mbs-1 text-xs text-red-600"
      >
        {{ state.errors["name"] }}
      </p>
    </div>
    <div>
      <label
        for="contact-email"
        class="sr-only"
      >
        {{ t("contact.form.fields.email", "Email") }}
      </label>
      <input
        id="contact-email"
        name="email"
        type="email"
        class="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
        toolparamdescription="The email address of the contact person"
        :placeholder="t('contact.form.fields.email', 'Email')"
        :aria-label="t('contact.form.fields.email', 'Email')"
        autocomplete="email"
        required
        :aria-invalid="state?.errors?.['email'] ? 'true' : 'false'"
        :aria-describedby="state?.errors?.['email'] ? 'email-error' : undefined"
      />
      <p
        v-if="state?.errors?.['email']"
        id="email-error"
        class="mbs-1 text-xs text-red-600"
      >
        {{ state.errors["email"] }}
      </p>
    </div>
  </div>

  <div class="grid gap-5 md:grid-cols-2">
    <div>
      <label
        for="contact-phone"
        class="sr-only"
      >
        {{ t("contact.form.fields.phone", "Phone number") }}
      </label>
      <input
        id="contact-phone"
        name="phone"
        type="tel"
        class="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
        :maxlength="20"
        toolparamdescription="The phone/WhatsApp number of the contact person"
        :placeholder="t('contact.form.fields.phone', 'Phone number')"
        :aria-label="t('contact.form.fields.phone', 'Phone number')"
        autocomplete="tel"
        required
        :aria-invalid="state?.errors?.['phone'] ? 'true' : 'false'"
        :aria-describedby="state?.errors?.['phone'] ? 'phone-error' : undefined"
      />
      <p
        v-if="state?.errors?.['phone']"
        id="phone-error"
        class="mbs-1 text-xs text-red-600"
      >
        {{ state.errors["phone"] }}
      </p>
    </div>
    <div>
      <label
        for="contact-topic"
        class="sr-only"
      >
        {{ t("contact.form.fields.topic", "Trip focus (optional)") }}
      </label>
      <input
        id="contact-topic"
        name="topic"
        type="text"
        class="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
        toolparamdescription="The specific focus or interest of the trip, e.g., Sahara desert, imperial cities, custom trek"
        :placeholder="t('contact.form.fields.topic', 'Trip focus (optional)')"
        :aria-label="t('contact.form.fields.topic', 'Trip focus (optional)')"
        autocomplete="off"
      />
    </div>
  </div>

  <div>
    <label
      for="contact-message"
      class="sr-only"
    >
      {{ t("contact.form.fields.message", "Message") }}
    </label>
    <textarea
      id="contact-message"
      name="message"
      class="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full min-block-40 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
      :maxlength="1000"
      toolparamdescription="The detailed message or description of the custom Morocco itinerary/dream tour request"
      :placeholder="t('contact.form.fields.message', 'Tell us about your Morocco dream')"
      :aria-label="t('contact.form.fields.message', 'Tell us about your Morocco dream')"
      autocomplete="off"
      required
      :aria-invalid="state?.errors?.['message'] ? 'true' : 'false'"
      :aria-describedby="state?.errors?.['message'] ? 'message-error' : undefined"
    />
    <p
      v-if="state?.errors?.['message']"
      id="message-error"
      class="mbs-1 text-xs text-red-600"
    >
      {{ state.errors["message"] }}
    </p>
  </div>
</template>

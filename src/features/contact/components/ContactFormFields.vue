<script setup lang="ts">
import { ref } from "vue";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";

interface Props {
  state: FormState | null;
}

const { state } = defineProps<Props>();

const { t } = useTranslation();

const isTopicExpanded = ref(false);
</script>

<template>
  <fieldset class="m-0 flex flex-col gap-5 border-0 p-0">
    <legend class="sr-only">
      {{ t("contact.form.details", "Contact Details") }}
    </legend>
    <div class="grid gap-5 md:grid-cols-2">
      <div>
        <label
          for="contact-name"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
        >
          {{ t("contact.form.fields.name", "Full name") }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          class="rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 py-3 font-sans text-sm text-stone-900 transition-colors inline-full focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          :maxlength="100"
          toolparamdescription="The full name of the contact person"
          autocomplete="name"
          required
          :aria-invalid="state?.errors?.name ? 'true' : 'false'"
          :aria-describedby="state?.errors?.name ? 'name-error' : undefined"
        />
        <p
          v-if="state?.errors?.name"
          id="name-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors.name }}
        </p>
      </div>
      <div>
        <label
          for="contact-email"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
        >
          {{ t("contact.form.fields.email", "Email") }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          class="rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 py-3 font-sans text-sm text-stone-900 transition-colors inline-full focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          toolparamdescription="The email address of the contact person"
          autocomplete="email"
          required
          :aria-invalid="state?.errors?.email ? 'true' : 'false'"
          :aria-describedby="state?.errors?.email ? 'email-error' : undefined"
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

    <div class="grid gap-5 md:grid-cols-2">
      <div>
        <label
          for="contact-phone"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
        >
          {{ t("contact.form.fields.phone", "Phone number") }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          class="rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 py-3 font-sans text-sm text-stone-900 transition-colors inline-full focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          :maxlength="20"
          toolparamdescription="The phone/WhatsApp number of the contact person"
          autocomplete="tel"
          required
          :aria-invalid="state?.errors?.phone ? 'true' : 'false'"
          :aria-describedby="state?.errors?.phone ? 'phone-error' : undefined"
        />
        <p
          v-if="state?.errors?.phone"
          id="phone-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors.phone }}
        </p>
      </div>
      <div>
        <label
          for="contact-topic"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
        >
          {{ t("contact.form.fields.topic", "Trip focus (optional)") }}
        </label>
        <input
          id="contact-topic"
          name="topic"
          type="text"
          list="contact-topics"
          aria-autocomplete="list"
          :aria-expanded="isTopicExpanded"
          aria-controls="contact-topics"
          class="rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 py-3 font-sans text-sm text-stone-900 transition-colors inline-full focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          toolparamdescription="The specific focus or interest of the trip, e.g., Sahara desert, imperial cities, custom trek"
          autocomplete="off"
          @focus="isTopicExpanded = true"
          @blur="isTopicExpanded = false"
          @input="isTopicExpanded = true"
        />
        <datalist id="contact-topics">
          <option :value="t('contact.form.topics.desert', 'Sahara Desert Expedition')" />
          <option :value="t('contact.form.topics.atlas', 'High Atlas Mountain Trek')" />
          <option
            :value="t('contact.form.topics.imperial', 'Imperial Cities & Cultural Heritage')"
          />
          <option
            :value="t('contact.form.topics.coastal', 'Atlantic Coast & Essaouira Excursion')"
          />
          <option :value="t('contact.form.topics.custom', 'Tailored Private Morocco Itinerary')" />
        </datalist>
      </div>
    </div>

    <div>
      <label
        for="contact-message"
        class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
      >
        {{ t("contact.form.fields.message", "Message") }}
        <span
          class="text-orange-600"
          aria-hidden="true"
          >*</span
        >
      </label>
      <textarea
        id="contact-message"
        name="message"
        class="rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 py-3 font-sans text-sm text-stone-900 transition-colors inline-full min-block-40 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
        :maxlength="1000"
        toolparamdescription="The detailed message or description of the custom Morocco itinerary/dream tour request"
        autocomplete="off"
        required
        :aria-invalid="state?.errors?.message ? 'true' : 'false'"
        :aria-describedby="state?.errors?.message ? 'message-error' : undefined"
      />
      <p
        v-if="state?.errors?.message"
        id="message-error"
        class="mbs-1 font-sans text-xs text-red-600"
      >
        {{ state.errors.message }}
      </p>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";
import BookingPersonalFields from "./BookingPersonalFields.vue";
import BookingTripDetails from "./BookingTripDetails.vue";

interface Props {
  state: FormState | null;
  selectedTour: string;
  tourTitle?: string;
  tourId?: string;
  tourDuration: number | null;
  excursionTitle?: string;
  excursionId?: string;
  locale: string;
  calendarOpen: boolean;
  reservationDate: Date | null;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "update:calendarOpen", open: boolean): void;
  (e: "update:reservationDate", date: Date | null): void;
}>();

const { t } = useTranslation();
</script>

<template>
  <template v-if="selectedTour">
    <input
      type="hidden"
      name="reservationType"
      toolparamdescription="The type of reservation: e.g. booking a specific tour or excursion"
      :value="selectedTour"
    />
    <input
      v-if="tourDuration"
      type="hidden"
      name="duration"
      toolparamdescription="The duration in days of the selected tour"
      :value="tourDuration"
    />
    <input
      type="hidden"
      name="language"
      toolparamdescription="The current language/locale code of the user"
      :value="locale"
    />
  </template>

  <div
    v-if="tourTitle && tourId"
    class="mbe-6"
  >
    <input
      class="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 inline-full"
      type="text"
      name="selectedTourDisplay"
      toolparamdescription="Readonly field showing the selected tour title"
      :value="selectedTour"
      readonly
      :aria-label="t('booking.selectedTour', 'Selected Tour')"
    />
  </div>

  <div
    v-if="excursionTitle && excursionId"
    class="mbe-6"
  >
    <input
      class="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 inline-full"
      type="text"
      name="selectedExcursionDisplay"
      toolparamdescription="Readonly field showing the selected excursion title"
      :value="excursionTitle"
      readonly
      :aria-label="t('booking.selectedExcursion', 'Selected Excursion')"
    />
  </div>

  <BookingPersonalFields :state="state" />

  <BookingTripDetails
    :state="state"
    :locale="locale"
    :calendar-open="calendarOpen"
    :reservation-date="reservationDate"
    @update:calendar-open="emit('update:calendarOpen', $event)"
    @update:reservation-date="emit('update:reservationDate', $event)"
  />
</template>

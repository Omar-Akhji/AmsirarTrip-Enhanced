<script setup lang="ts">
import type { FormState } from "@/lib/form-types";
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

const { state, selectedTour, tourDuration, excursionTitle, locale, calendarOpen, reservationDate } =
  defineProps<Props>();

const emit = defineEmits<{
  "update:calendarOpen": [open: boolean];
  "update:reservationDate": [date: Date | null];
}>();
</script>

<template>
  <div
    v-if="selectedTour"
    class="hidden"
  >
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
    <input
      type="hidden"
      name="selectedTourDisplay"
      toolparamdescription="Readonly field showing the selected tour title"
      :value="selectedTour"
    />
    <input
      v-if="excursionTitle"
      type="hidden"
      name="selectedExcursionDisplay"
      toolparamdescription="Readonly field showing the selected excursion title"
      :value="excursionTitle"
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

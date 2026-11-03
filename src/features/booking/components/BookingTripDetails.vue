<script setup lang="ts">
import { ref, onMounted } from "vue";
import { format as formatDate } from "date-fns";
import CalendarIcon from "lucide-vue-next/dist/esm/icons/calendar";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";
import { cn } from "@/lib/utils";
import EnhancedCalendar from "@/shared/ui/widgets/Calendar.vue";
import NativePopover from "@/shared/ui/widgets/NativePopover.vue";

interface Props {
  state: FormState | null;
  locale: string;
  calendarOpen: boolean;
  reservationDate: Date | null;
}

const { state, locale, calendarOpen, reservationDate } = defineProps<Props>();

const emit = defineEmits<{
  "update:calendarOpen": [open: boolean];
  "update:reservationDate": [date: Date | null];
}>();

const { t } = useTranslation(locale);
const minimumReservationDate = ref<Date | null>(null);

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

onMounted(() => {
  queueMicrotask(() => {
    minimumReservationDate.value = getStartOfToday();
  });
});
</script>

<template>
  <fieldset class="m-0 flex flex-col gap-5 border-0 p-0">
    <legend class="sr-only">
      {{ t("booking.tripDetails", "Trip Details") }}
    </legend>
    <div class="grid items-start gap-5 md:grid-cols-2">
      <div>
        <label
          for="numberOfPeople"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
        >
          {{ t("booking.numberOfPeople", "Number of People") }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <input
          id="numberOfPeople"
          class="h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 font-sans text-sm text-stone-900 transition-colors inline-full focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          type="number"
          name="numberOfPeople"
          toolparamdescription="The total number of people participating in the tour"
          autocomplete="off"
          min="1"
          max="50"
          :aria-invalid="state?.errors?.persons ? 'true' : 'false'"
          :aria-describedby="state?.errors?.persons ? 'numberOfPeople-error' : undefined"
          required
        />
        <p
          v-if="state?.errors?.persons"
          id="numberOfPeople-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors.persons }}
        </p>
      </div>

      <div>
        <label
          for="reservationDate"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
        >
          {{ t("booking.reservationDate", "Select your travel date") }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <NativePopover
          :is-open="calendarOpen"
          :aria-label="t('booking.reservationDate', 'Select your travel date')"
          @update:is-open="emit('update:calendarOpen', $event)"
        >
          <template #trigger>
            <span
              :class="
                cn(
                  'flex h-12 cursor-pointer items-center justify-start rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 text-start font-sans text-sm transition-colors inline-full group-focus-visible:border-orange-500 group-focus-visible:bg-white group-focus-visible:ring-2 group-focus-visible:ring-orange-500/20 pointer-fine:group-hover:border-stone-300 pointer-fine:group-hover:bg-white',
                  !reservationDate && 'text-stone-400',
                  reservationDate && 'text-stone-900',
                  state?.errors?.date && 'border-red-300',
                )
              "
              :aria-describedby="state?.errors?.date ? 'reservationDate-error' : undefined"
            >
              <CalendarIcon class="me-2.5 size-4 shrink-0 text-stone-400" />
              <span v-if="reservationDate">
                {{
                  reservationDate.toLocaleDateString(locale || "en", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                }}
              </span>
              <span v-else>{{ t("booking.reservationDate", "Select your travel date") }}</span>
            </span>
          </template>

          <div class="z-50 outline-hidden inline-auto">
            <EnhancedCalendar
              :key="
                reservationDate ?
                  `${reservationDate.getTime()}-${calendarOpen}`
                : `none-${calendarOpen}`
              "
              v-bind="reservationDate ? { initialDate: reservationDate } : {}"
              :locale="locale"
              :disabled="
                (date: Date) => (minimumReservationDate ? date < minimumReservationDate : false)
              "
              @select="emit('update:reservationDate', $event ?? null)"
              @close="emit('update:calendarOpen', false)"
            />
          </div>
        </NativePopover>

        <input
          id="reservationDate"
          type="hidden"
          name="reservationDate"
          toolparamdescription="The selected start date for the reservation in YYYY-MM-DD format"
          :value="reservationDate ? formatDate(reservationDate, 'yyyy-MM-dd') : ''"
        />
        <p
          v-if="state?.errors?.date"
          id="reservationDate-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors.date }}
        </p>
      </div>
    </div>

    <div class="inline-full">
      <label
        for="message"
        class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700"
      >
        {{ t("booking.message", "Your message") }}
      </label>
      <textarea
        id="message"
        name="message"
        class="rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 py-3 font-sans text-sm text-stone-900 transition-colors inline-full min-block-40 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
        :maxlength="1000"
        toolparamdescription="Any custom requests, message, or notes from the guest regarding the booking"
        autocomplete="off"
        :rows="4"
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

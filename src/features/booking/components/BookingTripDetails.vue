<script setup lang="ts">
import { ref, onMounted } from "vue";
import { format as formatDate } from "date-fns";
import CalendarIcon from "lucide-vue-next/dist/esm/icons/calendar";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";
import { cn } from "@/lib/utils";
import EnhancedCalendar from "@/shared/ui/Calendar.vue";
import NativePopover from "@/shared/ui/NativePopover.vue";

interface Props {
  state: FormState | null;
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
  <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
    <div>
      <label
        for="numberOfPeople"
        class="sr-only"
      >
        {{ t("booking.numberOfPeople", "Number of People") }}
      </label>
      <input
        id="numberOfPeople"
        class="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
        type="number"
        name="numberOfPeople"
        toolparamdescription="The total number of people participating in the tour"
        :placeholder="t('booking.numberOfPeople', 'Number of People')"
        :aria-label="t('booking.numberOfPeople', 'Number of People')"
        autocomplete="off"
        min="1"
        max="50"
        :aria-invalid="state?.errors?.['persons'] ? 'true' : 'false'"
        :aria-describedby="state?.errors?.['persons'] ? 'numberOfPeople-error' : undefined"
        required
      />
      <p
        v-if="state?.errors?.['persons']"
        id="numberOfPeople-error"
        class="mbs-1 text-xs text-red-600"
      >
        {{ state.errors["persons"] }}
      </p>
    </div>

    <div>
      <NativePopover
        :is-open="calendarOpen"
        @update:is-open="emit('update:calendarOpen', $event)"
      >
        <template #trigger>
          <span
            :class="
              cn(
                'flex items-center justify-start rounded-2xl border bg-white px-4 py-3 text-start text-sm font-normal transition-colors block-auto inline-full focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden pointer-fine:hover:bg-neutral-50',
                !reservationDate && 'text-neutral-500',
                state?.errors?.['date'] ? 'border-red-300' : 'border-neutral-200',
              )
            "
            :aria-describedby="state?.errors?.['date'] ? 'reservationDate-error' : undefined"
          >
            <CalendarIcon class="me-2 size-4" />
            <span v-if="reservationDate">
              {{
                reservationDate.toLocaleDateString(locale || "en", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              }}
            </span>
            <span v-else>{{ t("booking.reservationDate") }}</span>
          </span>
        </template>

        <div
          class="z-50 overflow-hidden rounded-2xl border border-neutral-100 bg-white p-0 shadow-2xl ring-1 ring-black/5 outline-hidden inline-auto"
        >
          <EnhancedCalendar
            :key="
              reservationDate ?
                `${reservationDate.getTime()}-${calendarOpen}`
              : `none-${calendarOpen}`
            "
            v-bind="reservationDate ? { initialDate: reservationDate } : {}"
            :disabled="
              (date: Date) => (minimumReservationDate ? date < minimumReservationDate : false)
            "
            @select="emit('update:reservationDate', $event ?? null)"
            @close="emit('update:calendarOpen', false)"
          />
        </div>
      </NativePopover>

      <input
        type="hidden"
        name="reservationDate"
        toolparamdescription="The selected start date for the reservation in YYYY-MM-DD format"
        :value="reservationDate ? formatDate(reservationDate, 'yyyy-MM-dd') : ''"
      />
      <p
        v-if="state?.errors?.['date']"
        id="reservationDate-error"
        class="mbs-1 text-xs text-red-600"
      >
        {{ state.errors["date"] }}
      </p>
    </div>
  </div>

  <div class="inline-full">
    <label
      for="message"
      class="sr-only"
    >
      {{ t("booking.message", "Your message") }}
    </label>
    <textarea
      id="message"
      class="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
      :maxlength="1000"
      name="message"
      toolparamdescription="Any custom requests, message, or notes from the guest regarding the booking"
      :placeholder="t('booking.message', 'Your message')"
      autocomplete="off"
      :rows="4"
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

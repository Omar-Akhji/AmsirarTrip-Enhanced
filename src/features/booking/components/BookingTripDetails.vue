<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/use-translation";
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

const formatIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

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
      {{ t("booking.tripDetails") }}
    </legend>
    <div class="grid items-start gap-5 md:grid-cols-2">
      <div>
        <label
          for="numberOfPeople"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-mist-200"
        >
          {{ t("booking.numberOfPeople") }}
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
              d="M18 9C19.6569 9 21 7.88071 21 6.5C21 5.11929 19.6569 4 18 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M6 9C4.34315 9 3 7.88071 3 6.5C3 5.11929 4.34315 4 6 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M17.1973 15C17.7078 15.5883 18 16.2714 18 17C18 19.2091 15.3137 21 12 21C8.68629 21 6 19.2091 6 17C6 14.7909 8.68629 13 12 13C12.3407 13 12.6748 13.0189 13 13.0553"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M20 19C21.7542 18.6153 23 17.6411 23 16.5C23 15.3589 21.7542 14.3847 20 14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M4 19C2.24575 18.6153 1 17.6411 1 16.5C1 15.3589 2.24575 14.3847 4 14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <input
            id="numberOfPeople"
            class="peer h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:text-mist-100 dark:placeholder:text-mist-500 dark:focus:border-orange-500 dark:focus:bg-white/10"
            :placeholder="t('booking.placeholders.numberOfPeople')"
            type="number"
            name="numberOfPeople"
            toolparamdescription="The total number of people participating in the tour"
            autocomplete="off"
            min="1"
            max="50"
            :aria-invalid="state?.errors?.['persons'] ? 'true' : 'false'"
            :aria-describedby="state?.errors?.['persons'] ? 'numberOfPeople-error' : undefined"
            required
          />
        </div>
        <p
          v-if="state?.errors?.['persons']"
          id="numberOfPeople-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors["persons"] }}
        </p>
      </div>

      <div>
        <label
          for="reservationDate"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-mist-200"
        >
          {{ t("booking.reservationDate") }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <NativePopover
          :is-open="calendarOpen"
          :aria-label="t('booking.reservationDate')"
          @update:is-open="emit('update:calendarOpen', $event)"
        >
          <template #trigger>
            <span
              class="flex h-12 cursor-pointer items-center justify-start rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 text-start font-sans text-sm transition-colors inline-full group-focus-visible:border-orange-500 group-focus-visible:bg-white group-focus-visible:ring-2 group-focus-visible:ring-orange-500/20 dark:border-white/10 dark:bg-white/5 dark:group-focus-visible:border-orange-500 dark:group-focus-visible:bg-white/10 pointer-fine:group-hover:border-stone-300 pointer-fine:group-hover:bg-white dark:pointer-fine:group-hover:border-white/20 dark:pointer-fine:group-hover:bg-white/10"
              :class="[
                reservationDate ?
                  'text-stone-900 dark:text-mist-100'
                : 'text-stone-400 dark:text-mist-500',
                state?.errors?.['date'] && 'border-red-300',
              ]"
              :aria-describedby="state?.errors?.['date'] ? 'reservationDate-error' : undefined"
            >
              <svg
                class="me-2.5 size-4.5 shrink-0 text-stone-400 transition-colors group-hover:text-orange-500 group-focus-visible:text-orange-500 dark:text-mist-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <path
                  d="M7 4V2.5"
                  stroke-linecap="round"
                  stroke="currentColor"
                />
                <path
                  d="M17 4V2.5"
                  stroke-linecap="round"
                  stroke="currentColor"
                />
                <circle
                  cx="16.5"
                  cy="16.5"
                  r="1.5"
                  stroke="currentColor"
                  stroke-linecap="round"
                />
                <path
                  d="M21.5 9H16.625H10.75M5.875 9H2"
                  stroke-linecap="round"
                  stroke="currentColor"
                />
                <path
                  d="M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C20.1752 21.4816 19.3001 21.7706 18 21.8985"
                  stroke-linecap="round"
                  stroke="currentColor"
                />
              </svg>
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
          :value="reservationDate ? formatIsoDate(reservationDate) : ''"
        />
        <p
          v-if="state?.errors?.['date']"
          id="reservationDate-error"
          class="mbs-1 font-sans text-xs text-red-600"
        >
          {{ state.errors["date"] }}
        </p>
      </div>
    </div>

    <div class="inline-full">
      <label
        for="message"
        class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-mist-200"
      >
        {{ t("booking.message") }}
      </label>
      <div class="relative">
        <svg
          class="pointer-events-none absolute inset-s-3.5 top-3.5 size-4.5 text-stone-400 transition-colors peer-focus:text-orange-500 dark:text-mist-400"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 12H9M16 12H12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M16 8H15M12 8H8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M8 16H13"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M3 14V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C20.4816 3.82476 20.7706 4.69989 20.8985 6M21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3.51839 20.1752 3.22937 19.3001 3.10149 18"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <textarea
          id="message"
          name="message"
          class="peer overflow-auto rounded-xl border border-stone-200/90 bg-stone-50/50 py-3 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full min-block-40 placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:text-mist-100 dark:placeholder:text-mist-500 dark:focus:border-orange-500 dark:focus:bg-white/10"
          :placeholder="t('booking.placeholders.message')"
          :maxlength="1000"
          toolparamdescription="Any custom requests, message, or notes from the guest regarding the booking"
          autocomplete="off"
          :rows="4"
          :aria-invalid="state?.errors?.['message'] ? 'true' : 'false'"
          :aria-describedby="state?.errors?.['message'] ? 'message-error' : undefined"
        />
      </div>
      <p
        v-if="state?.errors?.['message']"
        id="message-error"
        class="mbs-1 font-sans text-xs text-red-600"
      >
        {{ state.errors["message"] }}
      </p>
    </div>
  </fieldset>
</template>

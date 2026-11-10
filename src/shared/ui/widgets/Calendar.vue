<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTranslation, getResolvedLocale } from "@/lib/hooks/use-translation";

interface Props {
  initialDate?: Date;
  disabled?: (date: Date) => boolean;
  className?: string;
  locale?: string;
}

const { initialDate, disabled, className = "", locale: explicitLocale } = defineProps<Props>();

const emit = defineEmits<{ select: [date: Date | undefined]; close: [] }>();

const activeLocale = computed(() => getResolvedLocale(explicitLocale));
const { t } = useTranslation(explicitLocale);

const currentMonth = ref<Date>(initialDate ? new Date(initialDate) : new Date());
const selectedDate = ref<Date | undefined>(initialDate);

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
  );
};

const navigateMonth = (direction: "prev" | "next") => {
  const next = new Date(currentMonth.value);
  next.setMonth(next.getMonth() + (direction === "prev" ? -1 : 1));
  currentMonth.value = next;
};

const handleDaySelect = (day: { date: Date; isDisabled: boolean }, event?: MouseEvent) => {
  if (day.isDisabled) return;
  selectedDate.value = day.date;
  if (event?.currentTarget instanceof HTMLElement) {
    event.currentTarget.blur();
  }
};

const goToToday = () => {
  const today = new Date();
  selectedDate.value = today;
  currentMonth.value = today;
  emit("select", today);
  emit("close");
};

const handleApply = () => {
  if (!selectedDate.value) return;
  emit("select", selectedDate.value);
  emit("close");
};

const formattedMonthYear = computed(() => {
  try {
    return new Intl.DateTimeFormat(activeLocale.value, { month: "long", year: "numeric" }).format(
      currentMonth.value,
    );
  } catch {
    return currentMonth.value.toLocaleDateString(activeLocale.value, {
      month: "long",
      year: "numeric",
    });
  }
});

const weekdays = computed(() => {
  try {
    const formatter = new Intl.DateTimeFormat(activeLocale.value, { weekday: "short" });
    // Jan 4, 1970 was a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(1970, 0, 4 + i);
      return formatter.format(d);
    });
  } catch {
    return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  }
});

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return "";
  try {
    return new Intl.DateTimeFormat(activeLocale.value, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(selectedDate.value);
  } catch {
    return selectedDate.value.toLocaleDateString(activeLocale.value);
  }
});

// Generate days grid (42 days)
const days = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();
  const totalDaysInCurrentMonth = new Date(year, month + 1, 0).getDate();

  const result = [];

  // Prev month overflow days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, totalDaysInPrevMonth - i);
    result.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, new Date()),
      isSelected: Boolean(selectedDate.value && isSameDay(d, selectedDate.value)),
      isDisabled: Boolean(disabled && disabled(d)),
    });
  }

  // Current month days
  for (let i = 1; i <= totalDaysInCurrentMonth; i++) {
    const d = new Date(year, month, i);
    result.push({
      date: d,
      isCurrentMonth: true,
      isToday: isSameDay(d, new Date()),
      isSelected: Boolean(selectedDate.value && isSameDay(d, selectedDate.value)),
      isDisabled: Boolean(disabled && disabled(d)),
    });
  }

  // Next month overflow days
  const remaining = 42 - result.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    result.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, new Date()),
      isSelected: Boolean(selectedDate.value && isSameDay(d, selectedDate.value)),
      isDisabled: Boolean(disabled && disabled(d)),
    });
  }

  return result;
});

watch(
  () => initialDate,
  (newDate) => {
    if (!newDate) return;
    selectedDate.value = newDate;
    currentMonth.value = new Date(newDate);
  },
);
</script>

<template>
  <div
    class="relative"
    :class="[className]"
  >
    <div
      class="overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xl ring-1 ring-stone-900/5 dark:border-white/10 dark:bg-surface-card dark:shadow-[0_16px_40px_rgba(0,0,0,0.65)] dark:ring-white/5"
    >
      <div
        class="mbe-4 flex items-center justify-between border-b border-stone-100 pbe-3 dark:border-white/10"
      >
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg text-stone-600 transition-colors focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 dark:text-mist-400 pointer-fine:hover:bg-stone-100 pointer-fine:hover:text-stone-900 dark:pointer-fine:hover:bg-white/10 dark:pointer-fine:hover:text-mist-100"
          :aria-label="t('calendar.prevMonth')"
          @click="navigateMonth('prev')"
        >
          <svg
            class="size-4.5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M15 19L9 12L10.5 10.25M15 5L13 7.33333"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div class="flex items-center">
          <span
            class="font-mono text-sm font-semibold text-stone-900 capitalize dark:text-mist-100"
          >
            {{ formattedMonthYear }}
          </span>
        </div>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg text-stone-600 transition-colors focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 dark:text-mist-400 pointer-fine:hover:bg-stone-100 pointer-fine:hover:text-stone-900 dark:pointer-fine:hover:bg-white/10 dark:pointer-fine:hover:text-mist-100"
          :aria-label="t('calendar.nextMonth')"
          @click="navigateMonth('next')"
        >
          <svg
            class="size-4.5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M9 5L11 7.33333M9 19L15 12L13.5 10.25"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="bg-transparent p-1 inline-fit">
        <div class="flex flex-col gap-3">
          <div class="flex justify-between">
            <span
              v-for="wd in weekdays"
              :key="wd"
              class="w-9 text-center font-mono text-xs font-medium text-stone-400 capitalize"
            >
              {{ wd }}
            </span>
          </div>

          <div class="grid grid-cols-7 justify-items-center gap-1">
            <div
              v-for="(day, idx) in days"
              :key="idx"
              class="group/day relative flex aspect-square items-center justify-center p-0 text-center"
            >
              <button
                type="button"
                :disabled="day.isDisabled"
                :aria-label="
                  day.date.toLocaleDateString(activeLocale.value, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                "
                :aria-current="day.isToday ? 'date' : undefined"
                :aria-pressed="day.isSelected"
                class="relative flex size-9 flex-col items-center justify-center rounded-full p-0 font-mono text-xs transition-colors duration-150 focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1"
                :class="[
                  day.isSelected ?
                    'bg-linear-to-br from-amber-orange to-orange font-bold text-white shadow-2xs shadow-orange/30'
                  : [
                      'text-stone-700',
                      !day.isDisabled ?
                        'pointer-fine:hover:bg-stone-100 pointer-fine:hover:text-stone-900'
                      : '',
                    ],
                  day.isDisabled ? 'cursor-not-allowed text-stone-300 opacity-40' : '',
                  !day.isCurrentMonth && !day.isSelected ? 'text-stone-300' : '',
                  day.isToday && !day.isSelected ? 'font-semibold text-orange-700' : '',
                ]"
                @click="handleDaySelect(day, $event)"
              >
                <span :class="day.isToday ? '-mbs-0.5 leading-none' : 'leading-none'">
                  {{ day.date.getDate() }}
                </span>
                <span
                  v-if="day.isToday"
                  aria-hidden="true"
                  class="absolute bottom-1 size-1 rounded-full"
                  :class="day.isSelected ? 'bg-white' : 'bg-orange-600'"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="selectedDate"
        class="mbs-4 border-t border-stone-100 pbs-3 dark:border-white/10"
      >
        <div
          class="flex items-center gap-3 rounded-lg border border-stone-200/80 bg-stone-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/5"
        >
          <div class="shrink-0 text-orange-600 dark:text-orange-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-5"
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
          </div>
          <div class="flex-1 min-inline-0">
            <p
              class="font-mono text-[11px] font-medium tracking-wider text-stone-500 uppercase dark:text-mist-400"
            >
              {{
                t(
                  initialDate && isSameDay(selectedDate, initialDate) ? "calendar.currentDate" : (
                    "calendar.selectedDate"
                  ),
                )
              }}
            </p>
            <p
              class="truncate font-mono text-xs font-semibold text-stone-900 capitalize dark:text-mist-100"
            >
              {{ formattedSelectedDate }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="mbs-4 flex items-center justify-between gap-2 border-t border-stone-100 pbs-3 dark:border-white/10"
      >
        <button
          type="button"
          class="rounded-lg border border-stone-200/90 bg-stone-50 px-3 py-2 font-mono text-xs font-semibold text-stone-700 transition-colors focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 dark:border-white/10 dark:bg-white/5 dark:text-mist-200 pointer-fine:hover:border-stone-300 pointer-fine:hover:bg-stone-100 dark:pointer-fine:hover:bg-white/10"
          @click="goToToday"
        >
          {{ t("calendar.today") }}
        </button>

        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg border border-stone-200/90 bg-white px-4 py-2 font-mono text-xs font-semibold text-stone-700 transition-colors duration-150 focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 dark:border-white/10 dark:bg-white/5 dark:text-mist-200 pointer-fine:hover:border-stone-300 pointer-fine:hover:bg-stone-50 dark:pointer-fine:hover:bg-white/10"
            @click="emit('close')"
          >
            {{ t("calendar.cancel") }}
          </button>
          <button
            :disabled="!selectedDate || (initialDate && isSameDay(selectedDate, initialDate))"
            type="button"
            class="rounded-lg bg-linear-to-br from-amber-orange to-orange px-4 py-2 font-mono text-xs font-semibold text-white shadow-2xs shadow-orange/20 transition-all duration-150 focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 pointer-fine:hover:shadow-sm pointer-fine:hover:shadow-orange/30 pointer-fine:hover:brightness-105"
            @click="handleApply"
          >
            {{ t("calendar.apply") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

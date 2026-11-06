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
    return currentMonth.value.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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
    return selectedDate.value.toLocaleDateString();
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
      class="overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xl ring-1 ring-stone-900/5"
    >
      <div class="mbe-4 flex items-center justify-between border-b border-stone-100 pbe-3">
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg text-stone-600 transition-colors focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 pointer-fine:hover:bg-stone-100 pointer-fine:hover:text-stone-900"
          :aria-label="t('calendar.prevMonth', 'Previous month')"
          @click="navigateMonth('prev')"
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div class="flex items-center gap-2">
          <svg
            class="size-4 text-orange-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect
              width="18"
              height="18"
              x="3"
              y="4"
              rx="2"
            />
            <path d="M3 10h18" />
          </svg>
          <span class="font-mono text-sm font-semibold text-stone-900 capitalize">
            {{ formattedMonthYear }}
          </span>
        </div>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-lg text-stone-600 transition-colors focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 pointer-fine:hover:bg-stone-100 pointer-fine:hover:text-stone-900"
          :aria-label="t('calendar.nextMonth', 'Next month')"
          @click="navigateMonth('next')"
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
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
                  day.date.toLocaleDateString(activeLocale, {
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
        class="mbs-4 border-t border-stone-100 pbs-3"
      >
        <div
          class="flex items-center gap-3 rounded-lg border border-stone-200/80 bg-stone-50/80 px-4 py-3"
        >
          <div class="shrink-0">
            <div class="size-2 rounded-full bg-linear-to-br from-amber-orange to-orange" />
          </div>
          <div class="flex-1 min-inline-0">
            <p class="font-mono text-[11px] font-medium tracking-wider text-stone-500 uppercase">
              {{
                initialDate && isSameDay(selectedDate, initialDate) ?
                  t("calendar.currentDate", "Current Date")
                : t("calendar.selectedDate", "Selected Date")
              }}
            </p>
            <p class="truncate font-mono text-xs font-semibold text-stone-900 capitalize">
              {{ formattedSelectedDate }}
            </p>
          </div>
        </div>
      </div>

      <div class="mbs-4 flex items-center justify-between gap-2 border-t border-stone-100 pbs-3">
        <button
          type="button"
          class="rounded-lg border border-stone-200/90 bg-stone-50 px-3 py-2 font-mono text-xs font-semibold text-stone-700 transition-colors focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 pointer-fine:hover:border-stone-300 pointer-fine:hover:bg-stone-100"
          @click="goToToday"
        >
          {{ t("calendar.today", "Today") }}
        </button>

        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg border border-stone-200/90 bg-white px-4 py-2 font-mono text-xs font-semibold text-stone-700 transition-colors duration-150 focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 pointer-fine:hover:border-stone-300 pointer-fine:hover:bg-stone-50"
            @click="emit('close')"
          >
            {{ t("calendar.cancel", "Cancel") }}
          </button>
          <button
            :disabled="!selectedDate || (initialDate && isSameDay(selectedDate, initialDate))"
            type="button"
            class="rounded-lg bg-linear-to-br from-amber-orange to-orange px-4 py-2 font-mono text-xs font-semibold text-white shadow-2xs shadow-orange/20 transition-all duration-150 focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 pointer-fine:hover:shadow-sm pointer-fine:hover:shadow-orange/30 pointer-fine:hover:brightness-105"
            @click="handleApply"
          >
            {{ t("calendar.apply", "Apply") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

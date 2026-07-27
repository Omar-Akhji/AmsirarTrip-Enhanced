<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-vue-next";

interface Props {
  initialDate?: Date;
  disabled?: (date: Date) => boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), { className: "" });

interface Emits {
  (e: "select", date: Date | undefined): void;
  (e: "close"): void;
}

const emit = defineEmits<Emits>();

const currentMonth = ref<Date>(props.initialDate ? new Date(props.initialDate) : new Date());
const selectedDate = ref<Date | undefined>(props.initialDate);

// Helper: check if two dates represent the same calendar day
const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
  );
};

// Navigate months
const navigateMonth = (direction: "prev" | "next") => {
  const next = new Date(currentMonth.value);
  next.setMonth(next.getMonth() + (direction === "prev" ? -1 : 1));
  currentMonth.value = next;
};

// Select a day
const handleDaySelect = (day: { date: Date; isDisabled: boolean }) => {
  if (day.isDisabled) return;
  selectedDate.value = day.date;
};

// Go to today
const goToToday = () => {
  const today = new Date();
  selectedDate.value = today;
  currentMonth.value = today;
  emit("select", today);
  emit("close");
};

// Apply selection
const handleApply = () => {
  if (!selectedDate.value) return;
  emit("select", selectedDate.value);
  emit("close");
};

// Generate weekdays
const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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
      isSelected: selectedDate.value ? isSameDay(d, selectedDate.value) : false,
      isDisabled: props.disabled ? props.disabled(d) : false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDaysInCurrentMonth; i++) {
    const d = new Date(year, month, i);
    result.push({
      date: d,
      isCurrentMonth: true,
      isToday: isSameDay(d, new Date()),
      isSelected: selectedDate.value ? isSameDay(d, selectedDate.value) : false,
      isDisabled: props.disabled ? props.disabled(d) : false,
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
      isSelected: selectedDate.value ? isSameDay(d, selectedDate.value) : false,
      isDisabled: props.disabled ? props.disabled(d) : false,
    });
  }

  return result;
});

// Watch initialDate to update state if it changes
watch(
  () => props.initialDate,
  (newDate) => {
    if (!newDate) return;
    selectedDate.value = newDate;
    currentMonth.value = new Date(newDate);
  },
);
</script>

<template>
  <div :class="['relative', className]">
    <div
      class="overflow-hidden rounded-2xl bg-linear-to-br from-white to-orange-50/30 p-5 shadow-2xl ring-1 shadow-orange-900/10 ring-orange-500/20 backdrop-blur-sm"
    >
      <!-- Calendar Header -->
      <div class="mbe-4 flex items-center justify-center gap-4 border-b border-orange-100 pbe-3">
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-full text-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:outline-hidden pointer-fine:hover:bg-orange-50"
          aria-label="Previous month"
          @click="navigateMonth('prev')"
        >
          <ChevronLeft class="size-4" />
        </button>

        <div class="flex items-center gap-2">
          <CalendarIcon class="size-4 text-orange-600" />
          <span class="text-sm font-semibold text-neutral-900">
            {{ currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }) }}
          </span>
        </div>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-full text-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:outline-hidden pointer-fine:hover:bg-orange-50"
          aria-label="Next month"
          @click="navigateMonth('next')"
        >
          <ChevronRight class="size-4" />
        </button>
      </div>

      <!-- Month Daypicker Grid -->
      <div class="bg-transparent p-2 inline-fit">
        <div class="flex flex-col gap-4">
          <!-- Weekday Headers -->
          <div class="flex justify-between">
            <span
              v-for="wd in weekdays"
              :key="wd"
              class="w-9 text-center text-xs font-medium text-muted-foreground"
            >
              {{ wd }}
            </span>
          </div>

          <!-- Days Grid -->
          <div class="grid grid-cols-7 justify-items-center gap-y-1">
            <div
              v-for="(day, idx) in days"
              :key="idx"
              class="group/day relative flex aspect-square items-center justify-center p-0 text-center"
            >
              <button
                type="button"
                :disabled="day.isDisabled"
                :class="[
                  'size-9 rounded-full p-0 text-sm font-normal transition-all duration-200',
                  'pointer-fine:hover:bg-orange-100 pointer-fine:hover:text-orange-900',
                  'focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:outline-hidden',
                  day.isSelected ?
                    'bg-orange-600 font-semibold text-white hover:bg-orange-600 hover:text-white'
                  : '',
                  day.isDisabled ? 'cursor-not-allowed text-muted-foreground/30 opacity-30' : '',
                  !day.isCurrentMonth && !day.isSelected ? 'text-muted-foreground/40' : '',
                  day.isToday ?
                    'relative after:absolute after:inset-s-1/2 after:bottom-1 after:size-1 after:-translate-x-1/2 after:rounded-full after:content-[\'\']'
                  : '',
                  day.isToday && day.isSelected ? 'after:bg-white' : '',
                  day.isToday && !day.isSelected ? 'after:bg-orange-600' : '',
                ]"
                @click="handleDaySelect(day)"
              >
                {{ day.date.getDate() }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Selection Indicator -->
      <div
        v-if="selectedDate"
        class="mbs-4 border-t border-orange-100 pbs-3"
      >
        <div
          class="flex items-center gap-3 rounded-xl border border-orange-200/40 bg-linear-to-r from-orange-50 to-orange-100/50 px-4 py-2.5"
        >
          <div class="shrink-0">
            <div class="size-2 animate-pulse rounded-full bg-orange-600" />
          </div>
          <div class="flex-1 min-inline-0">
            <p class="text-xs font-medium text-neutral-500">
              {{
                initialDate && isSameDay(selectedDate, initialDate) ? "Current Date" : (
                  "New Selection"
                )
              }}
            </p>
            <p class="truncate text-sm font-semibold text-neutral-900">
              {{
                selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="mbs-4 flex items-center justify-between gap-2 border-t border-orange-100 pbs-3">
        <button
          type="button"
          class="rounded-lg border border-orange-200 px-3 py-1.5 text-sm font-medium text-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:outline-hidden pointer-fine:hover:bg-orange-50"
          @click="goToToday"
        >
          Today
        </button>

        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors duration-200 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-hidden pointer-fine:hover:border-neutral-400 pointer-fine:hover:bg-neutral-50"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            :disabled="!selectedDate || (initialDate && isSameDay(selectedDate, initialDate))"
            type="button"
            class="rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 pointer-fine:hover:from-orange-600 pointer-fine:hover:to-orange-700 pointer-fine:hover:shadow-lg disabled:pointer-fine:hover:from-orange-500 disabled:pointer-fine:hover:to-orange-600"
            @click="handleApply"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

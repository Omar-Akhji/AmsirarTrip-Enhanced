<script setup lang="ts">
import { computed, onMounted, ref, useId, useTemplateRef } from "vue";
import type { BookingFormCopy } from "@/lib/form-copy";
import type { FormState } from "@/lib/form-types";

interface Props {
  copy: BookingFormCopy;
  locale: string;
  state: FormState | null;
}

const props = defineProps<Props>();

const calendarPopoverId = `booking-calendar-${useId().replaceAll(":", "")}`;
const calendarAnchorName = `--calendar-anchor-${calendarPopoverId}`;
const calendarPopoverRef = useTemplateRef<HTMLElement>("calendarPopoverRef");

const now = new Date();
const viewYear = ref(now.getFullYear());
const viewMonth = ref(now.getMonth());
const todayIso = ref("");
const committedIso = ref("");
const draftIso = ref("");
const initialIsoOnOpen = ref("");

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(iso: string): Date | null {
  const [yearStr, monthStr, dayStr] = iso.split("-", 3);
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

onMounted(() => {
  const current = new Date();
  todayIso.value = toIsoDate(current);
  viewYear.value = current.getFullYear();
  viewMonth.value = current.getMonth();
});

const resolvedLocale = computed(() => props.locale || "en");

const monthHeaderLabel = computed(() =>
  new Intl.DateTimeFormat(resolvedLocale.value, { month: "long", year: "numeric" }).format(
    new Date(viewYear.value, viewMonth.value, 1),
  ),
);

const weekdayHeaders = computed(() => {
  const formatter = new Intl.DateTimeFormat(resolvedLocale.value, { weekday: "short" });
  return Array.from({ length: 7 }, (_, idx) => formatter.format(new Date(1970, 0, 4 + idx)));
});

const triggerDateLabel = computed(() => {
  const parsed = parseIsoDate(committedIso.value);
  if (!parsed) return "";
  return new Intl.DateTimeFormat(resolvedLocale.value, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
});

const draftDateSummary = computed(() => {
  const parsed = parseIsoDate(draftIso.value);
  if (!parsed) return "";
  return new Intl.DateTimeFormat(resolvedLocale.value, {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  }).format(parsed);
});

const calendarCells = computed(() => {
  const year = viewYear.value;
  const month = viewMonth.value;
  const startOffset = new Date(year, month, 1).getDay();
  const ariaFormatter = new Intl.DateTimeFormat(resolvedLocale.value, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return Array.from({ length: 42 }, (_, idx) => {
    const cellDate = new Date(year, month, 1 - startOffset + idx);
    const iso = toIsoDate(cellDate);
    return {
      ariaLabel: ariaFormatter.format(cellDate),
      dayNumber: cellDate.getDate(),
      inMonth: cellDate.getMonth() === month,
      isDisabled: todayIso.value !== "" && iso < todayIso.value,
      isSelected: draftIso.value === iso,
      isToday: todayIso.value === iso,
      iso,
    };
  });
});

function shiftMonth(delta: -1 | 1): void {
  const next = new Date(viewYear.value, viewMonth.value + delta, 1);
  viewYear.value = next.getFullYear();
  viewMonth.value = next.getMonth();
}

function handlePopoverToggle(event: ToggleEvent): void {
  if (event.newState !== "open") return;
  initialIsoOnOpen.value = committedIso.value;
  draftIso.value = committedIso.value;
  const anchorDate = parseIsoDate(committedIso.value) ?? new Date();
  viewYear.value = anchorDate.getFullYear();
  viewMonth.value = anchorDate.getMonth();
}

function selectDay(iso: string): void {
  draftIso.value = iso;
  committedIso.value = iso;
}

function cancelSelection(): void {
  draftIso.value = initialIsoOnOpen.value;
  committedIso.value = initialIsoOnOpen.value;
  calendarPopoverRef.value?.hidePopover();
}

function selectToday(): void {
  const current = new Date();
  const iso = toIsoDate(current);
  draftIso.value = iso;
  committedIso.value = iso;
  viewYear.value = current.getFullYear();
  viewMonth.value = current.getMonth();
  calendarPopoverRef.value?.hidePopover();
}

function applyDraftDate(): void {
  if (!draftIso.value) return;
  committedIso.value = draftIso.value;
  calendarPopoverRef.value?.hidePopover();
}
</script>

<template>
  <fieldset class="m-0 flex flex-col gap-5 border-0 p-0">
    <legend class="sr-only">
      {{ copy.tripDetails }}
    </legend>
    <div class="grid items-start gap-5 md:grid-cols-2">
      <div>
        <label
          for="numberOfPeople"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-mist-200"
        >
          {{ copy.numberOfPeople }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>
        <div class="group relative">
          <svg
            class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500 dark:text-mist-400"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="9"
              cy="6"
              r="4"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M15 9C16.6569 9 18 7.65685 18 6C18 4.34315 16.6569 3 15 3"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <circle
              cx="17"
              cy="18"
              r="4"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M17 16.6667V18L18 19"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M11 20.8923C10.3677 20.9622 9.70132 21 9 21C5.13401 21 2 19.2091 2 17C2 14.7909 5.13401 13 9 13C10.7482 13 12.3469 13.3662 13.5735 13.972"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
          <input
            id="numberOfPeople"
            class="h-12 rounded-xl border border-stone-200/90 bg-stone-50/50 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full placeholder:text-stone-400 user-invalid:border-red-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden user-invalid:focus:ring-red-400/20 dark:border-white/10 dark:bg-white/5 dark:text-mist-100 dark:placeholder:text-mist-500 dark:focus:border-orange-500 dark:focus:bg-white/10"
            :placeholder="copy.numberOfPeoplePlaceholder"
            type="number"
            name="numberOfPeople"
            toolparamdescription="The total number of people participating in the tour"
            autocomplete="off"
            :min="1"
            :max="50"
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
          for="reservationDate-trigger"
          class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-mist-200"
        >
          {{ copy.reservationDate }}
          <span
            class="text-orange-600"
            aria-hidden="true"
            >*</span
          >
        </label>

        <div class="group relative block inline-full">
          <button
            id="reservationDate-trigger"
            type="button"
            :popovertarget="calendarPopoverId"
            popovertargetaction="toggle"
            :aria-controls="calendarPopoverId"
            aria-haspopup="dialog"
            :aria-describedby="state?.errors?.['date'] ? 'reservationDate-error' : undefined"
            :style="{ anchorName: calendarAnchorName }"
            class="flex h-12 cursor-pointer items-center justify-start rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 text-start font-sans text-sm transition-colors inline-full group-has-[:popover-open]:border-orange-500 group-has-[:popover-open]:bg-white group-has-[:popover-open]:ring-2 group-has-[:popover-open]:ring-orange-500/20 focus:outline-hidden focus-visible:border-orange-500 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-orange-500/20 dark:border-white/10 dark:bg-white/5 dark:group-has-[:popover-open]:border-orange-500 dark:group-has-[:popover-open]:bg-white/10 dark:focus-visible:border-orange-500 dark:focus-visible:bg-white/10 pointer-fine:hover:border-stone-300 pointer-fine:hover:bg-white dark:pointer-fine:hover:border-white/20 dark:pointer-fine:hover:bg-white/10"
            :class="[
              committedIso ?
                'text-stone-900 dark:text-mist-100'
              : 'text-stone-600 dark:text-mist-300',
              state?.errors?.['date'] && 'border-red-300',
            ]"
          >
            <svg
              class="me-2.5 size-4.5 shrink-0 text-stone-400 transition-colors group-focus-within:text-orange-500 group-hover:text-orange-500 group-has-[:popover-open]:text-orange-500 dark:text-mist-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                d="M7 4V2.5M17 4V2.5M21.5 9H16.625H10.75M5.875 9H2M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C20.1752 21.4816 19.3001 21.7706 18 21.8985"
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
            </svg>
            <span>{{ triggerDateLabel || copy.reservationDate }}</span>
          </button>

          <div
            :id="calendarPopoverId"
            ref="calendarPopoverRef"
            popover="auto"
            role="dialog"
            :aria-label="copy.reservationDate"
            :style="{ positionAnchor: calendarAnchorName }"
            class="fixed inset-0 z-50 m-auto border-none bg-transparent p-0 opacity-0 outline-hidden transition-[opacity,transform,display,overlay] transition-discrete duration-200 max-inline-[calc(100vw-2rem)] backdrop:bg-black/20 open:opacity-100 supports-[top:anchor(bottom)]:inset-auto supports-[top:anchor(bottom)]:top-[calc(anchor(bottom)+8px)] supports-[top:anchor(bottom)]:left-[anchor(left)] supports-[top:anchor(bottom)]:m-0 supports-[top:anchor(bottom)]:[position-try-fallbacks:flip-block,flip-inline] supports-[top:anchor(bottom)]:backdrop:bg-transparent starting:open:opacity-0"
            @toggle="handlePopoverToggle"
          >
            <div
              class="overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xl ring-1 ring-stone-900/5 dark:border-white/10 dark:bg-surface-card dark:shadow-[0_16px_40px_rgba(0,0,0,0.65)] dark:ring-white/5"
            >
              <div
                class="mbe-4 flex items-center justify-between border-b border-stone-100 pbe-3 dark:border-white/10"
              >
                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-lg text-stone-600 transition-colors focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 active:bg-stone-100 active:text-stone-900 dark:text-mist-400 dark:active:bg-white/10 dark:active:text-mist-100 pointer-fine:hover:bg-stone-100 pointer-fine:hover:text-stone-900 dark:pointer-fine:hover:bg-white/10 dark:pointer-fine:hover:text-mist-100"
                  :aria-label="copy.calendarLabels.prevMonth"
                  @click="shiftMonth(-1)"
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

                <span
                  class="font-mono text-sm font-semibold text-stone-900 capitalize dark:text-mist-100"
                >
                  {{ monthHeaderLabel }}
                </span>

                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-lg text-stone-600 transition-colors focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 active:bg-stone-100 active:text-stone-900 dark:text-mist-400 dark:active:bg-white/10 dark:active:text-mist-100 pointer-fine:hover:bg-stone-100 pointer-fine:hover:text-stone-900 dark:pointer-fine:hover:bg-white/10 dark:pointer-fine:hover:text-mist-100"
                  :aria-label="copy.calendarLabels.nextMonth"
                  @click="shiftMonth(1)"
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
                      v-for="wd in weekdayHeaders"
                      :key="wd"
                      class="w-9 text-center font-mono text-xs font-medium text-stone-500 capitalize dark:text-mist-400"
                    >
                      {{ wd }}
                    </span>
                  </div>

                  <div class="grid grid-cols-7 justify-items-center gap-1">
                    <div
                      v-for="cell in calendarCells"
                      :key="cell.iso"
                      class="relative flex aspect-square items-center justify-center p-0 text-center"
                    >
                      <button
                        type="button"
                        :disabled="cell.isDisabled"
                        :aria-label="cell.ariaLabel"
                        :aria-current="cell.isToday ? 'date' : undefined"
                        :aria-pressed="cell.isSelected"
                        class="relative flex size-9 flex-col items-center justify-center rounded-full p-0 font-mono text-xs transition-colors duration-150 focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1"
                        :class="[
                          cell.isSelected ?
                            'bg-linear-to-br from-amber-orange to-orange font-bold text-white shadow-2xs shadow-orange/30'
                          : [
                              'text-stone-700 dark:text-mist-200',
                              !cell.isDisabled
                                && 'pointer-fine:hover:bg-stone-100 pointer-fine:hover:text-stone-900 dark:pointer-fine:hover:bg-white/10 dark:pointer-fine:hover:text-mist-100',
                            ],
                          cell.isDisabled
                            && 'cursor-not-allowed text-stone-300 opacity-40 dark:text-mist-500',
                          !cell.inMonth && !cell.isSelected && 'text-stone-300 dark:text-mist-500',
                          cell.isToday
                            && !cell.isSelected
                            && 'font-semibold text-orange-700 dark:text-orange-400',
                        ]"
                        @click="selectDay(cell.iso)"
                      >
                        <span :class="cell.isToday ? '-mbs-0.5 leading-none' : 'leading-none'">
                          {{ cell.dayNumber }}
                        </span>
                        <span
                          v-if="cell.isToday"
                          aria-hidden="true"
                          class="absolute bottom-1 size-1 rounded-full"
                          :class="cell.isSelected ? 'bg-white' : 'bg-orange-600'"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="draftIso"
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
                        d="M7 4V2.5M17 4V2.5M21.5 9H16.625H10.75M5.875 9H2M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12V14C22 17.7712 22 19.6569 20.8284 20.8284C20.1752 21.4816 19.3001 21.7706 18 21.8985"
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
                    </svg>
                  </div>
                  <div class="flex-1 min-inline-0">
                    <p
                      class="font-mono text-[0.6875rem] font-medium tracking-wider text-stone-600 uppercase dark:text-mist-300"
                    >
                      {{
                        initialIsoOnOpen && draftIso === initialIsoOnOpen ?
                          copy.calendarLabels.currentDate
                        : copy.calendarLabels.selectedDate
                      }}
                    </p>
                    <p
                      class="truncate font-mono text-xs font-semibold text-stone-900 capitalize dark:text-mist-100"
                    >
                      {{ draftDateSummary }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="mbs-4 flex items-center justify-between gap-2 border-t border-stone-100 pbs-3 dark:border-white/10"
              >
                <button
                  type="button"
                  data-calendar-today
                  class="rounded-lg border border-stone-200/90 bg-stone-50 px-3 py-2 font-mono text-xs font-semibold text-stone-700 transition-colors focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 dark:border-white/10 dark:bg-white/5 dark:text-mist-200 pointer-fine:hover:border-stone-300 pointer-fine:hover:bg-stone-100 dark:pointer-fine:hover:bg-white/10"
                  @click="selectToday"
                >
                  {{ copy.calendarLabels.today }}
                </button>

                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded-lg border border-stone-200/90 bg-white px-4 py-2 font-mono text-xs font-semibold text-stone-700 transition-colors duration-150 focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 dark:border-white/10 dark:bg-white/5 dark:text-mist-200 pointer-fine:hover:border-stone-300 pointer-fine:hover:bg-stone-50 dark:pointer-fine:hover:bg-white/10"
                    @click="cancelSelection"
                  >
                    {{ copy.calendarLabels.cancel }}
                  </button>
                  <button
                    :disabled="!draftIso"
                    type="button"
                    class="rounded-lg bg-linear-to-br from-amber-orange to-orange px-4 py-2 font-mono text-xs font-semibold text-white shadow-2xs shadow-orange/20 transition-all duration-150 focus:ring-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 pointer-fine:hover:shadow-sm pointer-fine:hover:shadow-orange/30 pointer-fine:hover:brightness-105"
                    @click="applyDraftDate"
                  >
                    {{ copy.calendarLabels.apply }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <input
          id="reservationDate"
          type="hidden"
          name="reservationDate"
          toolparamdescription="The selected start date for the reservation in YYYY-MM-DD format"
          :value="committedIso"
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

    <div>
      <label
        for="message"
        class="mbe-1.5 block font-sans text-xs font-semibold tracking-wide text-stone-700 dark:text-mist-200"
      >
        {{ copy.message }}
      </label>
      <div class="group relative">
        <svg
          class="pointer-events-none absolute inset-s-3.5 top-3.5 size-4.5 text-stone-400 transition-colors group-focus-within:text-orange-500 dark:text-mist-400"
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
          class="field-sizing-content overflow-auto rounded-xl border border-stone-200/90 bg-stone-50/50 py-3 ps-10.5 pe-4 font-sans text-sm text-stone-900 transition-colors inline-full max-block-80 min-block-40 placeholder:text-stone-400 user-invalid:border-red-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden user-invalid:focus:ring-red-400/20 dark:border-white/10 dark:bg-white/5 dark:text-mist-100 dark:placeholder:text-mist-500 dark:focus:border-orange-500 dark:focus:bg-white/10"
          :placeholder="copy.messagePlaceholder"
          :maxlength="1000"
          toolparamdescription="Any custom requests, message, or notes from the guest regarding the booking"
          autocomplete="off"
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

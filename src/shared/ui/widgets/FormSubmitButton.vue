<script setup lang="ts">
import type { SubmitFeedback } from "@/lib/hooks/use-submit-feedback";

interface Props {
  feedback: SubmitFeedback | null;
  idleLabel: string;
  isSubmitting: boolean;
  sendingLabel: string;
}

defineProps<Props>();
</script>

<template>
  <button
    type="submit"
    class="group inline-flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-full border py-1.5 ps-5 pe-1.5 font-mono text-xs font-semibold tracking-wider uppercase shadow-lg shadow-black/25 transition-colors duration-200 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-4 sm:ps-6 sm:pe-2"
    :class="
      feedback?.kind === 'success' ?
        'border-emerald-500/40 bg-emerald-950 text-emerald-50 hover:bg-emerald-900 dark:border-emerald-600/40 dark:bg-emerald-50 dark:text-emerald-950 dark:hover:bg-emerald-100'
      : feedback?.kind === 'error' ?
        'border-red-500/40 bg-red-950 text-red-50 hover:bg-red-900 dark:border-red-600/40 dark:bg-red-50 dark:text-red-950 dark:hover:bg-red-100'
      : 'border-white/10 bg-slate-950 text-white hover:border-white/20 hover:bg-black dark:border-stone-300 dark:bg-white dark:text-dark-surface dark:hover:bg-white'
    "
    :disabled="isSubmitting"
    :aria-busy="isSubmitting"
  >
    <span
      aria-live="polite"
      :role="feedback ? 'status' : undefined"
      :class="
        feedback ?
          'text-start leading-snug tracking-normal whitespace-normal normal-case'
        : 'truncate'
      "
    >
      {{
        isSubmitting ? sendingLabel
        : feedback ? feedback.message
        : idleLabel
      }}
    </span>
    <span
      class="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-white shadow-xs transition-transform duration-300 ease-out group-hover:scale-105 group-active:scale-95"
      :class="
        feedback?.kind === 'success' ?
          'bg-linear-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/40'
        : feedback?.kind === 'error' ? 'bg-linear-to-br from-red-500 to-red-600 shadow-red-500/40'
        : 'bg-linear-to-br from-amber-orange to-orange shadow-orange/40'
      "
    >
      <svg
        v-if="isSubmitting"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-4.5 animate-spin"
        aria-hidden="true"
      >
        <path
          d="M3.67981 13L3.67981 11.3333C3.67981 6.73096 7.4402 3 12.0789 3C12.2201 3 12.3605 3.00346 12.5 3.01029M2 11.3333L3.67981 13L5.35962 11.3333M19.2545 7C18.567 5.88176 17.6215 4.9368 16.5 4.2466"
        />
        <path
          d="M20.3137 11V12.6667C20.3137 17.269 16.5389 21 11.8825 21C11.7543 21 11.6268 20.9972 11.5 20.9916M21.9999 12.6667L20.3137 11L18.6274 12.6667M4.67944 17C5.38086 18.1366 6.34989 19.0942 7.5 19.7872"
        />
      </svg>

      <svg
        v-else-if="feedback?.kind === 'success'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-4.5"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>

      <svg
        v-else-if="feedback?.kind === 'error'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke-width="1.5"
        class="size-4.5"
        aria-hidden="true"
      >
        <path
          d="M12 7V13"
          stroke-linecap="round"
          stroke="currentColor"
        />
        <path
          d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
          stroke-linecap="round"
          stroke="currentColor"
        />
        <path
          d="M12 16H12.0001"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke="currentColor"
        />
      </svg>

      <span
        v-else
        class="relative flex size-full items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="absolute size-4.5 transition-all duration-300 ease-out group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:opacity-0 rtl:-scale-x-100 rtl:group-hover:-translate-x-3"
          aria-hidden="true"
        >
          <path d="M18 15V6H9M18 6L11.5 12.5M6 18L8.5 15.5" />
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="absolute size-4.5 -translate-x-3 translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-0 group-hover:opacity-100 rtl:translate-x-3 rtl:-scale-x-100 rtl:group-hover:translate-x-0"
          aria-hidden="true"
        >
          <path d="M14 18L20 12L14 6M20 12H9.5M4 12H6.5" />
        </svg>
      </span>
    </span>
  </button>
</template>

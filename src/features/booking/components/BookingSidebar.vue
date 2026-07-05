<script setup lang="ts">
import { useTranslation } from "@/lib/hooks/useTranslation";
import Image from "@/shared/ui/Image.vue";

interface Perk {
  id: string;
  text: string;
}

interface Props {
  perks: Perk[];
}

defineProps<Props>();

const { t } = useTranslation();
</script>

<template>
  <aside class="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white block-full lg:p-8">
    <div
      class="absolute -inset-e-10 -top-20 rounded-full bg-orange-500/30 blur-3xl block-48 inline-48"
      aria-hidden="true"
    />
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-slate-900)_0%,rgba(15,23,42,0.6)_55%,transparent_90%)] opacity-90"
      aria-hidden="true"
    />

    <div class="relative flex flex-col gap-8">
      <div class="flex flex-col items-center gap-3 text-center">
        <p class="text-[11px] font-semibold tracking-[0.45em] text-amber-200 uppercase">
          {{ t("booking.checkBadge", "Check us") }}
        </p>
        <h3 class="mbs-1 mbe-4 text-xl font-semibold sm:text-2xl">
          {{ t("booking.checkTitle", "Find us on TripAdvisor") }}
        </h3>
        <div
          class="inline-flex items-center justify-center rounded-full border-2 border-white/20 bg-white/5 p-4 ring-1 ring-white/10 block-32 inline-32"
        >
          <Image
            src="/icons/tripadvisor-nav_icon.svg"
            :alt="t('booking.tripadvisorAlt', 'TripAdvisor icon')"
            :width="48"
            :height="48"
            class-name="object-contain block-20 inline-20"
          />
        </div>
      </div>

      <div class="mx-auto flex items-center gap-3 rounded-2xl bg-white/5 p-3 inline-fit">
        <div class="text-2xl leading-none font-extrabold">4.5</div>
        <div class="text-xs text-slate-200">
          {{ t("booking.ratingLabel", "Average guest rating") }}
          <span class="block text-[10px] text-amber-200">
            {{ t("booking.reviewCount", "Based on 180+ travellers") }}
          </span>
        </div>
      </div>

      <p class="text-sm text-slate-100">
        {{
          t(
            "booking.checkCopy",
            "Read honest reviews and, if you prefer, request your booking directly through our TripAdvisor listing.",
          )
        }}
      </p>

      <ul class="grid gap-6 text-sm">
        <li
          v-for="(perk, index) in perks"
          :key="perk.id"
          class="inline-flex items-center gap-3"
        >
          <span
            class="inline-flex items-center justify-center rounded-full bg-white/15 text-xs font-semibold block-6 inline-6"
          >
            {{ index + 1 }}
          </span>
          <span class="flex-1 text-slate-100">{{ perk.text }}</span>
        </li>
      </ul>

      <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="https://www.tripadvisor.de/Attraction_Review-g293734-d32584739-Reviews-Amsirar_Travel-Marrakech_Marrakech_Safi.html"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex transform items-center justify-center gap-2 rounded-full bg-tripadvisor-bright px-4 py-2 text-sm font-semibold text-black transition duration-300 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tripadvisor-bright pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:bg-tripadvisor-dark pointer-fine:hover:shadow-lg"
          :aria-label="t('booking.tripadvisorCtaAria', 'Open TripAdvisor in new tab')"
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t("booking.checkCta", "Check reviews & book") }}</span>
        </a>
      </div>
    </div>
  </aside>
</template>

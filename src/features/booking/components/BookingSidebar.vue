<script setup lang="ts">
import { useTranslation } from "@/lib/hooks/use-translation";
import Image from "@/shared/ui/Image.vue";
import { ExternalLink } from "lucide-vue-next";

interface Perk {
  id: string;
  text: string;
}

interface Props {
  perks: Perk[];
}

const { perks } = defineProps<Props>();

const { t } = useTranslation();
</script>

<template>
  <aside
    class="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-6 text-white shadow-xl block-full lg:p-8"
  >
    <div
      class="absolute -inset-e-10 -inset-bs-20 size-48 rounded-full bg-orange/20 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.7)_0%,rgba(15,23,42,0.85)_55%,transparent_90%)] opacity-90"
      aria-hidden="true"
    />

    <div class="relative flex flex-col gap-8">
      <div class="flex flex-col items-center gap-3 text-center">
        <p class="font-sans text-xs font-bold tracking-[0.2em] text-orange-300 uppercase">
          {{ t("booking.checkBadge", "Check us") }}
        </p>
        <h3 class="mbs-1 font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
          {{ t("booking.checkTitle", "Find us on TripAdvisor") }}
        </h3>
        <div
          class="inline-flex size-36 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 p-4 shadow-inner ring-1 ring-white/10"
        >
          <Image
            src="/icons/tripadvisor-nav_icon.svg"
            :alt="t('booking.tripadvisorAlt', 'TripAdvisor icon')"
            :width="96"
            :height="96"
            class-name="object-contain size-24"
          />
        </div>
      </div>

      <div
        class="mx-auto flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
      >
        <div class="font-mono text-2xl leading-none font-extrabold text-amber-300 tabular-nums">
          5.0
        </div>
        <div class="font-sans text-xs text-slate-200">
          {{ t("booking.ratingLabel", "Average guest rating") }}
          <span class="block font-sans text-xs font-medium text-amber-200">
            {{ t("booking.reviewCount", "Based on verified traveller dispatches") }}
          </span>
        </div>
      </div>

      <p class="font-sans text-sm leading-relaxed text-slate-200">
        {{
          t(
            "booking.checkCopy",
            "Read honest reviews and, if you prefer, request your booking directly through our TripAdvisor listing.",
          )
        }}
      </p>

      <ul class="grid gap-4 font-sans text-sm">
        <li
          v-for="(perk, index) in perks"
          :key="perk.id"
          class="inline-flex items-center gap-3"
        >
          <span
            class="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 font-mono text-xs font-bold text-orange-300 tabular-nums"
          >
            {{ index + 1 }}
          </span>
          <span class="flex-1 font-sans text-xs leading-relaxed text-slate-100 sm:text-sm">{{
            perk.text
          }}</span>
        </li>
      </ul>

      <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="https://www.tripadvisor.com/Attraction_Review-g293734-d32584739-Reviews-Amsirar_Travel-Marrakech_Marrakech_Safi.html"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#00af87] px-6 py-3 font-sans text-xs font-semibold tracking-wider text-white uppercase shadow-md shadow-[#00af87]/20 transition-all duration-200 hover:bg-[#008f6d] hover:shadow-lg hover:shadow-[#00af87]/30 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#34e0a1] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-hidden active:scale-[0.98] pointer-fine:hover:-translate-y-0.5"
          :aria-label="t('booking.tripadvisorCtaAria', 'Open TripAdvisor reviews in new tab')"
        >
          <span>{{ t("booking.checkCta", "Check reviews & book") }}</span>
          <ExternalLink
            class="size-4"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  </aside>
</template>

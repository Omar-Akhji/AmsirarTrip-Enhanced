<script setup lang="ts">
import { useTranslation } from "@/lib/hooks/useTranslation";

const { t } = useTranslation();
</script>

<template>
  <div>
    <p class="text-xs font-semibold tracking-[0.45em] text-orange-200 uppercase">
      {{ t("contact.form.infoBadge", "Need details?") }}
    </p>
    <h3 class="mbs-3 text-2xl font-semibold sm:text-3xl">
      {{ t("contact.form.infoTitle", "Plan handcrafted experiences") }}
    </h3>
    <p class="mbs-4 text-sm text-slate-200">
      {{
        t(
          "contact.form.infoCopy",
          "Our Marrakech team answers every message personally and can help with custom itineraries, desert camps, or last-minute transfers.",
        )
      }}
    </p>
  </div>

  <ul class="mbs-8 space-y-6 text-sm">
    <!-- Visit Item -->
    <li class="grid grid-cols-[48px_1fr] items-start gap-4">
      <span
        class="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-sm leading-none font-semibold text-orange-300"
      >
        01
      </span>
      <div class="self-start">
        <p class="text-xs tracking-wide text-slate-300 uppercase">
          {{ t("contact.form.info.address", "Visit") }}
        </p>
        <p class="mbs-1 text-base text-white">
          Imm. J appt N° 5, Résidence La Perle de l'Atlas, angle Rue aboubakr, Marrakech
        </p>
      </div>
    </li>

    <!-- Call Item -->
    <li class="grid grid-cols-[48px_1fr] items-start gap-4">
      <span
        class="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-sm leading-none font-semibold text-orange-300"
      >
        02
      </span>
      <div class="self-start">
        <p class="text-xs tracking-wide text-slate-300 uppercase">
          {{ t("contact.form.info.phone", "Call") }}
        </p>
        <a
          class="mbs-1 block text-base text-white pointer-fine:hover:text-orange-300"
          href="tel:+21266173144"
        >
          +212 (0) 6 61 17 31 44
        </a>
        <a
          class="mbs-1 block text-base text-white/80 pointer-fine:hover:text-orange-300"
          href="tel:+212566173144"
        >
          +212 (0) 5 6 61 73 14 44
        </a>
      </div>
    </li>

    <!-- Email Item -->
    <li class="grid grid-cols-[48px_1fr] items-start gap-4">
      <span
        class="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-sm leading-none font-semibold text-orange-300"
      >
        03
      </span>
      <div class="self-start">
        <p class="text-xs tracking-wide text-slate-300 uppercase">
          {{ t("contact.form.info.email", "Email") }}
        </p>
        <a
          class="break-anywhere mbs-1 block text-base text-white pointer-fine:hover:text-orange-300"
          href="mailto:amsirare@gmail.com"
        >
          amsirare@gmail.com
        </a>
      </div>
    </li>
  </ul>

  <p class="mbs-8 text-xs text-slate-400">
    {{ t("contact.form.infoFooter", "Available every day from 09:00 to 21:00 GMT+1") }}
  </p>
</template>

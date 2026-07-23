<script setup lang="ts">
import agencyProfile from "@/data/agency-profile.json";
import { useTranslation } from "@/lib/hooks/use-translation";

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
          {{ agencyProfile.address.fullAddress }}
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
          v-for="phone in agencyProfile.contact.phones"
          :key="phone.value"
          class="mbs-1 block text-base text-white pointer-fine:hover:text-orange-300"
          :href="`tel:${phone.value}`"
        >
          {{ phone.display }}
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
          v-for="email in agencyProfile.contact.emails"
          :key="email"
          class="break-anywhere mbs-1 block text-base text-white pointer-fine:hover:text-orange-300"
          :href="`mailto:${email}`"
        >
          {{ email }}
        </a>
      </div>
    </li>
  </ul>

  <p class="mbs-8 text-xs text-slate-400">
    {{
      t("contact.form.infoFooter", `Available every day from ${agencyProfile.contact.workingHours}`)
    }}
  </p>
</template>

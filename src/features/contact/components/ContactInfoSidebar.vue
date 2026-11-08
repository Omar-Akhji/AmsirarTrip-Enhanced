<script setup lang="ts">
import agencyProfile from "@/data/agency-profile.json";
import { useTranslation } from "@/lib/hooks/use-translation";

const { t } = useTranslation();
</script>

<template>
  <hgroup>
    <p class="font-mono text-xs font-semibold tracking-[0.45em] text-orange-200 uppercase">
      {{ t("contact.form.infoBadge") }}
    </p>
    <h3 class="mbs-3 text-2xl font-semibold sm:text-3xl">
      {{ t("contact.form.infoTitle") }}
    </h3>
    <p class="mbs-4 font-mono text-xs leading-relaxed text-slate-200 sm:text-sm">
      {{ t("contact.form.infoCopy") }}
    </p>
  </hgroup>

  <address class="not-italic">
    <ul class="mbs-8 space-y-6 text-sm">
      <!-- Visit Item -->
      <li class="grid grid-cols-[48px_1fr] items-start gap-4">
        <span
          class="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 font-mono text-sm leading-none font-bold text-orange-300 tabular-nums"
        >
          01
        </span>
        <div class="self-start">
          <p class="font-mono text-xs tracking-wide text-slate-300 uppercase">
            {{ t("contact.form.info.address") }}
          </p>
          <p class="mbs-1 font-mono text-xs leading-relaxed text-white sm:text-sm">
            {{ agencyProfile.address.fullAddress }}
          </p>
        </div>
      </li>

      <!-- Call Item -->
      <li class="grid grid-cols-[48px_1fr] items-start gap-4">
        <span
          class="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 font-mono text-sm leading-none font-bold text-orange-300 tabular-nums"
        >
          02
        </span>
        <div class="self-start">
          <p class="font-mono text-xs tracking-wide text-slate-300 uppercase">
            {{ t("contact.form.info.phone") }}
          </p>
          <a
            v-for="phone in agencyProfile.contact.phones"
            :key="phone.value"
            class="mbs-1 block font-mono text-xs text-white tabular-nums sm:text-sm pointer-fine:hover:text-orange-300"
            :href="`tel:${phone.value}`"
          >
            {{ phone.display }}
          </a>
        </div>
      </li>

      <!-- Email Item -->
      <li class="grid grid-cols-[48px_1fr] items-start gap-4">
        <span
          class="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 font-mono text-sm leading-none font-bold text-orange-300 tabular-nums"
        >
          03
        </span>
        <div class="self-start">
          <p class="font-mono text-xs tracking-wide text-slate-300 uppercase">
            {{ t("contact.form.info.email") }}
          </p>
          <a
            v-for="email in agencyProfile.contact.emails"
            :key="email"
            class="mbs-1 block font-mono text-xs wrap-anywhere text-white sm:text-sm pointer-fine:hover:text-orange-300"
            :href="`mailto:${email}`"
          >
            {{ email }}
          </a>
        </div>
      </li>
    </ul>
  </address>

  <p class="mbs-8 font-mono text-xs text-slate-400">
    {{ t("contact.form.infoFooter") }}
  </p>
</template>

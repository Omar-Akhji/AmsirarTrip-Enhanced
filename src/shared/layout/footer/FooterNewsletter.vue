<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue";
import { Mail } from "lucide-vue-next";
import { useTranslation } from "@/lib/hooks/useTranslation";

const { t } = useTranslation();
const isModalOpen = ref(false);

const NewsletterModal = defineAsyncComponent(() => import("./NewsletterModal.vue"));
</script>

<template>
  <div
    class="md:col-span-2 lg:col-span-1"
    data-animate="fade-up"
    style="transition-delay: 300ms"
  >
    <h3 class="mbe-2 text-sm font-semibold tracking-wider text-white uppercase">
      {{ t("footer.newsletter") }}
    </h3>
    <span class="mbe-6 block rounded bg-orange block-1 inline-12" />
    <div
      class="rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/2 p-4 backdrop-blur-sm"
    >
      <p class="mbe-4 text-sm leading-relaxed text-zinc-400">
        {{ t("footer.newsletterDescription") }}
      </p>
      <button
        type="button"
        :aria-label="t('footer.newsletterButtonAria')"
        class="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange to-amber-500 text-sm font-semibold text-white shadow-md transition-all duration-300 block-10 inline-full active:scale-[0.98] pointer-fine:hover:scale-[1.02] pointer-fine:hover:shadow-lg pointer-fine:hover:shadow-orange-500/30"
        @click="isModalOpen = true"
      >
        <Mail class="size-4" />
        {{ t("footer.newsletterSubscribe") }}
      </button>

      <!-- FooterSocialLinks -->
      <nav
        :aria-label="t('footer.socialAria')"
        class="mbs-4"
      >
        <ul class="flex flex-wrap items-center justify-center gap-3">
          <li>
            <a
              href="https://www.facebook.com/profile.php?id=61571322141368"
              :aria-label="t('footer.social.facebook')"
              class="inline-flex size-10 items-center justify-center rounded-full bg-white text-center transition-[transform_0.12s_ease,box-shadow_0.12s_ease] sm:size-11 pointer-fine:hover:-translate-y-1 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 320 512"
                class="size-4 text-dark-grey sm:size-4.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4.4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z"
                />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://x.com/AmsirarTravel"
              :aria-label="t('footer.social.twitter')"
              class="inline-flex size-10 items-center justify-center rounded-full bg-white text-center transition-[transform_0.12s_ease,box-shadow_0.12s_ease] sm:size-11 pointer-fine:hover:-translate-y-1 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 512 512"
                class="size-4 text-dark-grey sm:size-4.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
                />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/amsirar.trip?igsh=ZDlxanNsbTA5M2Zi"
              :aria-label="t('footer.social.instagram')"
              class="inline-flex size-10 items-center justify-center rounded-full bg-white text-center transition-[transform_0.12s_ease,box-shadow_0.12s_ease] sm:size-11 pointer-fine:hover:-translate-y-1 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 448 512"
                class="size-4 text-dark-grey sm:size-4.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://www.tiktok.com/@amsirartrip"
              :aria-label="t('footer.social.tiktok')"
              class="inline-flex size-10 items-center justify-center rounded-full bg-white text-center transition-[transform_0.12s_ease,box-shadow_0.12s_ease] sm:size-11 pointer-fine:hover:-translate-y-1 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 448 512"
                class="size-4 text-dark-grey sm:size-4.5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M448 209.9a210.1 210.1 0 0 1-122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"
                />
              </svg>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Lazy loaded modal -->
    <NewsletterModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>

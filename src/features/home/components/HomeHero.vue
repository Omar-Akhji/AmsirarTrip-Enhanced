<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Link } from "@/i18n/routing";
import { useMediaQuery, useTranslation } from "@/lib/hooks";

interface Props {
  images: string[];
}

const props = defineProps<Props>();

const { t } = useTranslation();
const currentImageIndex = ref(0);
const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
const heroTitle = t("home.heroTitle");
const heroAlt1 = t("home.heroAlt1");
const heroAlt2 = t("home.heroAlt2");

const phrases = [heroTitle || "", heroAlt1 || "", heroAlt2 || ""];
const currentPhraseIndex = ref(0);

// --- Typing Animation ---
const displayedText = ref(prefersReducedMotion.value ? phrases[0] || "" : "");
let typingTimeout: ReturnType<typeof setTimeout>;

function startTypingAnimation() {
  if (prefersReducedMotion.value) return;

  let isDeleting = false;
  let textIndex = 0;

  function tick() {
    const fullText = phrases[currentPhraseIndex.value] || "";

    if (!isDeleting) {
      // Typing
      displayedText.value = fullText.slice(0, textIndex + 1);
      textIndex++;

      if (textIndex === fullText.length) {
        // Pause for 2.5 seconds at the end of typing
        isDeleting = true;
        typingTimeout = setTimeout(tick, 2500);
      } else {
        // Smooth typing speed (around 90ms - 130ms per char)
        typingTimeout = setTimeout(tick, 90 + Math.random() * 40);
      }
    } else {
      // Erasing
      displayedText.value = fullText.slice(0, textIndex - 1);
      textIndex--;

      if (textIndex === 0) {
        isDeleting = false;
        // Move to the next phrase in the list
        currentPhraseIndex.value = (currentPhraseIndex.value + 1) % phrases.length;
        // Pause for 1.0 second when fully erased before typing next phrase
        typingTimeout = setTimeout(tick, 1000);
      } else {
        // Smooth deleting speed (faster than typing, around 45ms per char)
        typingTimeout = setTimeout(tick, 45);
      }
    }
  }

  tick();
}

// --- Carousel ---
let carouselInterval: ReturnType<typeof setInterval>;

onMounted(() => {
  if (prefersReducedMotion.value) {
    currentImageIndex.value = 0;
    return;
  }
  carouselInterval = setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length;
  }, 5000);

  startTypingAnimation();
});

onUnmounted(() => {
  clearInterval(carouselInterval);
  clearTimeout(typingTimeout);
});
</script>

<template>
  <section
    ref="headerRef"
    class="page-hero home-header relative isolate overflow-hidden bg-zinc-950 text-white shadow-xl inline-full min-block-[40vh] sm:min-block-[45vh] lg:min-block-[50vh]"
    aria-labelledby="hero-heading"
  >
    <div class="absolute inset-0 z-0">
      <div
        v-for="(img, index) in images"
        :key="img"
        :class="[
          'absolute inset-0 transition-opacity duration-1000 ease-in-out',
          index === currentImageIndex ? 'opacity-100' : 'opacity-0',
        ]"
      >
        <img
          :src="img"
          alt=""
          :loading="index === 0 ? 'eager' : 'lazy'"
          :fetchpriority="index === 0 ? 'high' : 'low'"
          decoding="async"
          class="size-full object-cover"
        />
      </div>
    </div>
    <div class="absolute inset-0 z-10 bg-linear-to-b from-black/60 via-black/30 to-black/70" />
    <div
      class="relative z-20 mx-auto flex flex-col items-center justify-center gap-12 px-4 pbs-8 pbe-16 text-center inline-full max-inline-7xl lg:py-20"
    >
      <div class="flex-1 space-y-6 pbs-0 text-center lg:pbs-8">
        <div class="flex items-center justify-center gap-4">
          <span class="bg-orange-400/60 block-px inline-8 sm:inline-12" />
          <p
            class="text-xs font-semibold tracking-[0.2em] text-orange-300 uppercase sm:tracking-[0.3em]"
          >
            {{ t("home.title") }}
          </p>
          <span class="bg-orange-400/60 block-px inline-8 sm:inline-12" />
        </div>
        <h1
          id="hero-heading"
          class="lg:text-shadow-xl text-3xl leading-tight font-semibold text-shadow-black/60 text-shadow-lg sm:text-4xl lg:text-5xl"
        >
          <span class="inline-flex items-center">
            <span class="relative inline-block align-bottom whitespace-nowrap pe-2 text-left">
              <!-- Invisible placeholder to reserve layout width and prevent layout shifts -->
              <span class="invisible select-none pointer-events-none" aria-hidden="true">
                {{ phrases[currentPhraseIndex] }}
              </span>
              <!-- Absolutely positioned container for the actual typed text and cursor -->
              <span class="absolute inset-y-0 left-0 flex items-center">
                <span class="text-white">{{ displayedText }}</span>
                <span
                  v-if="!prefersReducedMotion"
                  aria-hidden="true"
                  class="will-change-opacity ms-1 inline-block h-[1em] w-0.75 animate-cursor-blink bg-orange-400/90"
                />
              </span>
            </span>
          </span>
        </h1>
        <p class="font-fancy text-lg text-zinc-200 lg:text-xl">{{ t("home.heroSubtitle") }}</p>
        <div class="flex flex-wrap items-center justify-center gap-4 pbs-2">
          <Link
            href="/tours"
            class="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white/90 transition text-shadow-xs sm:px-8 pointer-fine:hover:bg-white/10"
          >
            {{ t("home.exploreOurTours") }}
          </Link>
          <Link
            href="/contact"
            class="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition text-shadow-xs sm:px-8 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:bg-white/20"
          >
            {{ t("home.contactForMore") }}
          </Link>
        </div>
      </div>
    </div>
  </section>
</template>

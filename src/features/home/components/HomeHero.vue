<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Link } from "@/i18n/routing";
import { useMediaQuery, useTranslation } from "@/lib/hooks";

interface Props {
  images: string[];
}

const props = defineProps<Props>();

const { t } = useTranslation();
const currentImageIndex = ref(0);
const isMobileOrTablet = useMediaQuery("(max-width: 1023px)"); // ref<boolean>

const typed = ref("");
const textState = ref({ index: 0, isFading: false });

const heroTexts = [
  t("home.heroTitle"),
  t("home.heroAlt1", "Adventure Awaits Beyond the Dunes"),
  t("home.heroAlt2", "Pack your bags — Morocco calls"),
];

// Carousel image rotation
let carouselInterval: ReturnType<typeof setInterval>;
onMounted(() => {
  carouselInterval = setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length;
  }, 5000);
});

onUnmounted(() => {
  clearInterval(carouselInterval);
});

// Animations
const headerRef = ref<HTMLElement | null>(null);

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let lastUpdate = 0;
let pauseUntil = 0;
let rafId: number;
let isVisible = false;
let observer: IntersectionObserver | null = null;

const TYPING_SPEED = 80;
const DELETING_SPEED = 40;
const PAUSE_AFTER_TYPING = 2000;
const PAUSE_AFTER_DELETING = 300;

function animate(timestamp: number) {
  if (!isVisible) return;

  if (pauseUntil > 0) {
    if (timestamp < pauseUntil) {
      rafId = requestAnimationFrame(animate);
      return;
    }
    pauseUntil = 0;
  }

  const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;

  if (timestamp - lastUpdate >= speed) {
    lastUpdate = timestamp;
    const current = heroTexts[textIndex] || "";

    if (isDeleting) {
      charIndex = Math.max(0, charIndex - 1);
      typed.value = current.slice(0, charIndex);

      if (charIndex <= 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % heroTexts.length;
        pauseUntil = timestamp + PAUSE_AFTER_DELETING;
      }
    } else {
      charIndex = Math.min(current.length, charIndex + 1);
      typed.value = current.slice(0, charIndex);

      if (charIndex >= current.length) {
        isDeleting = true;
        pauseUntil = timestamp + PAUSE_AFTER_TYPING;
      }
    }
  }

  rafId = requestAnimationFrame(animate);
}

// Fade effect for mobile
let fadeInterval: ReturnType<typeof setInterval>;
let fadeTimeout: ReturnType<typeof setTimeout>;

const startMobileAnimation = () => {
  fadeInterval = setInterval(() => {
    textState.value.isFading = true;
    fadeTimeout = setTimeout(() => {
      textState.value.index = (textState.value.index + 1) % heroTexts.length;
      textState.value.isFading = false;
    }, 500);
  }, 4000);
};

const stopMobileAnimation = () => {
  clearInterval(fadeInterval);
  clearTimeout(fadeTimeout);
};

const startDesktopAnimation = () => {
  if (!headerRef.value) return;

  observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry?.isIntersecting ?? false;
      if (isVisible) {
        lastUpdate = performance.now();
        rafId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(rafId);
      }
    },
    { threshold: 0 },
  );

  observer.observe(headerRef.value);
};

const stopDesktopAnimation = () => {
  cancelAnimationFrame(rafId);
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

watch(
  isMobileOrTablet,
  (mobile) => {
    if (typeof window === "undefined") return;
    // Clean up current animations
    stopMobileAnimation();
    stopDesktopAnimation();

    if (mobile) {
      startMobileAnimation();
    } else {
      startDesktopAnimation();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (isMobileOrTablet.value) {
    startMobileAnimation();
  } else {
    startDesktopAnimation();
  }
});

onUnmounted(() => {
  stopMobileAnimation();
  stopDesktopAnimation();
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
          <span
            v-if="isMobileOrTablet"
            :class="[
              'inline-block transition-opacity duration-500',
              textState.isFading ? 'opacity-0' : 'opacity-100',
            ]"
          >
            {{ heroTexts[textState.index] }}
          </span>
          <template v-else>
            <span>{{ typed }}</span>
            <span
              aria-hidden
              class="ms-2 inline-block animate-pulse bg-white/90 block-6 inline-px"
            />
          </template>
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

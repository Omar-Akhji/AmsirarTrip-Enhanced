<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useTranslation } from "@/lib/hooks/use-translation";

interface Props {
  fallbackImage: string;
  locale?: string;
}

const { fallbackImage, locale } = defineProps<Props>();

const { t } = useTranslation(locale);
const videoError = ref(false);
const isBuffering = ref(false);
const isPlaying = ref(false);
const videoRef = useTemplateRef<HTMLVideoElement>("videoRef");
const videoSource = "/videos/Morocco-Video.mp4";

const handleVideoError = () => {
  videoError.value = true;
  isBuffering.value = false;
};

const handleVideoEnd = () => {
  isPlaying.value = false;
  isBuffering.value = false;
};

const handleWaiting = () => {
  if (isPlaying.value) {
    isBuffering.value = true;
  }
};

const handlePlaying = () => {
  isBuffering.value = false;
  isPlaying.value = true;
};

const handlePause = () => {
  isPlaying.value = false;
  isBuffering.value = false;
};

const handleVideoClick = async () => {
  const video = videoRef.value;
  if (!video) return;

  if (video.paused) {
    isBuffering.value = true;
    try {
      await video.play();
      isPlaying.value = true;
      isBuffering.value = false;
    } catch {
      isBuffering.value = false;
      handleVideoError();
    }
  } else {
    video.pause();
    isPlaying.value = false;
  }
};
</script>

<template>
  <section
    id="video"
    :aria-label="t('video.sectionLabel')"
    class="relative overflow-hidden py-8 text-white inline-full sm:py-12 lg:py-16"
  >
    <div class="mx-auto px-4 max-inline-7xl sm:px-6 lg:px-8 2xl:max-inline-360 3xl:max-inline-420">
      <div
        data-animate="fade-up"
        data-scroll-cinematic
        class="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-950 p-2 shadow-2xl will-change-transform block-[50dvh] inline-full motion-reduce:transform-none motion-reduce:transition-none xs:block-[55dvh] sm:p-3 sm:block-[65dvh] lg:block-[75dvh] xl:block-[82dvh] 2xl:block-[85dvh] 3xl:max-block-240"
      >
        <!-- Top Telemetry Badge -->
        <div
          class="pointer-events-none absolute inset-s-6 top-6 z-20 flex items-center gap-2 font-mono text-xs"
        >
          <span
            class="inline-flex items-center gap-2 rounded-md border border-white/20 bg-slate-950/80 px-3 py-1 font-bold tracking-wider text-orange-400 uppercase shadow-xs backdrop-blur-xs"
          >
            <svg
              class="size-4 shrink-0 text-orange-400"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M17 3.5V20.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M12 2V22"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-dasharray="3 3"
              />
              <path
                d="M7 3.5V20.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M3 8.5L7 8.5M21 8.5H17"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M3 15.5L5.75 15.5L7 15.5M21 15.5L17 15.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M14.5 3.00293C17.2939 3.02331 18.8237 3.16641 19.8284 4.17112C20.8916 5.23426 20.99 6.8854 20.9991 10M14.5 20.9962C17.2939 20.9758 18.8237 20.8327 19.8284 19.828C20.8916 18.7648 20.99 17.1137 20.9991 13.9991M9.49991 20.9962C6.70609 20.9758 5.17627 20.8327 4.17157 19.828C3 18.6564 3 16.7708 3 12.9995V10.9995C3 7.22831 3 5.34269 4.17157 4.17112C5.17627 3.16642 6.70609 3.02331 9.49991 3.00293"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Morocco Travel Film
          </span>
        </div>

        <div
          v-if="videoError"
          class="flex items-center justify-center rounded-xl bg-cover bg-center px-8 py-12 text-center block-full"
          :style="{ backgroundImage: `url(${fallbackImage})` }"
        >
          <div
            class="max-w-lg rounded-2xl border border-white/15 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-md"
          >
            <div class="mbe-3 inline-flex items-center gap-2 font-mono text-xs text-orange-400">
              <svg
                class="size-4 shrink-0 text-orange-400"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M17 3.5V20.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M12 2V22"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-dasharray="3 3"
                />
                <path
                  d="M7 3.5V20.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M3 8.5L7 8.5M21 8.5H17"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M3 15.5L5.75 15.5L7 15.5M21 15.5L17 15.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M14.5 3.00293C17.2939 3.02331 18.8237 3.16641 19.8284 4.17112C20.8916 5.23426 20.99 6.8854 20.9991 10M14.5 20.9962C17.2939 20.9758 18.8237 20.8327 19.8284 19.828C20.8916 18.7648 20.99 17.1137 20.9991 13.9991M9.49991 20.9962C6.70609 20.9758 5.17627 20.8327 4.17157 19.828C3 18.6564 3 16.7708 3 12.9995V10.9995C3 7.22831 3 5.34269 4.17157 4.17112C5.17627 3.16642 6.70609 3.02331 9.49991 3.00293"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>Featured Video</span>
            </div>
            <h3 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {{ t("video.fallback.title") }}
            </h3>
            <p class="mbs-2 text-sm leading-relaxed text-stone-300">
              {{ t("video.fallback.subtitle") }}
            </p>
            <div
              class="mbs-6 border-t border-white/10 pt-4 font-mono text-xs font-bold tracking-wider text-orange-400 uppercase"
            >
              {{ t("video.fallback.cta") }}
            </div>
          </div>
        </div>

        <div
          v-else
          class="relative size-full"
        >
          <!-- Buffering indicator during playback -->
          <div
            v-if="isBuffering"
            class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-slate-950/60 backdrop-blur-xs"
          >
            <div class="space-y-3 text-center font-mono">
              <p class="text-xs font-bold tracking-[0.2em] text-orange-400 uppercase">
                {{ t("video.loading") }}
              </p>
              <div
                class="mx-auto size-8 animate-spin rounded-full border-2 border-white/20 border-t-orange-500"
              />
            </div>
          </div>

          <video
            ref="videoRef"
            loop
            muted
            playsinline
            preload="none"
            :poster="fallbackImage"
            class="size-full rounded-xl object-cover"
            @error="handleVideoError"
            @waiting="handleWaiting"
            @playing="handlePlaying"
            @pause="handlePause"
            @ended="handleVideoEnd"
          >
            <source
              :src="videoSource"
              type="video/mp4"
            />
            <track
              kind="captions"
              src="/videos/captions.vtt"
              srclang="en"
              label="English"
              default
            />
            {{ t("video.unsupported") }}
          </video>

          <button
            type="button"
            class="group absolute inset-0 z-10 flex items-center justify-center rounded-xl transition-colors duration-300"
            :class="[
              isPlaying ?
                'bg-black/0 pointer-fine:hover:bg-black/15'
              : 'bg-black/30 pointer-fine:hover:bg-black/45',
            ]"
            :aria-label="t(isPlaying ? 'video.pause' : 'video.playAria')"
            @click="handleVideoClick"
          >
            <div
              v-if="!isPlaying && !isBuffering"
              class="relative flex items-center justify-center"
            >
              <!-- Glowing ambient ripple ring on hover -->
              <span
                class="absolute size-20 rounded-full border border-orange/40 transition-all duration-500 group-hover:scale-135 group-hover:border-orange/60 group-hover:opacity-0 sm:size-24"
                aria-hidden="true"
              ></span>

              <!-- Radiant Moroccan terracotta & amber-orange gradient button -->
              <div
                class="flex size-18 items-center justify-center rounded-full border-2 border-white bg-linear-to-br from-amber-orange to-orange text-white shadow-xl shadow-orange/35 backdrop-blur-md transition-all duration-300 group-hover:scale-108 group-hover:border-white/60 group-hover:shadow-2xl group-hover:shadow-orange/50 group-hover:brightness-110 group-active:scale-95 sm:size-20"
              >
                <svg
                  class="size-8 translate-x-0.5 text-white drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 12L3 18.9671C3 21.2763 5.53435 22.736 7.59662 21.6145L10.7996 19.8727M3 8L3 5.0329C3 2.72368 5.53435 1.26402 7.59661 2.38548L20.4086 9.35258C22.5305 10.5065 22.5305 13.4935 20.4086 14.6474L14.0026 18.131"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

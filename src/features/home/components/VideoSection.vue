<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface Props {
  fallbackImage: string;
}

defineProps<Props>();

const { t } = useTranslation();
const videoError = ref(false);
const videoLoaded = ref(false);
const isPlaying = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const videoSource = "/videos/Morocco-Video.mp4";

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.load();
  }
});

const handleVideoError = () => {
  videoError.value = true;
};

const handleVideoLoad = () => {
  videoLoaded.value = true;
};

const handlePlay = () => {
  if (!videoRef.value) return;
  void videoRef.value.play();
  isPlaying.value = true;
};

const handleVideoEnd = () => {
  isPlaying.value = false;
};

const handleVideoClick = () => {
  const video = videoRef.value;
  if (!video) return;
  if (video.paused) {
    void video.play();
    isPlaying.value = true;
  } else {
    video.pause();
    isPlaying.value = false;
  }
};
</script>

<template>
  <section
    id="video"
    :aria-label="t('video.sectionLabel', 'Morocco Travel Video')"
    class="relative overflow-hidden py-4 text-white inline-full sm:py-6 lg:py-8"
  >
    <div class="mx-auto px-4 max-inline-330">
      <div
        data-animate="fade-up"
        class="relative overflow-hidden rounded-[34px] bg-zinc-900 p-3 shadow-2xl block-[55vh] inline-full sm:block-[65vh] lg:block-[75vh] xl:block-[85vh]"
      >
        <div
          v-if="videoError"
          class="flex items-center justify-center rounded-[26px] bg-cover bg-center px-8 py-12 text-center block-full"
          :style="{ backgroundImage: `url(${fallbackImage})` }"
        >
          <div class="rounded-3xl bg-black/60 p-8">
            <h3 class="text-2xl font-semibold">{{ t("video.fallback.title") }}</h3>
            <p class="mbs-3 text-sm text-white/80">{{ t("video.fallback.subtitle") }}</p>
            <p class="mbs-4 text-xs tracking-[0.35em] text-orange-300 uppercase">
              {{ t("video.fallback.cta") }}
            </p>
          </div>
        </div>

        <div
          v-else
          class="relative size-full"
        >
          <div
            v-if="!videoLoaded"
            class="absolute inset-0 z-10 flex items-center justify-center rounded-[26px] bg-zinc-950/60"
          >
            <div class="space-y-3 text-center">
              <p class="text-sm tracking-[0.4em] text-orange-200 uppercase">
                {{ t("video.loading") }}
              </p>
              <div
                class="mx-auto size-10 animate-spin rounded-full border-2 border-white/20 border-t-white"
              />
            </div>
          </div>

          <video
            ref="videoRef"
            loop
            muted
            playsInline
            preload="metadata"
            :class="[
              'size-full cursor-pointer rounded-[26px] object-cover transition-opacity duration-300',
              videoLoaded ? 'opacity-100' : 'opacity-0',
            ]"
            @error="handleVideoError"
            @loadeddata="handleVideoLoad"
            @ended="handleVideoEnd"
            @click="handleVideoClick"
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
            v-if="videoLoaded && !isPlaying"
            type="button"
            class="absolute inset-0 z-10 flex items-center justify-center rounded-[26px] bg-black/40 text-white transition pointer-fine:hover:bg-black/50"
            :aria-label="t('video.playAria', 'Play video')"
            @click="handlePlay"
          >
            <div
              class="flex size-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110"
            >
              <div class="ms-2 border-y-12 border-l-20 border-y-transparent border-l-white" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

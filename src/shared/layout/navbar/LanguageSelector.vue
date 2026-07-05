<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import Image from "@/shared/ui/Image.vue";
import { LANGUAGES } from "./constants";

interface Props {
  placement?: "left" | "right";
  size?: "sm" | "md";
  className?: string;
}

const props = withDefaults(defineProps<Props>(), { placement: "right", size: "md", className: "" });

const { t, i18n } = useTranslation();
const { replace } = useRouter();
const currentPath = usePathname(); // reactive ref<string>
const langOpen = ref(false);
const langRef = ref<HTMLDivElement | null>(null);

const DEFAULT_LANGUAGE = { code: "en", name: "English", shortName: "EN" };

const currentLanguage = computed(() => {
  return LANGUAGES.find((l) => l.code === i18n.language) ?? DEFAULT_LANGUAGE;
});

const changeLanguage = (code: string) => {
  const isValidLanguage = LANGUAGES.some((l) => l.code === code);
  if (!isValidLanguage) return;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("site-language", code);
    } catch {}
  }

  replace(currentPath.value, { locale: code as "en" | "fr" | "de" | "es" });
  langOpen.value = false;
};

const handleClick = (event: MouseEvent) => {
  if (langRef.value && !langRef.value.contains(event.target as Node)) {
    langOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClick);
});

const buttonClasses = computed(() => {
  const sizeClass = props.size === "sm" ? "size-10" : "size-11";
  const baseClasses =
    "flex items-center justify-center rounded-full border-2 transition-all duration-150 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]";
  const textSize = props.size === "sm" ? "text-sm" : "text-base font-semibold";
  const scrollClasses =
    "border-white/60 bg-white/10 text-white group-data-scrolled:border-orange group-data-scrolled:bg-orange group-data-scrolled:text-white group-data-scrolled:shadow-[0_10px_24px_oklch(56%_0.19_33deg/35%)]";
  return cn(baseClasses, sizeClass, textSize, scrollClasses);
});

const badgeClasses = computed(() => {
  const baseClasses =
    "absolute -inset-e-1.5 -bottom-1 font-bold tracking-[0.04em] text-white rounded-full border-2 border-white bg-orange";
  const sizeClasses =
    props.size === "sm" ? "px-1 py-px text-[0.6rem]" : "px-1.5 py-0.5 text-[0.625rem]";
  return cn(baseClasses, sizeClasses);
});
</script>

<template>
  <div
    ref="langRef"
    :class="cn('relative', className)"
  >
    <button
      type="button"
      class="relative cursor-pointer"
      aria-haspopup="listbox"
      :aria-expanded="langOpen"
      :aria-label="t('language') || 'Language'"
      @click.stop="langOpen = !langOpen"
      @keydown.esc="langOpen = false"
      @keydown.enter.prevent="langOpen = !langOpen"
      @keydown.space.prevent="langOpen = !langOpen"
    >
      <div :class="buttonClasses">
        <Image
          src="/icons/translate-icon-com.svg"
          alt=""
          :width="25"
          :height="25"
          :class="cn(size === 'sm' ? 'size-5' : 'size-6.25', 'object-contain')"
        />
      </div>
      <span
        :class="badgeClasses"
        aria-hidden="true"
      >
        {{ currentLanguage.shortName }}
      </span>
    </button>

    <div
      v-if="langOpen"
      :class="[
        'absolute z-50 mbs-2 overflow-hidden rounded-xl border border-white/10 bg-dark/90 text-white shadow-xl backdrop-blur-xl inline-48 group-data-scrolled:border-light-grey-alt2/60 group-data-scrolled:bg-white/90 group-data-scrolled:text-dark-grey',
        placement === 'left' ? 'inset-s-0' : 'inset-e-0',
      ]"
      role="menu"
      aria-orientation="vertical"
    >
      <div class="flex flex-col gap-1 p-1">
        <button
          v-for="lang in LANGUAGES"
          :key="lang.code"
          type="button"
          role="menuitemradio"
          :aria-checked="lang.code === currentLanguage.code"
          :class="[
            'flex items-center justify-between rounded-lg px-3 py-2 text-sm text-light-grey-alt2 transition-colors duration-150 inline-full group-data-scrolled:text-grey hover:bg-white/10 hover:text-white group-data-scrolled:hover:bg-light-grey group-data-scrolled:hover:text-dark-grey',
            lang.code === currentLanguage.code ?
              'bg-white/10 text-white group-data-scrolled:bg-orange/10 group-data-scrolled:text-orange'
            : '',
          ]"
          @click="changeLanguage(lang.code)"
        >
          <span class="flex items-center gap-3">
            <span class="font-medium">{{ lang.name }}</span>
          </span>
          <div
            v-if="lang.code === currentLanguage.code"
            class="me-1 size-2 rounded-full bg-white group-data-scrolled:bg-orange"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, onErrorCaptured } from "vue";
import { Menu, X } from "lucide-vue-next";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SOCIAL_LINKS } from "./constants";
import LanguageSelector from "./LanguageSelector.vue";

// Error boundary state
const hasError = ref(false);
const errorMessage = ref("");

onErrorCaptured((err: Error) => {
  hasError.value = true;
  errorMessage.value = err?.message || "Unknown error";
  console.error("[MobileMenu] Error:", err);
  return false;
});

const { t } = useTranslation();
const pathname = usePathname(); // reactive Ref<string>
const asideOpen = ref(false);
const isHydrated = ref(false);

const getViewport = () => {
  if (
    typeof matchMedia === "function"
    && matchMedia("(min-width: 768px) and (max-width: 1089px)").matches
  ) {
    return "tablet";
  }
  return "mobile";
};

const viewport = ref<"mobile" | "tablet">(getViewport());

const collapseRef = ref<HTMLDivElement | null>(null);
const buttonRef = ref<HTMLButtonElement | null>(null);

const handleNavClick = () => {
  asideOpen.value = false;
};

const isActive = (to: string) => {
  return pathname.value === to || (to !== "/" && pathname.value.startsWith(to + "/"));
};

const getNavLinkClasses = (active: boolean): string => {
  const base =
    "inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200 mx-auto inline-fit min-inline-40 justify-center px-8 py-2.5 text-base text-white bg-transparent hover:bg-white/10 group-data-scrolled:text-dark group-data-scrolled:hover:bg-light-grey";
  const activeClasses =
    "bg-white/10 text-white shadow-[0_0_0_1px_rgb(0_0_0/5%)] backdrop-blur-xs group-data-scrolled:bg-orange group-data-scrolled:text-white group-data-scrolled:shadow-[0_10px_26px_oklch(56%_0.19_33deg/12%)]";
  return cn(base, active && activeClasses);
};

const getCollapseClasses = computed(() => {
  const baseClasses =
    "navbar-collapse fixed inset-s-1/2 top-[calc(100%+0.75rem)] z-40 -translate-x-1/2 overflow-y-auto max-h-[calc(100vh-6rem)] rounded-2xl border border-white/20 bg-slate-950 text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 inline-[min(1100px,calc(100vw-2rem))] group-data-scrolled:border-white/10 group-data-scrolled:bg-white group-data-scrolled:text-slate-900";
  const visibilityClasses =
    asideOpen.value ?
      "pointer-events-auto opacity-100 translate-y-0"
    : "pointer-events-none opacity-0 -translate-y-4";
  return cn(baseClasses, visibilityClasses, "navbar-collapse");
});

// Viewport resize listeners
let mqTablet: MediaQueryList;
let mqMobile: MediaQueryList;

const updateViewport = () => {
  if (mqTablet.matches) viewport.value = "tablet";
  else if (mqMobile.matches) viewport.value = "mobile";
};

// Click outside listener
const handleClickOutside = (event: MouseEvent) => {
  if (!asideOpen.value) return;
  const target = event.target as Node;
  if (
    collapseRef.value
    && buttonRef.value
    && !collapseRef.value.contains(target)
    && !buttonRef.value.contains(target)
  ) {
    asideOpen.value = false;
  }
};

// Focus trap listener
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && asideOpen.value) {
    asideOpen.value = false;
    return;
  }

  if (event.key !== "Tab" || !asideOpen.value) return;

  const collapse = collapseRef.value;
  if (!collapse) return;

  const focusableSelector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusableElements = collapse.querySelectorAll<HTMLElement>(focusableSelector);
  if (focusableElements.length === 0) return;

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable?.focus();
    }
  } else {
    if (document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable?.focus();
    }
  }
};

watch(asideOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
  } else {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDown);
  }
});

onMounted(() => {
  mqTablet = matchMedia("(min-width: 768px) and (max-width: 1089px)");
  mqMobile = matchMedia("(max-width: 767px)");

  mqTablet.addEventListener("change", updateViewport);
  mqMobile.addEventListener("change", updateViewport);
  updateViewport();
  isHydrated.value = true;
});

onUnmounted(() => {
  if (mqTablet) mqTablet.removeEventListener("change", updateViewport);
  if (mqMobile) mqMobile.removeEventListener("change", updateViewport);
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="relative flex items-center gap-3 inline-full lg:hidden">
    <!-- Loading skeleton -->
    <div
      v-if="!isHydrated"
      class="flex items-center gap-2"
    >
      <div class="size-10 animate-pulse rounded-full bg-white/20" />
      <div class="size-10 animate-pulse rounded-full bg-white/20" />
    </div>

    <!-- Error fallback -->
    <div
      v-else-if="hasError"
      class="flex items-center gap-2"
      role="alert"
      :aria-label="`Menu error: ${errorMessage}`"
    >
      <a
        href="/"
        class="flex size-10 items-center justify-center rounded-full bg-white/10 text-white"
        aria-label="Home"
      >
        <span class="text-lg">🏠</span>
      </a>
    </div>

    <!-- Main component -->
    <template v-else>
      <div
        v-if="viewport === 'tablet'"
        class="me-auto flex items-center gap-2"
      >
        <ul class="flex items-center gap-2">
          <li
            v-for="link in SOCIAL_LINKS"
            :key="link.label"
          >
            <a
              :href="link.href"
              :class="[
                'flex size-10 items-center justify-center rounded-full border-2 transition-all duration-150 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]',
                'group-not-data-scrolled:border-white/60 group-not-data-scrolled:bg-white/10 group-not-data-scrolled:text-white',
                link.accent,
              ]"
              v-bind="
                link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {}
              "
              :aria-label="link.label"
            >
              <img
                :src="link.icon"
                alt=""
                class="size-5 object-contain"
              />
            </a>
          </li>
        </ul>
        <LanguageSelector
          size="sm"
          placement="left"
        />
      </div>

      <!-- Mobile menu brand Link -->
      <Link
        href="/"
        :class="[
          'text-[1.4rem] font-semibold tracking-tight text-white transition-colors duration-200 group-data-scrolled:text-dark-grey',
          viewport === 'tablet' || viewport === 'mobile' ?
            'absolute inset-s-1/2 z-10 -translate-x-1/2'
          : '',
        ]"
        aria-label="Amsirar Trip Home"
        @click="handleNavClick"
      >
        Amsirar
        <span
          class="ms-1 font-brand font-light text-white transition-colors duration-200 group-data-scrolled:text-orange"
        >
          Trip
        </span>
      </Link>

      <LanguageSelector
        v-if="viewport === 'mobile'"
        size="sm"
        class="me-auto"
        placement="left"
      />

      <!-- Toggle button -->
      <button
        id="navbar-show-btn"
        ref="buttonRef"
        type="button"
        :class="[
          'ms-2 flex size-10 items-center justify-center rounded-md text-lg transition-all duration-150 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-orange',
          'bg-black/35 text-white group-data-scrolled:bg-white group-data-scrolled:text-dark-grey',
        ]"
        :aria-expanded="asideOpen"
        aria-controls="navbar-collapse"
        @click="asideOpen = !asideOpen"
      >
        <X
          v-if="asideOpen"
          class="pointer-events-none size-5"
        />
        <Menu
          v-else
          class="pointer-events-none size-5"
        />
      </button>

      <!-- Navigation panel -->
      <div
        id="navbar-collapse"
        ref="collapseRef"
        :class="getCollapseClasses"
        aria-label="Navigation menu"
      >
        <div
          v-if="viewport === 'mobile'"
          class="flex items-center justify-center gap-4 border-b border-white/20 px-4 py-4 group-data-scrolled:border-light-grey-alt2/30"
        >
          <ul class="flex items-center gap-4">
            <li
              v-for="link in SOCIAL_LINKS"
              :key="link.label"
            >
              <a
                :href="link.href"
                :class="[
                  'flex size-10 items-center justify-center rounded-full border-2 transition-all duration-150 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-[0_8px_18px_rgba(0,0,0,0.28)]',
                  'group-not-data-scrolled:border-white/60 group-not-data-scrolled:bg-white/10 group-not-data-scrolled:text-white',
                  link.accent,
                ]"
                v-bind="
                  link.href.startsWith('http') ?
                    { target: '_blank', rel: 'noopener noreferrer' }
                  : {}
                "
                :aria-label="link.label"
              >
                <img
                  :src="link.icon"
                  alt=""
                  class="size-5 object-contain"
                />
              </a>
            </li>
          </ul>
        </div>

        <ul class="flex flex-col items-center gap-3 p-4">
          <li
            v-for="link in NAV_LINKS"
            :key="link.to"
          >
            <Link
              :href="link.to"
              :class="getNavLinkClasses(isActive(link.to))"
              @click="handleNavClick"
            >
              <span class="nav-label">{{ t(link.labelKey) }}</span>
            </Link>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

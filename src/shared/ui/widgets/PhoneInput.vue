<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { ALL_COUNTRIES, DEFAULT_COUNTRY, type CountryCallingCode } from "@/data/countries";

interface Props {
  id?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  ariaInvalid?: "true" | "false" | boolean;
  ariaDescribedby?: string | undefined;
  initialValue?: string;
  toolparamdescription?: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: "phone",
  name: "phone",
  required: true,
  placeholder: "(555) 000-0000",
  ariaInvalid: "false",
  initialValue: "",
  toolparamdescription: "International phone or WhatsApp number including country code",
});

const containerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const isOpen = ref(false);
const searchQuery = ref("");
const selectedCountry = ref<CountryCallingCode>(DEFAULT_COUNTRY);
const nationalNumber = ref("");

// Clean formatting characters
function cleanNumber(val: string): string {
  return val.replaceAll(/[^\d\s().-]/g, "").trim();
}

// Compute full international phone number for the form
const fullPhoneNumber = computed(() => {
  const clean = cleanNumber(nationalNumber.value);
  if (!clean) return "";
  if (clean.startsWith("+")) return clean;
  // Strip leading 0 often typed in local national numbers (e.g. 06 12... -> 6 12...)
  const normalized = clean.startsWith("0") ? clean.slice(1).trim() : clean;
  return `${selectedCountry.value.dialCode} ${normalized}`.trim();
});

// Filtered countries based on user search query (name or dial code)
const filteredCountries = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return ALL_COUNTRIES;

  const normalizedCode = query.startsWith("+") ? query : `+${query}`;
  return ALL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query)
      || c.dialCode.includes(query)
      || c.dialCode === normalizedCode,
  );
});

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (!isOpen.value) return;

  searchQuery.value = "";
  void nextTick(() => {
    searchInputRef.value?.focus();
  });
}

function selectCountry(country: CountryCallingCode) {
  selectedCountry.value = country;
  isOpen.value = false;
  searchQuery.value = "";
}

// Detect country code if user pastes a number with international prefix (e.g. +33... or +1...)
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const raw = target.value;

  if (raw.startsWith("+")) {
    const matched = ALL_COUNTRIES.find((c) => raw.startsWith(c.dialCode));
    if (matched) {
      selectedCountry.value = matched;
      nationalNumber.value = raw.slice(matched.dialCode.length).trim();
      return;
    }
  }

  nationalNumber.value = raw;
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && isOpen.value) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});

// Watch initial value
watch(
  () => props.initialValue,
  (val) => {
    if (!val) return;
    if (val.startsWith("+")) {
      const matched = ALL_COUNTRIES.find((c) => val.startsWith(c.dialCode));
      if (matched) {
        selectedCountry.value = matched;
        nationalNumber.value = val.slice(matched.dialCode.length).trim();
        return;
      }
    }
    nationalNumber.value = val;
  },
  { immediate: true },
);
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full"
  >
    <div
      class="group flex h-12 w-full items-center rounded-xl border border-stone-200/90 bg-stone-50/50 transition-colors focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-orange-500 dark:focus-within:bg-white/10"
      :class="{ 'border-red-400 bg-red-50/20': ariaInvalid === 'true' || ariaInvalid === true }"
    >
      <!-- Country Code Trigger Button (Clean Dial Code only, no MA/FR ISO letters) -->
      <button
        type="button"
        class="flex h-full shrink-0 cursor-pointer items-center gap-1.5 rounded-s-xl border-e border-stone-200/80 px-3.5 transition-colors hover:bg-stone-100/70 focus:bg-stone-100 focus:outline-hidden dark:border-white/10 dark:hover:bg-white/10 dark:focus:bg-white/10"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :aria-label="`Selected country dial code: ${selectedCountry.name} (${selectedCountry.dialCode}). Click to change.`"
        @click="toggleDropdown"
      >
        <span class="font-sans text-xs font-semibold text-stone-800 dark:text-mist-100">
          {{ selectedCountry.dialCode }}
        </span>
        <!-- Vertical up/down option chevrons -->
        <svg
          class="size-3.5 text-stone-400 transition-colors dark:text-mist-400"
          :class="{ 'text-stone-700 dark:text-mist-200': isOpen }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <path
            d="M13.5 19.5L12 21L6 15"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16.5 16.5L18 15"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M13.5 4.5L12 3L6 9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16.5 7.5L18 9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- National Phone Number Input -->
      <div class="relative flex h-full flex-1 items-center">
        <input
          :id="id"
          type="tel"
          :value="nationalNumber"
          :placeholder="placeholder"
          maxlength="20"
          autocomplete="tel-national"
          :required="required"
          :aria-invalid="ariaInvalid"
          :aria-describedby="ariaDescribedby"
          class="peer h-full w-full bg-transparent ps-10.5 pe-4 font-sans text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden dark:text-mist-100 dark:placeholder:text-mist-500"
          @input="handleInput"
        />
        <svg
          class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-stone-400 transition-colors peer-focus:text-orange-500 dark:text-stone-500"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4.00655 7.93309C3.93421 9.84122 4.41713 13.0817 7.6677 16.3323C8.45191 17.1165 9.23553 17.7396 10 18.2327M5.53781 4.93723C6.93076 3.54428 9.15317 3.73144 10.0376 5.31617L10.6866 6.4791C11.2723 7.52858 11.0372 8.90532 10.1147 9.8278C10.1147 9.8278 10.1147 9.8278 10.1147 9.8278C10.1146 9.82792 8.99588 10.9468 11.0245 12.9755C13.0525 15.0035 14.1714 13.8861 14.1722 13.8853C14.1722 13.8853 14.1722 13.8853 14.1722 13.8853C15.0947 12.9628 16.4714 12.7277 17.5209 13.3134L18.6838 13.9624C20.2686 14.8468 20.4557 17.0692 19.0628 18.4622C18.2258 19.2992 17.2004 19.9505 16.0669 19.9934C15.2529 20.0243 14.1963 19.9541 13 19.6111"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <!-- Hidden standard input submitting the combined full international phone number -->
      <input
        type="hidden"
        :name="name"
        :value="fullPhoneNumber"
        :toolparamdescription="toolparamdescription"
      />
      <input
        type="hidden"
        name="countryCode"
        :value="selectedCountry.dialCode"
      />
    </div>

    <!-- Custom Designed Dropdown Menu (full width matching input field & rounded-xl) -->
    <div
      v-if="isOpen"
      class="absolute inset-x-0 top-full z-50 mbs-1.5 w-full overflow-hidden rounded-xl border border-stone-200/90 bg-white shadow-xl shadow-stone-900/10 dark:border-white/10 dark:bg-surface-card dark:shadow-[0_16px_40px_rgba(0,0,0,0.65)]"
      role="listbox"
      :aria-label="`Select country phone code. Currently selected: ${selectedCountry.name}`"
    >
      <!-- Search Input Header -->
      <div
        class="relative border-b border-stone-100 bg-stone-50/70 p-2 dark:border-white/10 dark:bg-white/5"
      >
        <svg
          class="pointer-events-none absolute inset-s-4.5 top-1/2 size-3.5 -translate-y-1/2 text-stone-400 dark:text-mist-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clip-rule="evenodd"
          />
        </svg>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          aria-label="Search country or code"
          placeholder="Search country or code..."
          class="h-8.5 w-full rounded-lg border border-stone-200/80 bg-white ps-8 pe-3 font-sans text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:ring-1 focus:ring-stone-400/20 focus:outline-hidden dark:border-white/10 dark:bg-surface-base dark:text-mist-100 dark:placeholder:text-mist-500"
          @keydown.stop
        />
      </div>

      <!-- Scrollable Country List with Symmetrically Floating Scrollbar -->
      <div
        class="flex flex-col px-(--scrollbar-space) py-1 [--scrollbar-space:8px] [--scrollbar-theme:hsl(0deg_0%_75%)]"
      >
        <div
          class="max-h-60 divide-y divide-stone-100/60 overflow-x-hidden overflow-y-auto overscroll-y-contain pe-(--scrollbar-space) supports-[-moz-appearance:none]:scrollbar-thin supports-[-moz-appearance:none]:[scrollbar-color:color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_28%)_transparent] dark:divide-white/5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0 [&::-webkit-scrollbar-thumb]:rounded-[1000px] [&::-webkit-scrollbar-thumb]:bg-[color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_28%)] [&::-webkit-scrollbar-thumb:hover]:bg-[color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_12%)] [&::-webkit-scrollbar-track]:my-2.5 [&::-webkit-scrollbar-track]:rounded-[1000px] [&::-webkit-scrollbar-track]:bg-[color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_82%)] [&::-webkit-scrollbar-track]:bg-clip-padding"
          tabindex="-1"
          data-lenis-prevent
        >
          <button
            v-for="country in filteredCountries"
            :key="country.code"
            type="button"
            role="option"
            :aria-selected="country.code === selectedCountry.code"
            class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-none px-3 py-2 text-start transition-colors hover:bg-stone-100 focus:bg-stone-100 focus:outline-hidden active:bg-stone-200/70 dark:hover:bg-white/5 dark:focus:bg-white/5"
            :class="{
              'bg-stone-100 font-medium text-stone-900 dark:bg-white/10 dark:text-mist-100':
                country.code === selectedCountry.code,
            }"
            @click="selectCountry(country)"
          >
            <div class="min-w-0 flex-1">
              <span class="block truncate font-sans text-xs text-stone-800 dark:text-mist-200">
                {{ country.name }}
              </span>
            </div>
            <div class="flex shrink-0 items-center">
              <span class="font-sans text-xs font-medium text-stone-600 dark:text-mist-300">
                {{ country.dialCode }}
              </span>
            </div>
          </button>

          <!-- Empty search state -->
          <div
            v-if="filteredCountries.length === 0"
            class="px-3 py-6 text-center font-sans text-xs text-stone-600 dark:text-mist-300"
          >
            No countries found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

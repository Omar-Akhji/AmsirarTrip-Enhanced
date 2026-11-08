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
      class="group flex h-12 w-full items-center rounded-xl border border-stone-200/90 bg-stone-50/50 transition-colors focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20"
      :class="{ 'border-red-400 bg-red-50/20': ariaInvalid === 'true' || ariaInvalid === true }"
    >
      <!-- Country Code Trigger Button (Clean Dial Code only, no MA/FR ISO letters) -->
      <button
        type="button"
        class="flex h-full shrink-0 cursor-pointer items-center gap-1.5 rounded-s-xl border-e border-stone-200/80 px-3.5 transition-colors hover:bg-stone-100/70 focus:bg-stone-100 focus:outline-hidden"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :aria-label="`Selected country dial code: ${selectedCountry.name} (${selectedCountry.dialCode}). Click to change.`"
        @click="toggleDropdown"
      >
        <span class="font-sans text-xs font-semibold text-stone-800">
          {{ selectedCountry.dialCode }}
        </span>
        <!-- Vertical up/down option chevrons -->
        <svg
          class="size-3.5 text-stone-400 transition-colors"
          :class="{ 'text-stone-700': isOpen }"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <!-- Up chevron ^ -->
          <path d="M7 8L10 5L13 8" />
          <!-- Down chevron v -->
          <path d="M7 12L10 15L13 12" />
        </svg>
      </button>

      <!-- National Phone Number Input -->
      <div class="relative flex flex-1 items-center">
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
          class="h-full w-full bg-transparent px-3 font-sans text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden"
          @input="handleInput"
        />
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
      class="absolute inset-x-0 top-full z-50 mbs-1.5 w-full overflow-hidden rounded-xl border border-stone-200/90 bg-white shadow-xl shadow-stone-900/10"
      role="listbox"
      :aria-label="`Select country phone code. Currently selected: ${selectedCountry.name}`"
    >
      <!-- Search Input Header -->
      <div class="relative border-b border-stone-100 bg-stone-50/70 p-2">
        <svg
          class="pointer-events-none absolute inset-s-4.5 top-1/2 size-3.5 -translate-y-1/2 text-stone-400"
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
          class="h-8.5 w-full rounded-lg border border-stone-200/80 bg-white ps-8 pe-3 font-sans text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:ring-1 focus:ring-stone-400/20 focus:outline-hidden"
          @keydown.stop
        />
      </div>

      <!-- Scrollable Country List with Symmetrically Floating Scrollbar -->
      <div
        class="flex flex-col px-(--scrollbar-space) py-1 [--scrollbar-space:8px] [--scrollbar-theme:hsl(0deg_0%_75%)]"
      >
        <div
          class="max-h-60 divide-y divide-stone-100/60 overflow-x-hidden overflow-y-auto overscroll-y-contain pe-(--scrollbar-space) supports-[-moz-appearance:none]:scrollbar-thin supports-[-moz-appearance:none]:[scrollbar-color:color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_28%)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0 [&::-webkit-scrollbar-thumb]:rounded-[1000px] [&::-webkit-scrollbar-thumb]:bg-[color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_28%)] [&::-webkit-scrollbar-thumb:hover]:bg-[color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_12%)] [&::-webkit-scrollbar-track]:my-2.5 [&::-webkit-scrollbar-track]:rounded-[1000px] [&::-webkit-scrollbar-track]:bg-[color-mix(in_sRGB,var(--scrollbar-theme,hsl(0deg_0%_75%)),transparent_82%)] [&::-webkit-scrollbar-track]:bg-clip-padding"
          tabindex="-1"
          data-lenis-prevent
        >
          <button
            v-for="country in filteredCountries"
            :key="country.code"
            type="button"
            role="option"
            :aria-selected="country.code === selectedCountry.code"
            class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-none px-3 py-2 text-start transition-colors hover:bg-stone-100 focus:bg-stone-100 focus:outline-hidden active:bg-stone-200/70"
            :class="{
              'bg-stone-100 font-medium text-stone-900': country.code === selectedCountry.code,
            }"
            @click="selectCountry(country)"
          >
            <div class="min-w-0 flex-1">
              <span class="block truncate font-sans text-xs text-stone-800">
                {{ country.name }}
              </span>
            </div>
            <div class="flex shrink-0 items-center">
              <span class="font-sans text-xs font-medium text-stone-500">
                {{ country.dialCode }}
              </span>
            </div>
          </button>

          <!-- Empty search state -->
          <div
            v-if="filteredCountries.length === 0"
            class="px-3 py-6 text-center font-sans text-xs text-stone-500"
          >
            No countries found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

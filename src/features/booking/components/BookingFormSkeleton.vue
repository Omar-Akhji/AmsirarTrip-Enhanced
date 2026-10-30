<script setup lang="ts">
import AsciiSkeleton from "@/shared/ui/AsciiSkeleton.vue";

interface Props {
  fullWidth?: boolean;
}

withDefaults(defineProps<Props>(), { fullWidth: false });
</script>

<template>
  <section
    aria-busy="true"
    aria-label="Loading booking form"
    aria-live="polite"
    class="relative isolate border-bs border-stone-200 bg-stone-50 py-16 sm:py-20"
    :class="[fullWidth ? 'booking-form-fullwidth' : '']"
  >
    <div class="booking-form-inner mx-auto px-4 inline-full max-inline-7xl">
      <div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-5">
        <!-- Left: Form Card Skeleton (col-span-3) -->
        <div class="inline-full lg:col-span-3">
          <div
            class="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs block-full sm:p-8"
          >
            <!-- Header -->
            <div class="mbe-6 border-be border-stone-100 pbe-5">
              <AsciiSkeleton
                class="mbe-2 font-mono text-xs text-stone-400 uppercase"
                :lines="1"
                variant="scan"
                :widths="['7rem']"
              />
              <AsciiSkeleton
                class="text-xl font-bold text-stone-800 sm:text-2xl"
                :lines="1"
                variant="dither"
                :widths="['16rem']"
              />
            </div>

            <!-- Form fields skeleton matching exact inputs -->
            <div class="flex flex-col gap-5">
              <!-- Row: Number of People & Date Picker -->
              <div class="grid gap-5 md:grid-cols-2">
                <div
                  class="flex h-12 w-full items-center rounded-xl border border-stone-200/90 bg-stone-50/80 p-3"
                >
                  <AsciiSkeleton
                    class="font-mono text-xs text-stone-300"
                    :lines="1"
                    variant="terminal"
                    :widths="['6rem']"
                  />
                </div>
                <div
                  class="flex h-12 w-full items-center rounded-xl border border-stone-200/90 bg-stone-50/80 p-3"
                >
                  <AsciiSkeleton
                    class="font-mono text-xs text-stone-300"
                    :lines="1"
                    variant="terminal"
                    :widths="['8rem']"
                  />
                </div>
              </div>

              <!-- Row: Full Name & Email -->
              <div class="grid gap-5 md:grid-cols-2">
                <div
                  class="flex h-12 w-full items-center rounded-xl border border-stone-200/90 bg-stone-50/80 p-3"
                >
                  <AsciiSkeleton
                    class="font-mono text-xs text-stone-300"
                    :lines="1"
                    variant="terminal"
                    :widths="['7rem']"
                  />
                </div>
                <div
                  class="flex h-12 w-full items-center rounded-xl border border-stone-200/90 bg-stone-50/80 p-3"
                >
                  <AsciiSkeleton
                    class="font-mono text-xs text-stone-300"
                    :lines="1"
                    variant="terminal"
                    :widths="['9rem']"
                  />
                </div>
              </div>

              <!-- Phone field -->
              <div
                class="flex h-12 w-full items-center rounded-xl border border-stone-200/90 bg-stone-50/80 p-3"
              >
                <AsciiSkeleton
                  class="font-mono text-xs text-stone-300"
                  :lines="1"
                  variant="terminal"
                  :widths="['8rem']"
                />
              </div>

              <!-- Message field -->
              <div
                class="w-full rounded-xl border border-stone-200/90 bg-stone-50/80 p-4 min-block-40"
              >
                <AsciiSkeleton
                  class="text-sm text-stone-300"
                  :lines="3"
                  variant="dither"
                  :widths="['100%', '90%', '65%']"
                />
              </div>

              <!-- Captcha & Submit button matching BookingForm.vue -->
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="w-fit rounded-xl border border-stone-200 p-2.5">
                  <AsciiSkeleton
                    class="font-mono text-xs text-stone-400"
                    :lines="1"
                    variant="scan"
                    :widths="['8rem']"
                  />
                </div>
                <div class="w-fit rounded-full border border-stone-300 bg-stone-100 px-8 py-3">
                  <AsciiSkeleton
                    class="font-mono text-xs font-bold text-stone-700 uppercase"
                    :lines="1"
                    variant="scan"
                    :widths="['9rem']"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Sidebar Skeleton matching BookingSidebar.vue (col-span-2) -->
        <div class="inline-full lg:col-span-2">
          <aside
            class="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-6 text-white shadow-xl block-full lg:p-8"
          >
            <div class="flex flex-col gap-8">
              <!-- TripAdvisor Brand Header -->
              <div class="flex flex-col items-center gap-3 text-center">
                <AsciiSkeleton
                  class="font-mono text-xs tracking-wider text-stone-400 uppercase"
                  :lines="1"
                  variant="scan"
                  :widths="['6rem']"
                />
                <AsciiSkeleton
                  class="text-center text-xl font-semibold text-white sm:text-2xl"
                  :lines="1"
                  variant="dither"
                  :widths="['14rem']"
                />
                <div
                  class="inline-flex size-36 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 p-4 shadow-inner"
                >
                  <AsciiSkeleton
                    class="size-20 overflow-hidden rounded-full text-stone-500"
                    :rows="5"
                    variant="dither"
                  />
                </div>
              </div>

              <!-- Rating Badge -->
              <div
                class="mx-auto flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <AsciiSkeleton
                  class="font-mono text-2xl font-extrabold text-stone-200"
                  :lines="1"
                  variant="terminal"
                  :widths="['2.5rem']"
                />
                <div class="space-y-1">
                  <AsciiSkeleton
                    class="text-xs text-stone-300"
                    :lines="1"
                    variant="terminal"
                    :widths="['7rem']"
                  />
                  <AsciiSkeleton
                    class="text-xs text-stone-400"
                    :lines="1"
                    variant="terminal"
                    :widths="['9rem']"
                  />
                </div>
              </div>

              <!-- Copy -->
              <AsciiSkeleton
                class="text-sm leading-relaxed text-stone-400"
                :lines="2"
                variant="dither"
                :widths="['100%', '85%']"
              />

              <!-- Perks -->
              <div class="grid gap-4 text-sm">
                <div
                  v-for="i in 3"
                  :key="i"
                  class="flex items-center gap-3"
                >
                  <div
                    class="flex size-5 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10"
                  >
                    <span class="size-1.5 rounded-full bg-stone-300" />
                  </div>
                  <AsciiSkeleton
                    class="flex-1 text-xs text-stone-300"
                    :lines="1"
                    variant="dither"
                    :widths="['85%']"
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </section>
</template>

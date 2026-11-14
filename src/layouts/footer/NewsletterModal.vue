<script setup lang="ts">
import { ref, onMounted, onUnmounted, useTemplateRef } from "vue";
import { actions } from "astro:actions";
import { hasCaptcha } from "@/lib/client-env";
import { useTranslation } from "@/lib/hooks/use-translation";
import Recaptcha from "@/shared/ui/widgets/Recaptcha.vue";

interface Props {
  locale?: string;
}

const { locale } = defineProps<Props>();
const { t } = useTranslation(locale);
const name = ref("");
const email = ref("");
const statusKey = ref("");
const isSubmitting = ref(false);

interface RecaptchaInstance {
  readonly getValue: () => string;
  readonly reset: () => void;
}

const recaptchaRef = useTemplateRef<RecaptchaInstance>("recaptchaRef");
const dialogRef = useTemplateRef<HTMLDialogElement>("dialogRef");
let timer: ReturnType<typeof setTimeout> | null = null;

const handleClose = () => {
  dialogRef.value?.close();
};

const handleSubmit = async () => {
  if (!name.value.trim() || !email.value.trim() || isSubmitting.value) return;

  const recaptchaToken = recaptchaRef.value?.getValue() ?? "";
  if (!recaptchaToken) {
    statusKey.value = "footer.newsletterCaptchaError";
    return;
  }

  isSubmitting.value = true;
  try {
    const { data, error } = await actions.newsletter({
      name: name.value,
      email: email.value,
      recaptchaToken,
    });

    if (error) {
      statusKey.value = "footer.newsletterFailure";
    } else {
      if (data.ok) {
        name.value = "";
        email.value = "";
        recaptchaRef.value?.reset();
        timer = setTimeout(() => {
          timer = null;
          handleClose();
        }, 2000);
      }
      statusKey.value = data.statusKey;
    }
  } catch {
    statusKey.value = "footer.newsletterFailure";
  } finally {
    isSubmitting.value = false;
  }
};

const handleFallbackOpen = (event: MouseEvent) => {
  if (!(event.target instanceof Element)) {
    return;
  }
  const trigger = event.target.closest("[data-newsletter-open]");
  if (trigger && dialogRef.value && !dialogRef.value.open) {
    dialogRef.value.showModal();
  }
};

onMounted(() => {
  if (!("commandForElement" in HTMLButtonElement.prototype)) {
    document.addEventListener("click", handleFallbackOpen);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleFallbackOpen);
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<template>
  <dialog
    id="newsletter-dialog"
    ref="dialogRef"
    aria-modal="true"
    aria-labelledby="newsletter-dialog-title"
    closedby="any"
    class="fixed inset-0 z-50 m-auto overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-0 text-white shadow-2xl ring-1 ring-white/10 inline-[95vw] max-inline-md backdrop:bg-black/75 backdrop:backdrop-blur-sm backdrop:transition-all backdrop:duration-300 open:flex open:flex-col starting:backdrop:bg-black/0 starting:open:scale-95 starting:open:opacity-0"
  >
    <div class="flex flex-1 flex-col rounded-2xl bg-slate-950">
      <div class="p-6 sm:p-8">
        <div class="mbe-6 flex items-start justify-between">
          <div>
            <h2
              id="newsletter-dialog-title"
              class="text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              {{ t("footer.newsletter") }}
            </h2>
            <p class="mbs-1.5 text-sm leading-relaxed text-slate-300">
              {{ t("footer.newsletterDescription") }}
            </p>
          </div>
          <button
            type="button"
            command="close"
            commandfor="newsletter-dialog"
            :aria-label="t('footer.newsletterCloseAria')"
            class="-me-1 -mbs-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-hidden pointer-fine:hover:bg-white/10 pointer-fine:hover:text-white"
            @click="handleClose"
          >
            <svg
              class="solar solar-close-broken size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                d="M19.0068 5L15.5068 8.5"
                stroke="currentColor"
                stroke-linecap="round"
              />
              <path
                d="M12.0068 12L5.00684 19"
                stroke="currentColor"
                stroke-linecap="round"
              />
              <path
                d="M19 19L5 5"
                stroke="currentColor"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <form
          :aria-label="t('footer.newsletterAria')"
          toolname="subscribe_to_newsletter"
          tooldescription="Subscribes the user to the newsletter with their name and email address"
          @submit.prevent="handleSubmit"
        >
          <fieldset class="m-0 space-y-4 border-0 p-0">
            <legend class="sr-only">
              {{ t("footer.newsletter") }}
            </legend>
            <div>
              <label
                for="newsletter-name"
                class="mbe-1.5 block font-mono text-xs font-medium text-slate-300"
              >
                {{ t("footer.newsletterNameLabel") }}
              </label>
              <div class="relative">
                <svg
                  class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-zinc-400 transition-colors peer-focus:text-orange-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="6"
                    r="4"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path
                    d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <input
                  id="newsletter-name"
                  v-model="name"
                  type="text"
                  name="name"
                  toolparamdescription="The full name of the user subscribing to the newsletter"
                  required
                  minlength="2"
                  autocomplete="name"
                  placeholder="Enter your full name"
                  class="peer rounded-xl border border-white/10 bg-white/5 ps-10.5 pe-4 font-mono text-sm text-white transition-colors block-11 inline-full placeholder:text-zinc-500 focus:border-orange-500 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label
                for="newsletter-email"
                class="mbe-1.5 block font-mono text-xs font-medium text-slate-300"
              >
                {{ t("footer.newsletterInputAria") }}
              </label>
              <div class="relative">
                <svg
                  class="pointer-events-none absolute inset-s-3.5 top-1/2 size-4.5 -translate-y-1/2 text-zinc-400 transition-colors peer-focus:text-orange-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C21.4816 5.82475 21.7706 6.69989 21.8985 8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                  <path
                    d="M18 8L15.8411 9.79908C14.0045 11.3296 13.0861 12.0949 12 12.0949C11.3507 12.0949 10.7614 11.8214 10 11.2744M6 8L6.9 8.75L7.8 9.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <input
                  id="newsletter-email"
                  v-model="email"
                  type="email"
                  name="email"
                  toolparamdescription="The email address of the user subscribing to the newsletter"
                  required
                  autocomplete="email"
                  placeholder="Enter your email address"
                  class="peer rounded-xl border border-white/10 bg-white/5 ps-10.5 pe-4 font-mono text-sm text-white transition-colors block-11 inline-full placeholder:text-zinc-500 user-invalid:border-red-400/80 focus:border-orange-500 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden user-invalid:focus:ring-red-400/20"
                />
              </div>
            </div>

            <div class="flex justify-center pbs-2">
              <div
                class="w-fit rounded-2xl border border-dashed p-1.5 transition-all"
                :class="[
                  statusKey.includes('Captcha') ?
                    'border-red-400 bg-red-950/20'
                  : 'border-white/15 bg-white/2',
                ]"
              >
                <Recaptcha
                  v-if="hasCaptcha"
                  ref="recaptchaRef"
                  theme="dark"
                  size="normal"
                />
                <div
                  v-else
                  class="rounded-xl border border-white/10 bg-white/5 p-2 font-mono text-xs text-slate-400"
                >
                  CAPTCHA not configured
                </div>
              </div>
            </div>
          </fieldset>

          <label
            v-if="statusKey"
            for="newsletter-status"
            class="sr-only"
          >
            {{ t("footer.newsletterStatus") }}
          </label>
          <output
            v-if="statusKey"
            id="newsletter-status"
            for="newsletter-name newsletter-email"
            aria-live="polite"
            class="mbs-4 block text-center font-mono text-xs font-medium"
            :class="[statusKey.includes('Success') ? 'text-emerald-400' : 'text-red-400']"
          >
            {{ t(statusKey) }}
          </output>

          <button
            type="submit"
            :disabled="isSubmitting"
            :aria-busy="isSubmitting"
            class="group mbs-5 inline-flex min-h-12 cursor-pointer items-center rounded-full border border-stone-200/80 bg-white py-1.5 ps-4 pe-1.5 font-mono text-xs font-semibold tracking-wider text-dark-surface uppercase shadow-lg shadow-black/25 transition-colors duration-200 select-none inline-full hover:border-stone-300 hover:bg-white hover:shadow-xl focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-hidden active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span class="flex-1 truncate px-2 text-center">
              {{ t(isSubmitting ? "contact.form.sending" : "footer.newsletterSubscribe") }}
            </span>
            <span
              class="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-amber-orange to-orange text-white shadow-xs shadow-orange/40 transition-transform duration-300 ease-out group-hover:scale-105 group-active:scale-95"
            >
              <!-- Loading state: Solar Refresh Broken spinning icon -->
              <svg
                v-if="isSubmitting"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-4.5 animate-spin"
                aria-hidden="true"
              >
                <path
                  d="M3.67981 13L3.67981 11.3333C3.67981 6.73096 7.4402 3 12.0789 3C12.2201 3 12.3605 3.00346 12.5 3.01029M2 11.3333L3.67981 13L5.35962 11.3333M19.2545 7C18.567 5.88176 17.6215 4.9368 16.5 4.2466"
                />
                <path
                  d="M20.3137 11V12.6667C20.3137 17.269 16.5389 21 11.8825 21C11.7543 21 11.6268 20.9972 11.5 20.9916M21.9999 12.6667L20.3137 11L18.6274 12.6667M4.67944 17C5.38086 18.1366 6.34989 19.0942 7.5 19.7872"
                />
              </svg>

              <template v-else>
                <!-- Arrow Stage: Smooth sliding choreography -->
                <div class="relative flex size-full items-center justify-center">
                  <!-- Default state: Solar Arrow Right-Up Broken (slides up-right & fades out on hover) -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="absolute size-4.5 transition-all duration-300 ease-out group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:opacity-0 rtl:-scale-x-100 rtl:group-hover:-translate-x-3"
                    aria-hidden="true"
                  >
                    <path d="M18 15V6H9M18 6L11.5 12.5M6 18L8.5 15.5" />
                  </svg>

                  <!-- Hover state: Solar Arrow Right Broken (slides in from left & settles centered) -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="absolute size-4.5 -translate-x-3 translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 rtl:translate-x-3 rtl:-scale-x-100 rtl:group-hover:translate-x-0"
                    aria-hidden="true"
                  >
                    <path d="M14 18L20 12L14 6M20 12H9.5M4 12H6.5" />
                  </svg>
                </div>
              </template>
            </span>
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>

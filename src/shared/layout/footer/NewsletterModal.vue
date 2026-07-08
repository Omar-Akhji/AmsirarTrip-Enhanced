<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { actions } from "astro:actions";
import { Loader2, Mail, User, X } from "lucide-vue-next";
import { hasRecaptchaV2, RECAPTCHA_V2_SITE_KEY } from "@/lib/client-env";
import { useTranslation } from "@/lib/hooks/useTranslation";
import Recaptcha from "@/shared/ui/Recaptcha.vue";

const { t } = useTranslation();
const name = ref("");
const email = ref("");
const statusKey = ref("");
const isSubmitting = ref(false);

const recaptchaRef = ref<InstanceType<typeof Recaptcha> | null>(null);
const dialogRef = ref<HTMLDialogElement | null>(null);
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
    const { data, error } = await actions["newsletter"]({
      name: name.value,
      email: email.value,
      recaptchaToken,
    });

    if (error) {
      statusKey.value = "footer.newsletterFailure";
    } else if (data) {
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

const handleCancel = (event: Event) => {
  event.preventDefault();
  handleClose();
};

onUnmounted(() => {
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
    class="fixed inset-0 z-50 m-auto overflow-visible rounded-3xl border border-neutral-200 bg-transparent p-0 text-neutral-900 shadow-2xl transition-all duration-300 inline-[95vw] max-inline-md backdrop:bg-black/50 backdrop:backdrop-blur-sm backdrop:transition-all backdrop:duration-300 open:flex open:flex-col starting:backdrop:bg-black/0 starting:open:scale-95 starting:open:opacity-0"
    @cancel="handleCancel"
  >
    <div
      role="presentation"
      class="flex flex-1 flex-col rounded-3xl bg-white"
      @click="
        (event) => {
          if (event.target === event.currentTarget) {
            dialogRef?.close();
          }
        }
      "
    >
      <div class="p-6 sm:p-8">
        <div class="mbe-6 flex items-start justify-between">
          <div>
            <h2
              id="newsletter-dialog-title"
              class="text-xl font-semibold text-neutral-900"
            >
              {{ t("footer.newsletter") }}
            </h2>
            <p class="mbs-1.5 text-sm leading-relaxed text-neutral-500">
              {{ t("footer.newsletterDescription") }}
            </p>
          </div>
          <button
            type="button"
            command="close"
            commandfor="newsletter-dialog"
            :aria-label="t('footer.newsletterCloseAria')"
            class="-me-1 -mbs-1 flex size-9 items-center justify-center rounded-full text-neutral-400 transition-colors pointer-fine:hover:bg-neutral-100 pointer-fine:hover:text-neutral-600"
          >
            <X class="size-5" />
          </button>
        </div>

        <form
          :aria-label="t('footer.newsletterAria')"
          @submit.prevent="handleSubmit"
        >
          <div class="space-y-4">
            <div>
              <label
                htmlFor="newsletter-name"
                class="mbe-1.5 block text-sm font-medium text-neutral-700"
              >
                {{ t("footer.newsletterNameLabel") }}
              </label>
              <div class="relative">
                <User
                  class="absolute inset-s-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                />
                <input
                  id="newsletter-name"
                  v-model="name"
                  type="text"
                  name="name"
                  :placeholder="t('footer.newsletterNamePlaceholder')"
                  required
                  minlength="2"
                  autocomplete="name"
                  class="rounded-full border border-neutral-200 bg-neutral-50 ps-10 pe-4 text-sm text-neutral-900 transition-all duration-200 block-11 inline-full placeholder:text-neutral-400 user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="newsletter-email"
                class="mbe-1.5 block text-sm font-medium text-neutral-700"
              >
                {{ t("footer.newsletterInputAria") }}
              </label>
              <div class="relative">
                <Mail
                  class="absolute inset-s-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                />
                <input
                  id="newsletter-email"
                  v-model="email"
                  type="email"
                  name="email"
                  :placeholder="t('footer.newsletterPlaceholder')"
                  required
                  autocomplete="email"
                  class="rounded-full border border-neutral-200 bg-neutral-50 ps-10 pe-4 text-sm text-neutral-900 transition-all duration-200 block-11 inline-full placeholder:text-neutral-400 user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
                />
              </div>
            </div>

            <div class="flex justify-center pbs-1">
              <div
                :class="[
                  'origin-center scale-[0.85] rounded-2xl border border-dashed p-3 sm:scale-100',
                  statusKey.includes('Captcha') ? 'border-red-300' : 'border-neutral-200',
                ]"
              >
                <Recaptcha
                  v-if="hasRecaptchaV2"
                  ref="recaptchaRef"
                  :sitekey="RECAPTCHA_V2_SITE_KEY"
                  theme="light"
                  size="normal"
                />
                <div
                  v-else
                  class="rounded-lg bg-amber-50 p-2 text-sm text-amber-600"
                >
                  reCAPTCHA not configured
                </div>
              </div>
            </div>
          </div>

          <p
            v-if="statusKey"
            :class="[
              'mbs-4 text-center text-sm font-medium',
              statusKey.includes('Success') ? 'text-emerald-600' : 'text-red-500',
            ]"
          >
            {{ t(statusKey) }}
          </p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="mbs-5 flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange to-amber-500 text-sm font-semibold text-white shadow-md transition-all duration-300 block-11 inline-full active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 pointer-fine:hover:scale-[1.02] pointer-fine:hover:shadow-lg pointer-fine:hover:shadow-orange-500/30 disabled:pointer-fine:hover:scale-100"
          >
            <Loader2
              v-if="isSubmitting"
              class="size-4 animate-spin"
            />
            <template v-else>
              {{ t("footer.newsletterSubscribe") }}
            </template>
          </button>
        </form>
      </div>
    </div>
  </dialog>
</template>

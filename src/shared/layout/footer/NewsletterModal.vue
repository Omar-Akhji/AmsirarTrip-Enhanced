<script setup lang="ts">
import { ref, onUnmounted, useTemplateRef } from "vue";
import { actions } from "astro:actions";
import Loader2 from "lucide-vue-next/dist/esm/icons/loader-circle";
import Mail from "lucide-vue-next/dist/esm/icons/mail";
import User from "lucide-vue-next/dist/esm/icons/user";
import X from "lucide-vue-next/dist/esm/icons/x";
import { hasRecaptchaV2, RECAPTCHA_V2_SITE_KEY } from "@/lib/client-env";
import { useTranslation } from "@/lib/hooks/use-translation";
import Recaptcha from "@/shared/ui/Recaptcha.vue";

interface Props {
  locale?: string;
}

const props = defineProps<Props>();
const { t } = useTranslation(props.locale);
const name = ref("");
const email = ref("");
const statusKey = ref("");
const isSubmitting = ref(false);

const recaptchaRef = useTemplateRef<InstanceType<typeof Recaptcha>>("recaptchaRef");
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
    class="fixed inset-0 z-50 m-auto overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-0 text-white shadow-2xl ring-1 ring-white/10 inline-[95vw] max-inline-md backdrop:bg-black/75 backdrop:backdrop-blur-sm backdrop:transition-all backdrop:duration-300 open:flex open:flex-col starting:backdrop:bg-black/0 starting:open:scale-95 starting:open:opacity-0"
    @cancel="handleCancel"
  >
    <div
      role="presentation"
      class="flex flex-1 flex-col rounded-2xl bg-slate-950"
      @click="
        (event) => {
          if (event.target === event.currentTarget) {
            dialogRef.value?.close();
          }
        }
      "
    >
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
            <X class="size-5" />
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
                <User class="absolute inset-s-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="newsletter-name"
                  v-model="name"
                  type="text"
                  name="name"
                  toolparamdescription="The full name of the user subscribing to the newsletter"
                  required
                  minlength="2"
                  autocomplete="name"
                  class="rounded-xl border border-white/10 bg-white/5 ps-10 pe-4 font-mono text-sm text-white transition-colors block-11 inline-full focus:border-orange-500 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
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
                <Mail class="absolute inset-s-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="newsletter-email"
                  v-model="email"
                  type="email"
                  name="email"
                  toolparamdescription="The email address of the user subscribing to the newsletter"
                  required
                  autocomplete="email"
                  class="rounded-xl border border-white/10 bg-white/5 ps-10 pe-4 font-mono text-sm text-white transition-colors block-11 inline-full user-invalid:border-red-400/80 focus:border-orange-500 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden user-invalid:focus:ring-red-400/20"
                />
              </div>
            </div>

            <div class="flex justify-center pbs-1">
              <div
                class="w-fit origin-center scale-85 rounded-xl border border-dashed p-2 transition-all sm:scale-100"
                :class="[statusKey.includes('Captcha') ? 'border-red-400/80' : 'border-white/10']"
              >
                <Recaptcha
                  v-if="hasRecaptchaV2"
                  ref="recaptchaRef"
                  :sitekey="RECAPTCHA_V2_SITE_KEY"
                  theme="dark"
                  size="normal"
                />
                <div
                  v-else
                  class="rounded-lg border border-white/10 bg-white/5 p-2 font-mono text-xs text-slate-400"
                >
                  reCAPTCHA not configured
                </div>
              </div>
            </div>
          </fieldset>

          <label
            v-if="statusKey"
            for="newsletter-status"
            class="sr-only"
          >
            {{ t("footer.newsletterStatus", "Subscription status") }}
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
            class="mbs-5 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-linear-to-br from-amber-orange to-orange font-mono text-sm font-semibold text-white shadow-md shadow-orange/20 transition-all duration-200 select-none block-11 inline-full hover:shadow-lg hover:shadow-orange/30 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-hidden active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-md disabled:hover:brightness-100 disabled:active:scale-100"
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

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { actions } from "astro:actions";
import { Loader2, Mail, User, X } from "lucide-react";
import type ReCAPTCHAComponent from "react-google-recaptcha";
import { hasRecaptchaV2, RECAPTCHA_V2_SITE_KEY } from "@/lib/client-env";
import { useTranslation } from "@/lib/hooks/useTranslation";

const ReCAPTCHA = lazy(() => import("react-google-recaptcha"));

export default function NewsletterModal({
  isOpen,
  onCloseAction,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [statusKey, setStatusKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaReference = useRef<ReCAPTCHAComponent>(null);
  const dialogReference = useRef<HTMLDialogElement>(null);
  const timerReference = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentTimer = timerReference.current;
    return () => {
      if (currentTimer !== null) {
        clearTimeout(currentTimer);
      }
    };
  }, []);

  if (!isOpen) return null;

  const dialogReferenceCallback = (element: HTMLDialogElement | null) => {
    dialogReference.current = element;
    if (element && isOpen && !element.open) element.showModal();
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || isSubmitting) return;

    const recaptchaToken = recaptchaReference.current?.getValue() ?? "";
    if (!recaptchaToken) {
      setStatusKey("footer.newsletterCaptchaError");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await actions["newsletter"]({ name, email, recaptchaToken });

      if (error) {
        setStatusKey("footer.newsletterFailure");
      } else if (data) {
        if (data.ok) {
          setName("");
          setEmail("");
          recaptchaReference.current?.reset();
          timerReference.current = setTimeout(() => {
            timerReference.current = null;
            onCloseAction();
          }, 2000);
        }
        setStatusKey(data.statusKey);
      }
    } catch {
      setStatusKey("footer.newsletterFailure");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogReferenceCallback}
      onCancel={(event) => {
        event.preventDefault();
        onCloseAction();
      }}
      aria-modal="true"
      aria-labelledby="newsletter-dialog-title"
      className="fixed inset-0 z-50 m-auto overflow-visible rounded-3xl border border-neutral-200 bg-transparent p-0 text-neutral-900 shadow-2xl transition-all duration-300 inline-[95vw] max-inline-md backdrop:bg-black/50 backdrop:backdrop-blur-sm backdrop:transition-all backdrop:duration-300 open:flex open:flex-col starting:backdrop:bg-black/0 starting:open:scale-95 starting:open:opacity-0"
    >
      <div
        role="presentation"
        className="flex flex-1 flex-col rounded-3xl bg-white"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onCloseAction();
          }
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="mbe-6 flex items-start justify-between">
            <div>
              <h2
                id="newsletter-dialog-title"
                className="text-xl font-semibold text-neutral-900"
              >
                {t("footer.newsletter")}
              </h2>
              <p className="mbs-1.5 text-sm leading-relaxed text-neutral-500">
                {t("footer.newsletterDescription")}
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseAction}
              aria-label={t("footer.newsletterCloseAria")}
              className="-me-1 -mbs-1 flex size-9 items-center justify-center rounded-full text-neutral-400 transition-colors pointer-fine:hover:bg-neutral-100 pointer-fine:hover:text-neutral-600"
            >
              <X className="size-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            aria-label={t("footer.newsletterAria")}
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newsletter-name"
                  className="mbe-1.5 block text-sm font-medium text-neutral-700"
                >
                  {t("footer.newsletterNameLabel")}
                </label>
                <div className="relative">
                  <User className="absolute inset-s-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="newsletter-name"
                    type="text"
                    name="name"
                    placeholder={t("footer.newsletterNamePlaceholder")}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    minLength={2}
                    autoComplete="name"
                    className="rounded-full border border-neutral-200 bg-neutral-50 ps-10 pe-4 text-sm text-neutral-900 transition-all duration-200 block-11 inline-full placeholder:text-neutral-400 user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="newsletter-email"
                  className="mbe-1.5 block text-sm font-medium text-neutral-700"
                >
                  {t("footer.newsletterInputAria")}
                </label>
                <div className="relative">
                  <Mail className="absolute inset-s-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="newsletter-email"
                    type="email"
                    name="email"
                    placeholder={t("footer.newsletterPlaceholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    className="rounded-full border border-neutral-200 bg-neutral-50 ps-10 pe-4 text-sm text-neutral-900 transition-all duration-200 block-11 inline-full placeholder:text-neutral-400 user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-center pbs-1">
                <div
                  className={`origin-center scale-[0.85] rounded-2xl border border-dashed p-3 sm:scale-100 ${
                    statusKey.includes("Captcha") ? "border-red-300" : "border-neutral-200"
                  }`}
                >
                  {hasRecaptchaV2 ?
                    <Suspense
                      fallback={
                        <div className="rounded-lg bg-amber-50 p-2 text-sm text-amber-600">
                          Loading reCAPTCHA...
                        </div>
                      }
                    >
                      <ReCAPTCHA
                        ref={recaptchaReference}
                        sitekey={RECAPTCHA_V2_SITE_KEY}
                        theme="light"
                        size="normal"
                      />
                    </Suspense>
                  : <div className="rounded-lg bg-amber-50 p-2 text-sm text-amber-600">
                      reCAPTCHA not configured
                    </div>
                  }
                </div>
              </div>
            </div>

            {statusKey ?
              <p
                className={`mbs-4 text-center text-sm font-medium ${
                  statusKey.includes("Success") ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {t(statusKey)}
              </p>
            : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mbs-5 flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange to-amber-500 text-sm font-semibold text-white shadow-md transition-all duration-300 block-11 inline-full active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 pointer-fine:hover:scale-[1.02] pointer-fine:hover:shadow-lg pointer-fine:hover:shadow-orange-500/30 disabled:pointer-fine:hover:scale-100"
            >
              {isSubmitting ?
                <Loader2 className="size-4 animate-spin" />
              : t("footer.newsletterSubscribe")}
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

import { lazy, Suspense, useActionState, useEffect, useReducer, useRef } from "react";
import { withState } from "@astrojs/react/actions";
import { actions } from "astro:actions";
import { useFormStatus } from "react-dom";
import type ReCAPTCHAComponent from "react-google-recaptcha";
import { hasRecaptchaV2, RECAPTCHA_V2_SITE_KEY } from "@/lib/client-env";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/shared/ui/Loading";
import { ContactFormFields } from "./ContactFormFields";
import { ContactInfoSidebar } from "./ContactInfoSidebar";

const ReCAPTCHA = lazy(() => import("react-google-recaptcha"));

function SubmitButton() {
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex transform items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase shadow-lg shadow-orange-500/25 transition duration-300 ease-in-out inline-full disabled:opacity-60 md:inline-auto md:min-inline-50 pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-xl pointer-fine:hover:brightness-110"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ?
        <LoadingSpinner size="sm" />
      : null}
      {pending ? t("contact.form.sending", "Sending…") : t("contact.form.cta", "Send message")}
    </button>
  );
}

type ContactFormUIState = { captchaToken: string; formKey: number };

type ContactFormUIAction =
  | { type: "SET_CAPTCHA"; token: string }
  | { type: "RESET_CAPTCHA" }
  | { type: "RESET_AFTER_SUCCESS" };

const initialContactFormUIState: ContactFormUIState = { captchaToken: "", formKey: 0 };

function contactFormUIReducer(
  state: ContactFormUIState,
  action: ContactFormUIAction,
): ContactFormUIState {
  switch (action.type) {
    case "SET_CAPTCHA": {
      return { ...state, captchaToken: action.token };
    }
    case "RESET_CAPTCHA": {
      return { ...state, captchaToken: "" };
    }
    case "RESET_AFTER_SUCCESS": {
      return { captchaToken: "", formKey: state.formKey + 1 };
    }
    default: {
      return state;
    }
  }
}

const alertClasses: Record<string, string> = {
  success: "bg-green-50 text-green-800 border border-green-100",
  error: "bg-rose-50 text-rose-700 border border-rose-100",
};

const ContactForm = () => {
  const { t } = useTranslation();
  const recaptchaReference = useRef<ReCAPTCHAComponent>(null);
  const [uiState, dispatch] = useReducer(contactFormUIReducer, initialContactFormUIState);

  type AstroActionResult = { data?: FormState; error?: { message: string } };

  const [actionResult, formAction] = useActionState<AstroActionResult | null, FormData>(
    withState(actions.contact) as unknown as (
      state: AstroActionResult | null,
      formData: FormData,
    ) => Promise<AstroActionResult | null>,
    null,
  );

  const state: FormState | null =
    actionResult ?
      actionResult.data ?
        actionResult.data
      : {
          success: false,
          message: actionResult.error?.message || "Form submission failed",
          errors: {},
        }
    : null;

  const stateReference = useRef(state);
  useEffect(() => {
    stateReference.current = state;
  });

  useEffect(() => {
    const currentState = stateReference.current;
    if (!currentState) return;

    if (currentState["success"]) {
      queueMicrotask(() => dispatch({ type: "RESET_AFTER_SUCCESS" }));
    } else if (currentState["errors"]) {
      recaptchaReference.current?.reset();
      queueMicrotask(() => dispatch({ type: "RESET_CAPTCHA" }));
      const firstError = document.querySelector('[aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [actionResult]);

  return (
    <section
      id="contact-tailwind"
      aria-labelledby="contact-heading"
      className="bg-neutral-50 py-12 md:py-16"
    >
      <div className="mx-auto px-4 max-inline-6xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="inline-full lg:col-span-3">
            <div className="overflow-hidden rounded-3xl bg-white block-full">
              <div className="bg-linear-to-r from-orange-500 to-orange-600 px-6 py-8 text-white">
                <p className="text-xs font-semibold tracking-[0.35em] text-orange-100 uppercase">
                  {t("contact.form.badge", "Plan with locals")}
                </p>
                <h2
                  className="mbs-2 text-2xl font-semibold md:text-3xl"
                  id="contact-heading"
                >
                  {t("contact.form.title", "Design Your Custom Morocco Tour & Private Itinerary")}
                </h2>
                <p className="mbs-3 text-sm text-orange-50/90 md:text-base">
                  {t(
                    "contact.form.subtitle",
                    "Share a few details and we will craft a bespoke itinerary for you.",
                  )}
                </p>
              </div>

              <form
                key={uiState.formKey}
                action={formAction}
                noValidate
                className="space-y-5 p-6 md:p-8"
                data-form="contact"
              >
                {state?.["message"] ?
                  <output
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium",
                      state?.["success"] ? alertClasses["success"] : alertClasses["error"],
                    )}
                    role={state?.["success"] ? undefined : "alert"}
                    aria-live="polite"
                  >
                    {state?.["message"]}
                  </output>
                : null}

                {state?.["errors"] && Object.keys(state["errors"]).length > 0 ?
                  <div
                    className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
                    role="alert"
                  >
                    <p className="mbe-2 text-sm font-semibold text-orange-900">
                      {t("contact.form.errors.title", "Please complete these fields:")}
                    </p>
                    <ul className="space-y-1 text-xs text-orange-800">
                      {Object.entries(state["errors"]).map(([field, error]) => (
                        <li
                          key={field}
                          className="flex items-start gap-2"
                        >
                          <svg
                            className="mbs-0.5 size-4 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                : null}

                <div
                  aria-hidden="true"
                  className="absolute -left-2499.75 h-0 overflow-hidden"
                >
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-label="Leave this field empty"
                  />
                </div>

                <ContactFormFields state={state} />

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex justify-center inline-full lg:justify-start">
                    <div
                      className={cn(
                        "w-fit origin-center scale-85 rounded-2xl border border-dashed p-3 transition-all duration-500 sm:scale-100",
                        state?.["errors"]?.["recaptchaToken"] ?
                          "border-red-300"
                        : "border-neutral-200",
                      )}
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
                            onChange={(token: string | null) =>
                              dispatch({ type: "SET_CAPTCHA", token: token || "" })
                            }
                          />
                          <input
                            type="hidden"
                            name="recaptchaToken"
                            value={uiState.captchaToken}
                          />
                        </Suspense>
                      : <div className="rounded-lg bg-amber-50 p-2 text-sm text-amber-600">
                          reCAPTCHA not configured
                        </div>
                      }
                    </div>
                  </div>
                  {state?.["errors"]?.["recaptchaToken"] ?
                    <p
                      id="recaptchaToken-error"
                      className="mbs-1 text-xs text-red-600"
                    >
                      {state["errors"]["recaptchaToken"]}
                    </p>
                  : null}
                  <SubmitButton />
                </div>
              </form>
            </div>
          </div>

          <div className="inline-full lg:col-span-2 lg:block-full">
            <div className="flex flex-col justify-between rounded-3xl bg-slate-950 p-8 text-white block-full">
              <ContactInfoSidebar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

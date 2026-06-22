import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/useTranslation";

type ContactFormFieldsProperties = { state: FormState | null };

export function ContactFormFields({ state }: ContactFormFieldsProperties) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="sr-only"
          >
            {t("contact.form.fields.name", "Full name")}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
            maxLength={100}
            placeholder={t("contact.form.fields.name", "Full name")}
            aria-label={t("contact.form.fields.name", "Full name")}
            autoComplete="name"
            required
            aria-invalid={state?.errors?.["name"] ? "true" : "false"}
            aria-describedby={state?.errors?.["name"] ? "name-error" : undefined}
          />
          {state?.errors?.["name"] ?
            <p
              id="name-error"
              className="mbs-1 text-xs text-red-600"
            >
              {state.errors["name"]}
            </p>
          : null}
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="sr-only"
          >
            {t("contact.form.fields.email", "Email")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
            placeholder={t("contact.form.fields.email", "Email")}
            aria-label={t("contact.form.fields.email", "Email")}
            autoComplete="email"
            required
            aria-invalid={state?.errors?.["email"] ? "true" : "false"}
            aria-describedby={state?.errors?.["email"] ? "email-error" : undefined}
          />
          {state?.errors?.["email"] ?
            <p
              id="email-error"
              className="mbs-1 text-xs text-red-600"
            >
              {state.errors["email"]}
            </p>
          : null}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="contact-phone"
            className="sr-only"
          >
            {t("contact.form.fields.phone", "Phone number")}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
            maxLength={20}
            placeholder={t("contact.form.fields.phone", "Phone number")}
            aria-label={t("contact.form.fields.phone", "Phone number")}
            autoComplete="tel"
            required
            aria-invalid={state?.errors?.["phone"] ? "true" : "false"}
            aria-describedby={state?.errors?.["phone"] ? "phone-error" : undefined}
          />
          {state?.errors?.["phone"] ?
            <p
              id="phone-error"
              className="mbs-1 text-xs text-red-600"
            >
              {state.errors["phone"]}
            </p>
          : null}
        </div>
        <div>
          <label
            htmlFor="contact-topic"
            className="sr-only"
          >
            {t("contact.form.fields.topic", "Trip focus (optional)")}
          </label>
          <input
            id="contact-topic"
            name="topic"
            type="text"
            className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
            placeholder={t("contact.form.fields.topic", "Trip focus (optional)")}
            aria-label={t("contact.form.fields.topic", "Trip focus (optional)")}
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="sr-only"
        >
          {t("contact.form.fields.message", "Message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full min-block-40 user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          maxLength={1000}
          placeholder={t("contact.form.fields.message", "Tell us about your Morocco dream")}
          aria-label={t("contact.form.fields.message", "Tell us about your Morocco dream")}
          autoComplete="off"
          required
          aria-invalid={state?.errors?.["message"] ? "true" : "false"}
          aria-describedby={state?.errors?.["message"] ? "message-error" : undefined}
        />
        {state?.errors?.["message"] ?
          <p
            id="message-error"
            className="mbs-1 text-xs text-red-600"
          >
            {state.errors["message"]}
          </p>
        : null}
      </div>
    </>
  );
}

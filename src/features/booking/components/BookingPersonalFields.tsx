import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/useTranslation";

type BookingPersonalFieldsProperties = { state: FormState | null };

export function BookingPersonalFields({ state }: BookingPersonalFieldsProperties) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="fullName"
            className="sr-only"
          >
            {t("booking.fullName", "Full Name")}
          </label>
          <input
            className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
            maxLength={100}
            type="text"
            id="fullName"
            name="fullName"
            placeholder={t("booking.fullName", "Full Name")}
            aria-label={t("booking.fullName", "Full Name")}
            autoComplete="name"
            aria-invalid={state?.errors?.["fullName"] ? "true" : "false"}
            aria-describedby={state?.errors?.["fullName"] ? "fullName-error" : undefined}
            required
          />
          {state?.errors?.["fullName"] ?
            <p
              id="fullName-error"
              className="mbs-1 text-xs text-red-600"
            >
              {state.errors["fullName"]}
            </p>
          : null}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="sr-only"
          >
            {t("booking.phone", "Phone Number")}
          </label>
          <input
            className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
            maxLength={20}
            type="tel"
            id="phone"
            name="phone"
            placeholder={t("booking.phone", "Phone Number")}
            aria-label={t("booking.phone", "Phone Number")}
            autoComplete="tel"
            aria-invalid={state?.errors?.["phone"] ? "true" : "false"}
            aria-describedby={state?.errors?.["phone"] ? "phone-error" : undefined}
            required
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
      </div>

      <div>
        <label
          htmlFor="email"
          className="sr-only"
        >
          {t("booking.email", "Email")}
        </label>
        <input
          className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          type="email"
          id="email"
          name="email"
          placeholder={t("booking.email", "Email")}
          aria-label={t("booking.email", "Email")}
          autoComplete="email"
          aria-invalid={state?.errors?.["email"] ? "true" : "false"}
          aria-describedby={state?.errors?.["email"] ? "email-error" : undefined}
          required
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
    </>
  );
}

import { useEffect, useState } from "react";
import { format as formatDate } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { EnhancedCalendar } from "@/shared/ui/calendar";
import { NativePopover } from "@/shared/ui/NativePopover";

type BookingTripDetailsProps = {
  state: FormState | null;
  locale: string;
  calendarOpen: boolean;
  reservationDate: Date | null;
  onCalendarOpenChange: (open: boolean) => void;
  onDateSelect: (date: Date | null) => void;
};

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function BookingTripDetails({
  state,
  locale,
  calendarOpen,
  reservationDate,
  onCalendarOpenChange,
  onDateSelect,
}: BookingTripDetailsProps) {
  const { t } = useTranslation();
  const [minimumReservationDate, setMinimumReservationDate] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;

    queueMicrotask(() => {
      if (mounted) {
        setMinimumReservationDate(getStartOfToday());
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="numberOfPeople"
            className="sr-only"
          >
            {t("booking.numberOfPeople", "Number of People")}
          </label>
          <input
            className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
            type="number"
            id="numberOfPeople"
            name="numberOfPeople"
            placeholder={t("booking.numberOfPeople", "Number of People")}
            aria-label={t("booking.numberOfPeople", "Number of People")}
            autoComplete="off"
            min="1"
            max="50"
            aria-invalid={state?.errors?.["persons"] ? "true" : "false"}
            aria-describedby={state?.errors?.["persons"] ? "numberOfPeople-error" : undefined}
            required
          />
          {state?.errors?.["persons"] ?
            <p
              id="numberOfPeople-error"
              className="mbs-1 text-xs text-red-600"
            >
              {state.errors["persons"]}
            </p>
          : null}
        </div>

        <div>
          <NativePopover
            isOpen={calendarOpen}
            onOpenChange={onCalendarOpenChange}
            trigger={
              <button
                type="button"
                className={cn(
                  "flex items-center justify-start rounded-2xl border bg-white px-4 py-3 text-start text-sm font-normal transition-colors block-auto inline-full focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden pointer-fine:hover:bg-neutral-50",
                  !reservationDate && "text-neutral-500",
                  state?.errors?.["date"] ? "border-red-300" : "border-neutral-200",
                )}
                aria-describedby={state?.errors?.["date"] ? "reservationDate-error" : undefined}
              >
                <CalendarIcon className="me-2 size-4" />
                {reservationDate ?
                  <span suppressHydrationWarning>
                    {reservationDate.toLocaleDateString(locale || "en", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                : <span>{t("booking.reservationDate")}</span>}
              </button>
            }
          >
            <div className="z-50 overflow-hidden rounded-2xl border border-neutral-100 bg-white p-0 shadow-2xl ring-1 ring-black/5 outline-hidden inline-auto">
              <EnhancedCalendar
                key={`${reservationDate?.getTime()}-${calendarOpen}`}
                initialDate={reservationDate ?? undefined}
                onSelect={(date: Date | undefined) => {
                  onDateSelect(date ?? null);
                }}
                onClose={() => onCalendarOpenChange(false)}
                disabled={(date: Date) =>
                  minimumReservationDate ? date < minimumReservationDate : false
                }
              />
            </div>
          </NativePopover>
          <input
            type="hidden"
            name="reservationDate"
            value={reservationDate ? formatDate(reservationDate, "yyyy-MM-dd") : ""}
          />
          {state?.errors?.["date"] ?
            <p
              id="reservationDate-error"
              className="mbs-1 text-xs text-red-600"
            >
              {state.errors["date"]}
            </p>
          : null}
        </div>
      </div>

      <div className="inline-full">
        <label
          htmlFor="message"
          className="sr-only"
        >
          {t("booking.message", "Your message")}
        </label>
        <textarea
          className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm inline-full user-valid:border-green-500 user-invalid:border-red-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
          maxLength={1000}
          id="message"
          name="message"
          placeholder={t("booking.message", "Your message")}
          autoComplete="off"
          rows={4}
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

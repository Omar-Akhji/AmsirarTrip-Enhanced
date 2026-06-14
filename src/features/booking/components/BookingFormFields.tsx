import type { FormState } from "@/lib/form-types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { BookingPersonalFields } from "./BookingPersonalFields";
import { BookingTripDetails } from "./BookingTripDetails";

type BookingFormFieldsProps = {
  state: FormState | null;
  selectedTour: string;
  tourTitle?: string | undefined;
  tourId?: string | undefined;
  tourDuration: number | null;
  excursionTitle?: string | undefined;
  excursionId?: string | undefined;
  locale: string;
  calendarOpen: boolean;
  reservationDate: Date | null;
  onCalendarOpenChange: (open: boolean) => void;
  onDateSelect: (date: Date | null) => void;
};

export function BookingFormFields({
  state,
  selectedTour,
  tourTitle,
  tourId,
  tourDuration,
  excursionTitle,
  excursionId,
  locale,
  calendarOpen,
  reservationDate,
  onCalendarOpenChange,
  onDateSelect,
}: BookingFormFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      {selectedTour ?
        <>
          <input
            type="hidden"
            name="reservationType"
            value={selectedTour}
          />
          {tourDuration ?
            <input
              type="hidden"
              name="duration"
              value={tourDuration}
            />
          : null}
          <input
            type="hidden"
            name="language"
            value={locale}
          />
        </>
      : null}

      {tourTitle && tourId ?
        <div className="mbe-6">
          <input
            className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 inline-full"
            type="text"
            value={selectedTour}
            readOnly
            aria-label={t("booking.selectedTour", "Selected Tour")}
          />
        </div>
      : null}

      {excursionTitle && excursionId ?
        <div className="mbe-6">
          <input
            className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 inline-full"
            type="text"
            value={excursionTitle}
            readOnly
            aria-label={t("booking.selectedExcursion", "Selected Excursion")}
          />
        </div>
      : null}

      <BookingPersonalFields state={state} />

      <BookingTripDetails
        state={state}
        locale={locale}
        calendarOpen={calendarOpen}
        reservationDate={reservationDate}
        onCalendarOpenChange={onCalendarOpenChange}
        onDateSelect={onDateSelect}
      />
    </>
  );
}

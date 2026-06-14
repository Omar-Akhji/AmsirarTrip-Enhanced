import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

type EnhancedCalendarProps = {
  initialDate?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  onClose?: () => void;
};

type CalendarState = { selectedDate: Date | undefined; currentMonth: Date };

type CalendarAction =
  | { type: "SELECT_DATE"; date: Date | undefined }
  | { type: "SET_MONTH"; month: Date }
  | { type: "MOVE_MONTH"; direction: "prev" | "next" }
  | { type: "GO_TO_TODAY"; today: Date };

function createCalendarState(initialDate: Date | undefined): CalendarState {
  return { selectedDate: initialDate, currentMonth: initialDate ?? new Date() };
}

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case "SELECT_DATE": {
      return { ...state, selectedDate: action.date };
    }
    case "SET_MONTH": {
      return { ...state, currentMonth: action.month };
    }
    case "MOVE_MONTH": {
      const currentMonth = new Date(state.currentMonth);
      currentMonth.setMonth(currentMonth.getMonth() + (action.direction === "prev" ? -1 : 1));
      return { ...state, currentMonth };
    }
    case "GO_TO_TODAY": {
      return { selectedDate: action.today, currentMonth: action.today };
    }
    default: {
      return state;
    }
  }
}

export function EnhancedCalendar({
  initialDate,
  onSelect,
  disabled,
  className,
  onClose,
}: EnhancedCalendarProps) {
  const [calendarState, dispatch] = React.useReducer(
    calendarReducer,
    initialDate,
    createCalendarState,
  );
  const { currentMonth, selectedDate } = calendarState;

  const handleDayClick = (date: Date | undefined) => {
    dispatch({ type: "SELECT_DATE", date });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    dispatch({ type: "MOVE_MONTH", direction });
  };

  const goToToday = () => {
    const today = new Date();
    dispatch({ type: "GO_TO_TODAY", today });
    onSelect?.(today);
    onClose?.();
  };

  const handleApply = () => {
    if (selectedDate) {
      onSelect?.(selectedDate);
      onClose?.();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden rounded-2xl bg-linear-to-br from-white to-orange-50/30 p-5 shadow-2xl ring-1 shadow-orange-900/10 ring-orange-500/20 backdrop-blur-sm">
        <div className="mbe-4 flex items-center justify-center gap-4 border-b border-orange-100 pbe-3">
          <button
            type="button"
            onClick={() => navigateMonth("prev")}
            className="flex items-center justify-center rounded-full text-orange-600 transition-colors block-8 inline-8 focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:outline-hidden pointer-fine:hover:bg-orange-50"
            aria-label="Previous month"
          >
            <ChevronLeft className="block-4 inline-4" />
          </button>

          <div className="flex items-center gap-2">
            <CalendarIcon className="text-orange-600 block-4 inline-4" />
            <span
              className="text-sm font-semibold text-neutral-900"
              suppressHydrationWarning
            >
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigateMonth("next")}
            className="flex items-center justify-center rounded-full text-orange-600 transition-colors block-8 inline-8 focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:outline-hidden pointer-fine:hover:bg-orange-50"
            aria-label="Next month"
          >
            <ChevronRight className="block-4 inline-4" />
          </button>
        </div>

        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDayClick}
          month={currentMonth}
          onMonthChange={(month) => dispatch({ type: "SET_MONTH", month })}
          disabled={disabled}
          showOutsideDays
          classNames={{
            root: "inline-fit bg-transparent p-2",
            months: "flex gap-6 flex-col md:flex-row",
            month: "flex flex-col inline-full gap-4",
            nav: "hidden",
            month_caption: "hidden",
            weekdays: "flex",
            weekday: "text-muted-foreground text-xs font-medium inline-9 text-center",
            week: "flex inline-full mbs-1",
            day: "relative p-0 text-center group/day aspect-square flex items-center justify-center",
            day_button: cn(
              "rounded-full p-0 text-sm font-normal transition-all duration-200 block-9 inline-9",
              "pointer-fine:hover:bg-orange-100 pointer-fine:hover:text-orange-900",
              "focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:outline-hidden",
              "aria-selected:bg-orange-600 aria-selected:font-semibold aria-selected:text-white",
              "disabled:cursor-not-allowed disabled:opacity-30",
            ),
            today:
              "relative after:content-[''] after:absolute after:bottom-1 after:start-1/2 after:-translate-x-1/2 after:block-1 after:inline-1 after:rounded-full after:bg-orange-600",
            outside: "text-muted-foreground/40",
            disabled: "text-muted-foreground/30",
            hidden: "invisible",
          }}
        />

        {selectedDate ?
          <div className="mbs-4 border-t border-orange-100 pbs-3">
            <div className="flex items-center gap-3 rounded-xl border border-orange-200/40 bg-linear-to-r from-orange-50 to-orange-100/50 px-4 py-2.5">
              <div className="shrink-0">
                <div className="animate-pulse rounded-full bg-orange-600 block-2 inline-2" />
              </div>
              <div className="flex-1 min-inline-0">
                <p
                  className="text-xs font-medium text-neutral-500"
                  suppressHydrationWarning
                >
                  {selectedDate.getTime() === initialDate?.getTime() ?
                    "Current Date"
                  : "New Selection"}
                </p>
                <p
                  className="truncate text-sm font-semibold text-neutral-900"
                  suppressHydrationWarning
                >
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        : null}

        <div className="mbs-4 flex items-center justify-between gap-2 border-t border-orange-100 pbs-3">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg border border-orange-200 px-3 py-1.5 text-sm font-medium text-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:outline-hidden pointer-fine:hover:bg-orange-50"
          >
            Today
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors duration-200 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-hidden pointer-fine:hover:border-neutral-400 pointer-fine:hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!selectedDate || selectedDate.getTime() === initialDate?.getTime()}
              type="button"
              className="rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 pointer-fine:hover:from-orange-600 pointer-fine:hover:to-orange-700 pointer-fine:hover:shadow-lg disabled:pointer-fine:hover:from-orange-500 disabled:pointer-fine:hover:to-orange-600"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

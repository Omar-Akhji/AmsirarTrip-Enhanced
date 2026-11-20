import type { TranslationFunction } from "@/i18n/core";

export interface PhoneInputLabels {
  readonly emptySearch?: string;
  readonly listboxAriaPrefix?: string;
  readonly searchPlaceholder?: string;
  readonly triggerAriaPrefix?: string;
}

export interface CalendarLabels {
  readonly apply: string;
  readonly cancel: string;
  readonly currentDate: string;
  readonly nextMonth: string;
  readonly prevMonth: string;
  readonly selectedDate: string;
  readonly today: string;
}

export interface ContactTopicOption {
  readonly isOther?: boolean;
  readonly label: string;
}

export interface BookingFormCopy {
  readonly badge: string;
  readonly calendarLabels: CalendarLabels;
  readonly captchaError: string;
  readonly captchaNotConfigured: string;
  readonly cta: string;
  readonly email: string;
  readonly emailPlaceholder: string;
  readonly fullName: string;
  readonly fullNamePlaceholder: string;
  readonly genericError: string;
  readonly makeReservation: string;
  readonly message: string;
  readonly messagePlaceholder: string;
  readonly numberOfPeople: string;
  readonly numberOfPeoplePlaceholder: string;
  readonly personalDetails: string;
  readonly phone: string;
  readonly phoneLabels: PhoneInputLabels;
  readonly phonePlaceholder: string;
  readonly reservationDate: string;
  readonly sending: string;
  readonly success: string;
  readonly tripDetails: string;
  readonly validationError: string;
}

export interface ContactFormCopy {
  readonly badge: string;
  readonly captchaError: string;
  readonly captchaNotConfigured: string;
  readonly cta: string;
  readonly customTopicPlaceholder: string;
  readonly details: string;
  readonly email: string;
  readonly emailPlaceholder: string;
  readonly genericError: string;
  readonly message: string;
  readonly messagePlaceholder: string;
  readonly name: string;
  readonly namePlaceholder: string;
  readonly phone: string;
  readonly phoneLabels: PhoneInputLabels;
  readonly phonePlaceholder: string;
  readonly sending: string;
  readonly success: string;
  readonly title: string;
  readonly topic: string;
  readonly topicPlaceholder: string;
  readonly topics: readonly ContactTopicOption[];
  readonly validationError: string;
}

function getPhoneInputLabels(t: TranslationFunction): PhoneInputLabels {
  return {
    emptySearch: t("phoneInput.emptySearch"),
    listboxAriaPrefix: t("phoneInput.listboxAriaPrefix"),
    searchPlaceholder: t("phoneInput.searchPlaceholder"),
    triggerAriaPrefix: t("phoneInput.triggerAriaPrefix"),
  };
}

function getCalendarLabels(t: TranslationFunction): CalendarLabels {
  return {
    apply: t("calendar.apply"),
    cancel: t("calendar.cancel"),
    currentDate: t("calendar.currentDate"),
    nextMonth: t("calendar.nextMonth"),
    prevMonth: t("calendar.prevMonth"),
    selectedDate: t("calendar.selectedDate"),
    today: t("calendar.today"),
  };
}

export function getBookingFormCopy(t: TranslationFunction): BookingFormCopy {
  return {
    badge: t("contact.form.badge"),
    calendarLabels: getCalendarLabels(t),
    captchaError: t("booking.errors.captcha"),
    captchaNotConfigured: t("footer.captchaNotConfigured"),
    cta: t("booking.checkAvailability"),
    email: t("booking.email"),
    emailPlaceholder: t("booking.placeholders.email"),
    fullName: t("booking.fullName"),
    fullNamePlaceholder: t("booking.placeholders.fullName"),
    genericError: t("booking.errors.generic"),
    makeReservation: t("booking.makeReservation"),
    message: t("booking.message"),
    messagePlaceholder: t("booking.placeholders.message"),
    numberOfPeople: t("booking.numberOfPeople"),
    numberOfPeoplePlaceholder: t("booking.placeholders.numberOfPeople"),
    personalDetails: t("booking.personalDetails"),
    phone: t("booking.phone"),
    phoneLabels: getPhoneInputLabels(t),
    phonePlaceholder: t("booking.placeholders.phone"),
    reservationDate: t("booking.reservationDate"),
    sending: t("booking.sending"),
    success: t("booking.success"),
    tripDetails: t("booking.tripDetails"),
    validationError: t("contact.form.errors.validation"),
  };
}

export function getContactFormCopy(t: TranslationFunction): ContactFormCopy {
  return {
    badge: t("contact.form.badge"),
    captchaError: t("contact.form.errors.captcha"),
    captchaNotConfigured: t("footer.captchaNotConfigured"),
    cta: t("contact.form.cta"),
    customTopicPlaceholder: t("contact.form.placeholders.customTopic"),
    details: t("contact.form.details"),
    email: t("contact.form.fields.email"),
    emailPlaceholder: t("contact.form.placeholders.email"),
    genericError: t("contact.form.errors.generic"),
    message: t("contact.form.fields.message"),
    messagePlaceholder: t("contact.form.placeholders.message"),
    name: t("contact.form.fields.name"),
    namePlaceholder: t("contact.form.placeholders.name"),
    phone: t("contact.form.fields.phone"),
    phoneLabels: getPhoneInputLabels(t),
    phonePlaceholder: t("contact.form.placeholders.phone"),
    sending: t("contact.form.sending"),
    success: t("contact.form.success"),
    title: t("contact.form.title"),
    topic: t("contact.form.fields.topic"),
    topicPlaceholder: t("contact.form.placeholders.topic"),
    topics: [
      { label: t("contact.form.topics.desert") },
      { label: t("contact.form.topics.custom") },
      { label: t("contact.form.topics.atlas") },
      { label: t("contact.form.topics.imperial") },
      { label: t("contact.form.topics.coastal") },
      { label: t("contact.form.topics.other"), isOther: true },
    ],
    validationError: t("contact.form.errors.validation"),
  };
}

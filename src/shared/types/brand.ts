// src/shared/types/brand.ts

declare const __brand: unique symbol;

/**
 * إنشاء نوع مميز (Branded Type) لمنع الخلط بين القيم الأولية المتشابهة مثل: TourId, BookingId,
 * PriceMAD, EmailAddress
 */
export type Branded<T, BrandName extends string> = T & { readonly [__brand]: BrandName };

/** أمثلة جاهزة للاستخدام في مشروعك: */
export type Slug = Branded<string, "Slug">;
export type IsoDateString = Branded<string, "IsoDateString">;

/**
 * دالة التحقق من الشمولية (Exhaustiveness Check) في جمل switch. تتوافق 100% مع قاعدة
 * @typescript-eslint/switch-exhaustiveness-check
 */
export function assertNever(value: never, message = "Unhandled discriminated union member"): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}

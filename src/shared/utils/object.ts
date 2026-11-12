// src/shared/utils/object.ts

/**
 * استخراج مفاتيح الكائن مع الحفاظ على أنواعها الدقيقة (keyof T) مفيد جداً عند المرور على قواميس
 * اللغات (Locales) أو الإعدادات الثابتة
 */
export function typedKeys<T extends object>(object: T): (keyof T & string)[] {
  return Object.keys(object) as (keyof T & string)[];
}

/** استخراج أزواج [key, value] مع الحفاظ على النوع الدقيق لكل مفتاح وقيمته */
export function typedEntries<T extends Record<string, unknown>>(
  object: T,
): [keyof T & string, T[keyof T & string]][] {
  return Object.entries(object) as [keyof T & string, T[keyof T & string]][];
}

/**
 * فحص آمن لوجود قيمة فعلية (غير null وغير undefined) يعمل كـ Type Guard مع دوال .filter(isDefined)
 * في المصفوفات
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** Core type-level primitives and utilities adhering to 2026 strict TypeScript standards. */

declare const brandSymbol: unique symbol;

export type Branded<T, BrandName extends string> = T & { readonly [brandSymbol]: BrandName };

export type TourSlug = Branded<string, "TourSlug">;
export type BookingId = Branded<number, "BookingId">;
export type EmailAddress = Branded<string, "EmailAddress">;

export function assertNever(value: never, message = "Unhandled union branch encountered"): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export type Result<T, E = Error> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

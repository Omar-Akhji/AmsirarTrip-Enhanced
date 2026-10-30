/**
 * Type-level regression testing suite enforcing 2026 strict TypeScript rules. Validates nominal
 * branding, Result patterns, exhaustiveness, and immutability.
 */
import type { BookingId, Branded, EmailAddress, Result, TourSlug } from "@/lib/types";
import { assertNever, Err, isNonNullable, Ok } from "@/lib/types";

// Type assertion helpers (Zero runtime cost, compile-time verified)
export type Expect<T extends true> = T;
export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
export type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true;

// 1. Branded Nominal Type Testing (Section 3.3)
export type TestTourSlugNotPlainString = Expect<NotEqual<TourSlug, string>>;
export type TestBookingIdNotPlainNumber = Expect<NotEqual<BookingId, number>>;
export type TestEmailAddressNotTourSlug = Expect<NotEqual<EmailAddress, TourSlug>>;
export type TestBrandingUnique = Expect<NotEqual<Branded<string, "A">, Branded<string, "B">>>;

// 2. Result Pattern Soundness (Section 7)
export type SuccessResult = Result<{ readonly id: string }, "NOT_FOUND">;
export type TestResultOkBranch = Expect<
  Equal<Extract<SuccessResult, { readonly ok: true }>["value"], { readonly id: string }>
>;
export type TestResultErrBranch = Expect<
  Equal<Extract<SuccessResult, { readonly ok: false }>["error"], "NOT_FOUND">
>;

// 3. Functional Invariants & Guards (Section 4)
export function testResultGuards(): boolean {
  const okValue = Ok({ token: "xyz" });
  if (okValue.ok && okValue.value.token.length === 0) {
    return false;
  }

  const errValue = Err(new Error("Network timeout"));
  return !errValue.ok && errValue.error.message.length > 0;
}

// 4. Non-Nullable Filter Guard (Section 4.2)
export function testNonNullableFilter(): readonly string[] {
  const nullableList: readonly (string | null | undefined)[] = ["valid", null, "item", undefined];
  return nullableList.filter(isNonNullable);
}

// 5. Exhaustiveness assertion (Section 4.1)
type AllowedModes = "walk" | "drive";

export function handleMode(mode: AllowedModes): string {
  switch (mode) {
    case "walk": {
      return "walking";
    }
    case "drive": {
      return "driving";
    }
    default: {
      return assertNever(mode);
    }
  }
}

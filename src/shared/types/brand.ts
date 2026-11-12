declare const __brand: unique symbol;

export type Branded<T, BrandName extends string> = T & { readonly [__brand]: BrandName };

export type Slug = Branded<string, "Slug">;
export type IsoDateString = Branded<string, "IsoDateString">;

export function assertNever(value: never, message = "Unhandled discriminated union member"): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}

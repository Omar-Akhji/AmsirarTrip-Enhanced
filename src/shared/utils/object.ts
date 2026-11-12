export function typedKeys<T extends Record<string, unknown>>(object: T): (keyof T & string)[] {
  return Object.keys(object);
}

export function typedEntries<T extends Record<string, unknown>>(
  object: T,
): [keyof T & string, T[keyof T & string]][] {
  return Object.entries(object) as [keyof T & string, T[keyof T & string]][];
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

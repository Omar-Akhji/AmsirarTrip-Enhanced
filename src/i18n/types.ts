import type en from "../locales/en/common.json";

export type Messages = typeof en;

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string | readonly string[] ? `${P}${K}`
  : T[K] extends Record<string, unknown> ? Leaves<T[K], `${P}${K}.`>
  : never;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;

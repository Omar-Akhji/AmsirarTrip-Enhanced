/**
 * Shared Tailwind animation delay utility classes. Centralized to follow DRY across view lists and
 * stats sections.
 */
export const DELAY_CLASSES = [
  "delay-0",
  "delay-150",
  "delay-300",
  "delay-[450ms]",
  "delay-[600ms]",
  "delay-[750ms]",
  "delay-[900ms]",
  "delay-[1050ms]",
] as const;

export type DelayClass = (typeof DELAY_CLASSES)[number];

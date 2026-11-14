/**
 * Shared Tailwind animation delay utility classes. Centralized to follow DRY across view lists and
 * stats sections.
 */
export const DELAY_CLASSES = [
  "animate-delay-0",
  "animate-delay-150",
  "animate-delay-300",
  "animate-delay-450",
  "animate-delay-600",
  "animate-delay-750",
  "animate-delay-900",
  "animate-delay-1050",
] as const;

export type DelayClass = (typeof DELAY_CLASSES)[number];

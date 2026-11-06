import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Splits a section title so the trailing accent words (last two words, or last single word for
 * two-word titles) can be highlighted with the brand accent color.
 */
export function splitTitleAccent(title: string): { main: string; accent: string } {
  const trimmed = title.trim();
  if (!trimmed) {
    return { main: "", accent: "" };
  }
  const words = trimmed.split(/\s+/);
  if (words.length <= 1) {
    return { main: trimmed, accent: "" };
  }
  if (words.length === 2) {
    return { main: words[0] ?? "", accent: words[1] ?? "" };
  }
  return { main: words.slice(0, -2).join(" "), accent: words.slice(-2).join(" ") };
}

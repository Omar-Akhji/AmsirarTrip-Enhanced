import type { ImageMetadata } from "astro";

export type Tour = {
  readonly id: number;
  readonly image: string | ImageMetadata;
  readonly title: string;
  readonly author: string;
  readonly category: string;
  readonly description: string;
  readonly duration: number;
  readonly start: string;
  readonly startLocation: string;
  readonly route: string;
  readonly end: string;
};

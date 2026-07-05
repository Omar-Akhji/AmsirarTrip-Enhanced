import type { ImageMetadata } from "astro";

export type Tour = {
  id: number;
  image: string | ImageMetadata;
  title: string;
  author: string;
  category: string;
  description: string;
  duration: number;
  start: string;
  route: string;
  end: string;
};

/// <reference types="astro/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "ascii-reveal/core" {
  export type PresetName = "decode" | "dither" | "terminal" | "blueprint";

  export interface Preset {
    ramp: string;
    scramble: string;
    mode: "ramp" | "random";
    color: "mono" | "source" | "accent";
    cells: number[];
    tick: number;
    cursor?: string | undefined;
    accentGlyphs?: boolean | undefined;
  }

  export const presets: Record<PresetName, Preset>;
  export function resolvePreset(p: PresetName | Preset | undefined): Preset;

  export type MascotName = "spider" | "ghost" | "pumpkin" | "bat";
  export type MascotDraw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    color: string,
  ) => void;
  export const mascots: Record<MascotName, MascotDraw>;
  export function imageMascot(src: string): MascotDraw;

  export type Origin = "center" | "top-left" | "pointer" | { x: number; y: number };
  export type Duration = "fast" | "cinematic";

  export interface AsciiRevealOptions {
    preset?: PresetName | Preset | undefined;
    speed?: number | undefined;
    duration?: Duration | undefined;
    origin?: Origin | undefined;
    selector?: string | undefined;
    surfaces?: string | undefined;
    fades?: string | undefined;
    media?: string | undefined;
    overlay?: HTMLElement | undefined;
    mascot?: MascotName | string | MascotDraw | null | undefined;
    lazy?: boolean | undefined;
    fallback?: boolean | undefined;
  }

  export interface RunOptions {
    origin?: Origin | undefined;
    within?: Element | undefined;
    speed?: number | undefined;
    duration?: Duration | undefined;
    preset?: PresetName | Preset | undefined;
    instant?: boolean | undefined;
  }

  export interface AsciiRevealController {
    reveal: (options?: RunOptions | undefined) => Promise<void>;
    hide: (options?: RunOptions | undefined) => Promise<void>;
    shimmer: (on: boolean) => void;
    update: (options: Partial<AsciiRevealOptions>) => void;
    destroy: () => void;
  }

  export function createAsciiReveal(
    root: HTMLElement,
    options?: AsciiRevealOptions | undefined,
  ): AsciiRevealController;

  export type SkeletonVariant = "dither" | "scan" | "braille" | "terminal";

  export interface VariantSpec {
    base: string;
    wave: string;
    gap: number;
    bias: number;
  }

  export const SKELETON_VARIANTS: Record<SkeletonVariant, VariantSpec>;
  export const SKELETON_CSS: string;
  export function glyphRow(
    seed: number,
    len: number,
    ramp?: string | undefined,
    gap?: number | undefined,
    bias?: number | undefined,
  ): string;

  export interface SkeletonSpec {
    variant?: SkeletonVariant | undefined;
    lines?: number | undefined;
    widths?: (string | number)[] | undefined;
    rows?: number | undefined;
    seed?: number | undefined;
    css?: boolean | undefined;
    animate?: boolean | undefined;
  }

  export function asciiSkeletonHTML(spec?: SkeletonSpec | undefined): string;
  export function animateSkeleton(root: HTMLElement): () => void;
  export function animateSkeletons(scope?: ParentNode | undefined): () => void;
}

declare namespace App {
  interface Locals {
    cspNonce: string;
  }
}

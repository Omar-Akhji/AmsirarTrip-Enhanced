import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "tripadvisor"
  | "whatsapp"
  | "danger"
  | "card";

export type ButtonSize = "sm" | "md" | "lg";

const baseButtonStyles =
  "inline-flex items-center justify-center rounded-full font-mono font-semibold tracking-wider transition-all duration-200 cursor-pointer select-none active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-11 sm:min-h-9 px-4 py-1.5 text-xs gap-1.5",
  md: "min-h-11 px-6 py-2.5 text-sm gap-2",
  lg: "min-h-13 px-8 py-3.5 text-base gap-2.5",
};

const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-br from-amber-orange to-orange text-white shadow-md shadow-orange/20 hover:brightness-105 hover:shadow-lg hover:shadow-orange/30 focus-visible:ring-offset-black",
  secondary:
    "border-[1.5px] border-white/30 bg-white/5 text-white backdrop-blur-xs hover:bg-white/15 hover:border-white/50 focus-visible:ring-offset-black",
  outline:
    "border-[1.5px] border-stone-300 bg-white text-stone-800 hover:border-stone-400 hover:bg-stone-50 shadow-2xs",
  ghost:
    "bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus-visible:ring-offset-black",
  tripadvisor:
    "bg-tripadvisor-bright text-black hover:bg-tripadvisor-dark hover:shadow-lg focus-visible:ring-tripadvisor-bright",
  whatsapp:
    "border-[1.5px] border-emerald-500/50 bg-slate-950/95 text-emerald-400 hover:bg-slate-900 hover:text-emerald-300 hover:border-emerald-400 focus-visible:ring-emerald-500",
  danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500",
  card:
    "w-full bg-slate-950 text-white tracking-wider transition-all duration-300 hover:bg-linear-to-br hover:from-amber-orange hover:to-orange hover:text-white hover:shadow-lg hover:shadow-orange/30 group-hover:bg-linear-to-br group-hover:from-amber-orange group-hover:to-orange group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange/30 dark:bg-black dark:text-white dark:hover:text-white dark:group-hover:text-white",
};

export interface ButtonStylesOptions {
  readonly variant?: ButtonVariant | undefined;
  readonly size?: ButtonSize | undefined;
  readonly className?: string | undefined;
}

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStylesOptions = {}): string {
  return cn(baseButtonStyles, buttonSizeStyles[size], buttonVariantStyles[variant], className);
}

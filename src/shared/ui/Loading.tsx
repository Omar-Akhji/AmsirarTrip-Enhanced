export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  let sizeClass = "size-8 border-3";
  if (size === "sm") {
    sizeClass = "size-4 border-2";
  } else if (size === "lg") {
    sizeClass = "size-12 border-4";
  }

  return (
    <output
      className={`${sizeClass} animate-spin rounded-full border-orange-500 border-t-transparent`}
      aria-label="Loading"
    >
      <span className="sr-only">Loading…</span>
    </output>
  );
}

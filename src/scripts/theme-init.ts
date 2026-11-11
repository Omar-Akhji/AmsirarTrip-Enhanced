try {
  const stored = localStorage.getItem("amsirar-theme");
  const isDark =
    stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDark) {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
  const colorSchemeMeta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (colorSchemeMeta) {
    colorSchemeMeta.content =
      stored ?
        isDark ? "dark"
        : "light"
      : "light dark";
  }
} catch {
  // localStorage might be unavailable or disabled
}

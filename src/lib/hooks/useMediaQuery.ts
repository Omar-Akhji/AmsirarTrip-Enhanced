import { ref, onMounted, onUnmounted, type Ref } from "vue";

export function useMediaQuery(query: string): Ref<boolean> {
  if (typeof window === "undefined") {
    return ref(false);
  }

  const mediaQuery = globalThis.matchMedia(query);
  const matches = ref(mediaQuery.matches);

  const listener = (event: MediaQueryListEvent) => {
    matches.value = event.matches;
  };

  onMounted(() => {
    mediaQuery.addEventListener("change", listener);
    // Sync initial state on mount
    matches.value = mediaQuery.matches;
  });

  onUnmounted(() => {
    mediaQuery.removeEventListener("change", listener);
  });

  return matches;
}

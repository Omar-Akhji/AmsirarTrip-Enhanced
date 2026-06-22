import { useSyncExternalStore } from "react";

const getServerSnapshot = () => {
  return false;
};

export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    if (globalThis === undefined) return () => {};
    const matchMedia = globalThis.matchMedia(query);
    matchMedia.addEventListener("change", callback);
    return () => {
      matchMedia.removeEventListener("change", callback);
    };
  };

  const getSnapshot = () => {
    if (globalThis === undefined) return false;
    return globalThis.matchMedia(query).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

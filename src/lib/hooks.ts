"use client";

import { useSyncExternalStore } from "react";

function mediaStore(query: string) {
  return {
    subscribe(cb: () => void) {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    get: () => window.matchMedia(query).matches,
  };
}

/** Media query hook. Returns `serverValue` during SSR / hydration. */
export function useMedia(query: string, serverValue = false) {
  const s = mediaStore(query);
  return useSyncExternalStore(s.subscribe, s.get, () => serverValue);
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
export const useDesktop = () => useMedia("(min-width: 1024px)");

/* ---------- intro state (shared between the hero intro and the navbar) ---------- */
let introDone = false;
const listeners = new Set<() => void>();
export const intro = {
  set(v: boolean) {
    introDone = v;
    listeners.forEach((l) => l());
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};
export const useIntroDone = () =>
  useSyncExternalStore(intro.subscribe, () => introDone, () => false);

/* ---------- scroll lock (intro, mobile menu, lightbox) ---------- */
const locks = new Set<string>();
const lockListeners = new Set<(locked: boolean) => void>();
export const scrollLock = {
  set(key: string, on: boolean) {
    if (on) locks.add(key);
    else locks.delete(key);
    const locked = locks.size > 0;
    document.documentElement.style.overflow = locked ? "hidden" : "";
    lockListeners.forEach((l) => l(locked));
  },
  isLocked: () => locks.size > 0,
  subscribe(cb: (locked: boolean) => void) {
    lockListeners.add(cb);
    return () => lockListeners.delete(cb);
  },
};

/* ---------- lenis access ---------- */
type LenisLike = {
  stop: () => void;
  start: () => void;
  scrollTo: (t: string | number | HTMLElement, o?: { offset?: number; immediate?: boolean }) => void;
};
export const getLenis = () =>
  (typeof window !== "undefined" ? (window as unknown as { __lenis?: LenisLike }).__lenis : undefined);

export function scrollToTarget(target: string | number) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(target, { offset: 0 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

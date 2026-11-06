"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollLock } from "@/lib/hooks";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const applyLock = (locked: boolean) => (locked ? lenis.stop() : lenis.start());
    applyLock(scrollLock.isLocked());
    const unsubLock = scrollLock.subscribe(applyLock);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // smooth in-page anchor links
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.pathname === location.pathname && url.hash) {
        const el = document.querySelector(url.hash);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el as HTMLElement);
          history.replaceState(null, "", url.hash);
        }
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      unsubLock();
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return null;
}

"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Fades/scales children marked with [data-reveal] in with stagger when scrolled into view. */
export default function Reveal({
  children,
  className = "",
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", ref.current);
      if (!items.length) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.set(items, { autoAlpha: 0, y: 28, scale: 0.98 });
      ScrollTrigger.batch(items, {
        start: "top 90%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", stagger: 0.08 }),
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}

"use client";

import { useRef, type ReactNode } from "react";

/** 3D tilt (max 10°) with a glossy reflection that follows the mouse. Mouse only. */
export default function TiltCard({
  children,
  className = "",
  max = 10,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg)`;
    if (glare.current) {
      glare.current.style.opacity = "1";
      glare.current.style.background = `radial-gradient(500px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.14), transparent 45%)`;
    }
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
    if (glare.current) glare.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d] ${className}`}
    >
      {children}
      <div
        ref={glare}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300"
      />
    </div>
  );
}

"use client";

import { useRef, type ElementType, type ComponentPropsWithoutRef } from "react";

type Props<T extends ElementType> = {
  as?: T;
  beam?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

/** Card with a mouse-following radial glow and a border that lights up near the cursor. */
export default function SpotlightCard<T extends ElementType = "div">({
  as,
  beam,
  className = "",
  children,
  ...rest
}: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--spot-o", "1");
  };
  const onLeave = () => ref.current?.style.setProperty("--spot-o", "0");

  return (
    <Tag
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`card spotlight ${className}`}
      {...rest}
    >
      {beam && <span aria-hidden className="beam" />}
      {children}
    </Tag>
  );
}

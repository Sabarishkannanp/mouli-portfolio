"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const Fallback = () => (
  <Image
    src="/3d/hero-fallback.png"
    alt=""
    fill
    sizes="(max-width: 1024px) 90vw, 40vw"
    className="pointer-events-none object-contain opacity-70"
  />
);

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: Fallback });

/** Mounts the R3F scene only on desktop, without reduced motion, once the tile is near the viewport. */
export default function HeroSceneLoader() {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);

  useEffect(() => {
    const ok =
      window.matchMedia("(min-width: 1024px) and (hover: hover)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMount(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {mount ? <HeroScene /> : <Fallback />}
    </div>
  );
}

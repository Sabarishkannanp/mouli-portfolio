"use client";

import dynamic from "next/dynamic";
import { SectionLabel, Sticker } from "@/components/ui/bits";
import { useRef } from "react";
import { useSectionIntro } from "@/lib/useSectionIntro";

const PlaygroundCanvas = dynamic(() => import("./PlaygroundCanvas"), {
  ssr: false,
  loading: () => <div className="h-[clamp(440px,75svh,820px)] animate-pulse rounded-[20px] border border-line bg-card/40" />,
});

export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  useSectionIntro(ref);
  return (
    <section ref={ref} id="playground" className="relative px-[var(--pad-x)] py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div data-intro-fade>
              <SectionLabel n="03">Playground</SectionLabel>
            </div>
            <h2 data-intro-title className="mt-3 font-display text-[clamp(36px,6vw,80px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
              Posters &amp; <span className="font-serif font-normal normal-case italic text-grad">play</span>
            </h2>
            <p data-intro-fade className="mt-3 max-w-md text-sm text-muted sm:text-base">
              Movie posters, travel promos, perfume ads, brochures and logos — drag around the wall.
            </p>
          </div>
          <div data-intro-fade>
            <Sticker rot={5} variant="grad">made in Photoshop</Sticker>
          </div>
        </div>
        <div data-intro-fade>
          <PlaygroundCanvas />
        </div>
      </div>
    </section>
  );
}

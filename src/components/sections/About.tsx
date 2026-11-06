"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { SectionLabel, Sticker } from "@/components/ui/bits";
import { useSectionIntro } from "@/lib/useSectionIntro";
import { interests, journey, site } from "@/data/site";

const PHOTOS = [
  { src: "/about-1.png", alt: "Mouli in a blue hoodie holding a stylus and colour swatches", caption: "colour nerd ✦", palette: "#2A1650,#5B8BE8,#8EB4FF,#7C5CFF,#C89A80" },
  { src: "/about-2.png", alt: "Mouli in a black blazer", caption: "suit mode", palette: "#08070D,#3A2A6E,#C99A82,#7C5CFF,#FF4FD8" },
];

function PolaroidStack() {
  const [order, setOrder] = useState([0, 1]);
  const top = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x: 0, y: 0, dx: 0, dy: 0 });

  const down = (e: React.PointerEvent) => {
    drag.current = { on: true, x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    top.current!.style.transition = "none";
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on) return;
    d.dx = e.clientX - d.x;
    d.dy = e.clientY - d.y;
    top.current!.style.transform = `translate(${d.dx}px,${d.dy}px) rotate(${-4 + d.dx * 0.06}deg)`;
  };
  const cycle = () => setOrder((o) => [...o.slice(1), o[0]]);
  const up = () => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    const el = top.current!;
    el.style.transition = "transform .45s cubic-bezier(.2,.8,.2,1)";
    if (Math.hypot(d.dx, d.dy) > 90) {
      el.style.transform = `translate(${d.dx * 2.2}px,${d.dy * 2.2}px) rotate(${d.dx * 0.1}deg)`;
      setTimeout(() => {
        el.style.transition = "none";
        el.style.transform = "";
        cycle();
      }, 300);
    } else el.style.transform = "";
  };

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px]">
      {order
        .slice()
        .reverse()
        .map((idx, layer, arr) => {
          const p = PHOTOS[idx];
          const isTop = layer === arr.length - 1;
          return (
            <div
              key={p.src}
              ref={isTop ? top : undefined}
              onPointerDown={isTop ? down : undefined}
              onPointerMove={isTop ? move : undefined}
              onPointerUp={isTop ? up : undefined}
              onPointerCancel={isTop ? up : undefined}
              data-cursor={isTop ? "hand" : undefined}
              className={`absolute inset-0 touch-none rounded-md bg-[#F4F1FF] p-3 pb-12 shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] ${isTop ? "z-10 -rotate-[4deg]" : "rotate-[5deg]"}`}
            >
              <div className="relative size-full overflow-hidden rounded-sm bg-void" data-palette={p.palette} data-intro-particles>
                <Image src={p.src} alt={p.alt} fill sizes="340px" className="pointer-events-none object-cover" draggable={false} />
              </div>
              <p className="absolute bottom-3 left-0 right-0 text-center font-serif text-xl italic text-void">{p.caption}</p>
            </div>
          );
        })}
      <button
        type="button"
        onClick={cycle}
        className="absolute -bottom-14 left-1/2 min-h-11 -translate-x-1/2 rounded-full px-4 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink"
      >
        drag or tap to shuffle ↻
      </button>
    </div>
  );
}

export default function About() {
  const ref = useRef<HTMLElement>(null);
  useSectionIntro(ref);
  return (
    <section ref={ref} id="about" className="relative px-[var(--pad-x)] py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px]">
        <div>
          <div data-intro-fade>
            <SectionLabel n="06">About</SectionLabel>
          </div>
          <h2 data-intro-title className="mt-3 font-display text-[clamp(36px,6vw,80px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
            Hi, I&apos;m <span className="font-serif font-normal normal-case italic text-grad">Mouli</span>
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SpotlightCard data-intro-fade className="flex items-center justify-center px-6 pb-20 pt-10 lg:row-span-2">
            <PolaroidStack />
          </SpotlightCard>

          <SpotlightCard data-intro-fade className="flex flex-col justify-between gap-6 p-6 sm:p-8">
            <p className="text-lg leading-relaxed text-ink sm:text-xl">{site.bio}</p>
            <div className="flex flex-wrap gap-2">
              <Sticker rot={-4}>Salem, TN</Sticker>
              <Sticker rot={3} variant="grad">BCA ’25</Sticker>
            </div>
          </SpotlightCard>

          <SpotlightCard data-intro-fade className="p-6 sm:p-8 md:row-span-2">
            <p className="label">( journey )</p>
            <ol className="relative mt-6 flex flex-col gap-7 pl-7">
              <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-0.5 rounded bg-gradient-to-b from-violet via-pink to-transparent" />
              {journey.map((j) => (
                <li key={j.title + j.when} className="relative">
                  <span aria-hidden className="absolute -left-7 top-1.5 size-3 rounded-full bg-violet shadow-[0_0_12px_3px_rgba(124,92,255,.7)]" />
                  <p className="font-mono text-xs text-muted">{j.when}</p>
                  <h3 className="mt-1 font-display text-lg font-extrabold uppercase leading-tight">{j.title}</h3>
                  <p className="text-sm text-ink/90">{j.where}</p>
                  {j.note && <p className="mt-1 text-sm text-muted">{j.note}</p>}
                </li>
              ))}
            </ol>
          </SpotlightCard>

          <SpotlightCard data-intro-fade className="p-6 sm:p-8">
            <p className="label">( areas of interest )</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {interests.map((t) => (
                <li key={t} className="rounded-full border border-line bg-void/60 px-3 py-1.5 text-sm">
                  {t}
                </li>
              ))}
            </ul>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

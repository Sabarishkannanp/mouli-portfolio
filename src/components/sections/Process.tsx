"use client";

import { useRef } from "react";
import { GitBranch, LayoutTemplate, MousePointerClick, Palette, Search, type LucideIcon } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SectionLabel } from "@/components/ui/bits";
import { useSectionIntro } from "@/lib/useSectionIntro";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Research", text: "Talk to users, audit competitors, find the real problem.", icon: Search },
  { title: "User Flow", text: "Map every path so nobody gets lost.", icon: GitBranch },
  { title: "Wireframe", text: "Low-fi layouts to test structure fast.", icon: LayoutTemplate },
  { title: "Prototype", text: "Clickable Figma flows that feel real.", icon: MousePointerClick },
  { title: "Visual & Test", text: "Type, colour and polish — then test and iterate.", icon: Palette },
];

// desktop anchor points (percent of the stage), alternating high / low
const PTS = STEPS.map((_, i) => ({ x: 10 + i * 20, y: i % 2 === 0 ? 30 : 70 }));
const desktopPath = PTS.reduce((d, p, i) => {
  if (i === 0) return `M${p.x * 10},${p.y * 4}`;
  const prev = PTS[i - 1];
  const mx = (prev.x + p.x) * 5;
  return `${d} C${mx},${prev.y * 4} ${mx},${p.y * 4} ${p.x * 10},${p.y * 4}`;
}, "");

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7C5CFF" />
        <stop offset="100%" stopColor="#FF4FD8" />
      </linearGradient>
      <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
  );
}

export default function Process() {
  const ref = useRef<HTMLElement>(null);
  useSectionIntro(ref);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const paths = gsap.utils.toArray<SVGPathElement>("[data-draw]");
      const stops = gsap.utils.toArray<HTMLElement>("[data-stop]");
      if (reduced) {
        gsap.set(paths, { strokeDashoffset: 0 });
        stops.forEach((s) => (s.dataset.on = "true"));
        return;
      }
      const mm = gsap.matchMedia();
      const build = (stage: string) => () => {
        const stageEl = ref.current!.querySelector<HTMLElement>(stage)!;
        const ps = gsap.utils.toArray<SVGPathElement>("[data-draw]", stageEl);
        const ss = gsap.utils.toArray<HTMLElement>("[data-stop]", stageEl);
        gsap.set(ps, { strokeDashoffset: 1000 });
        gsap.to(ps, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: stageEl,
            start: "top 75%",
            end: "bottom 60%",
            scrub: 0.6,
            onUpdate: (self) =>
              ss.forEach((s, i) => (s.dataset.on = String(self.progress >= (i / ss.length) * 0.95))),
          },
        });
      };
      mm.add("(min-width: 1024px)", build("[data-stage=desktop]"));
      mm.add("(max-width: 1023px)", build("[data-stage=mobile]"));
      return () => mm.revert();
    },
    { scope: ref },
  );

  const stopClass =
    "group/stop transition-opacity duration-500 opacity-40 data-[on=true]:opacity-100";
  const anchor =
    "block size-4 border-2 border-violet bg-void transition-all duration-500 group-data-[on=true]/stop:bg-violet group-data-[on=true]/stop:shadow-[0_0_16px_4px_rgba(124,92,255,.6)]";

  return (
    <section ref={ref} id="process" className="relative overflow-hidden px-[var(--pad-x)] py-20 sm:py-28">
      <div aria-hidden className="glow-blob pink -right-[10%] top-[20%] size-[45vmax] opacity-60" />
      <div className="relative mx-auto max-w-[1320px]">
        <div data-intro-fade>
          <SectionLabel n="04">How I design</SectionLabel>
        </div>
        <h2 data-intro-title className="mt-3 max-w-3xl font-display text-[clamp(36px,6vw,80px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
          From <span className="font-serif font-normal normal-case italic text-grad">messy</span> to made
        </h2>

        {/* desktop: bezier across the stage */}
        <div data-stage="desktop" data-intro-fade className="relative mt-12 hidden h-[clamp(480px,70svh,600px)] lg:block">
          <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <Defs id="pg-d" />
            <path d={desktopPath} fill="none" stroke="#262236" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path data-draw d={desktopPath} fill="none" stroke="url(#pg-d)" strokeWidth="10" pathLength={1000} strokeDasharray="1000" strokeDashoffset="1000" filter="url(#pg-d-glow)" opacity=".5" />
            <path data-draw d={desktopPath} fill="none" stroke="url(#pg-d)" strokeWidth="3" pathLength={1000} strokeDasharray="1000" strokeDashoffset="1000" strokeLinecap="round" />
          </svg>
          {STEPS.map((s, i) => {
            const p = PTS[i];
            const high = p.y < 50;
            const Icon = s.icon;
            return (
              <div key={s.title} data-stop className={`${stopClass} absolute w-[18%] -translate-x-1/2`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <span className={`${anchor} absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2`} />
                <div className={`absolute left-1/2 w-full -translate-x-1/2 text-center ${high ? "bottom-6" : "top-6"}`}>
                  <Icon className="mx-auto mb-2 size-5 text-pink" />
                  <p className="font-mono text-xs text-muted">0{i + 1}</p>
                  <h3 className="mt-1 font-display text-[clamp(18px,1.6vw,24px)] font-extrabold uppercase">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted">{s.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* mobile / tablet: vertical path */}
        <div data-stage="mobile" data-intro-fade className="relative mt-10 lg:hidden">
          <svg viewBox="0 0 40 1000" preserveAspectRatio="none" className="absolute bottom-2 left-0 top-2 h-[calc(100%-16px)] w-10" aria-hidden>
            <Defs id="pg-m" />
            <path d="M20,0 C34,120 6,220 20,340 C34,460 6,560 20,680 C34,800 6,900 20,1000" fill="none" stroke="#262236" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path data-draw d="M20,0 C34,120 6,220 20,340 C34,460 6,560 20,680 C34,800 6,900 20,1000" fill="none" stroke="url(#pg-m)" strokeWidth="3" pathLength={1000} strokeDasharray="1000" strokeDashoffset="1000" strokeLinecap="round" />
          </svg>
          <ol className="flex flex-col gap-10">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} data-stop className={`${stopClass} relative pl-14`}>
                  <span className={`${anchor} absolute left-3 top-1.5`} />
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                    <Icon className="size-4 text-pink" />
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-extrabold uppercase">{s.title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted">{s.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

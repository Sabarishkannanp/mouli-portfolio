"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SpotlightCard from "@/components/ui/SpotlightCard";
import TiltCard from "@/components/ui/TiltCard";
import { SectionLabel, Sticker } from "@/components/ui/bits";
import { work } from "@/data/work";
import { useSectionIntro } from "@/lib/useSectionIntro";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Work() {
  const section = useRef<HTMLElement>(null);
  useSectionIntro(section);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const rail = section.current!.querySelector<HTMLElement>("[data-rail]")!;
        const pin = section.current!.querySelector<HTMLElement>("[data-pin]")!;
        const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth);
        gsap.to(rail, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const bar = section.current?.querySelector<HTMLElement>("[data-progress]");
              if (bar) bar.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} id="work" className="relative">
      <div data-pin className="relative flex flex-col justify-center gap-6 overflow-hidden py-16 lg:h-[100svh] lg:gap-[clamp(16px,3svh,32px)] lg:py-0">
        <div aria-hidden className="glow-blob violet left-[30%] top-[10%] size-[50vmax] opacity-60" />
        <header className="relative flex flex-wrap items-end justify-between gap-4 px-[var(--pad-x)]">
          <div>
            <div data-intro-fade>
              <SectionLabel n="02">Selected work</SectionLabel>
            </div>
            <h2 data-intro-title className="mt-3 font-display text-[clamp(36px,6vw,80px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
              Things I&apos;ve <span className="font-serif font-normal normal-case italic text-grad">crafted</span>
            </h2>
          </div>
          <div data-intro-fade className="flex items-center gap-4">
            <Sticker rot={-4}>3 case studies</Sticker>
            <div className="hidden h-px w-40 overflow-hidden bg-line lg:block">
              <div data-progress className="h-full origin-left scale-x-0 bg-gradient-to-r from-violet to-pink" />
            </div>
          </div>
        </header>

        <div
          data-rail
          className="relative flex flex-col gap-6 px-[var(--pad-x)] lg:w-max lg:flex-row lg:gap-8 lg:pr-[10vw]"
        >
          {work.map((p, i) => (
            <div key={p.slug} data-intro-fade className="lg:shrink-0">
            <TiltCard max={6} className="rounded-[20px] lg:w-[70vw] lg:max-w-[1100px]">
              <SpotlightCard
                as={Link}
                href={`/work/${p.slug}`}
                beam
                data-cursor-label="View"
                className="group flex h-full flex-col lg:block lg:h-[min(calc(100svh-230px),640px)] lg:min-h-[380px]"
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto"
                  data-cursor="pick"
                  data-intro-particles
                  data-palette={p.palette.join(",")}
                >
                  <Image
                    src={p.cover}
                    alt={`${p.title} — cover`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-t from-void via-void/40 to-transparent lg:block" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:z-10 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:p-8">
                  <div className="max-w-[640px]">
                    <p className="font-mono text-xs text-muted">
                      <span className="text-ink">{String(i + 1).padStart(2, "0")}</span>/{String(work.length).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-display text-[clamp(22px,2.6vw,38px)] font-extrabold uppercase leading-[1.02] tracking-[-0.01em]">
                      {p.title}
                    </h3>
                    <p className="mt-2 hidden max-w-[520px] text-sm text-muted sm:block">{p.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <span key={t} className="rounded-full border border-line bg-void/60 px-3 py-1 text-xs text-ink backdrop-blur">
                          {t}
                        </span>
                      ))}
                      {p.tools.map((t) => (
                        <span key={t} className="rounded-full bg-violet/20 px-3 py-1 font-mono text-[11px] text-ink">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="mt-auto inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink lg:mt-0">
                    View case study
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </SpotlightCard>
            </TiltCard>
            </div>
          ))}

          <div data-intro-fade className="card flex flex-col items-start justify-center gap-4 p-8 lg:w-[min(30vw,420px)] lg:shrink-0">
            <p className="label">( next )</p>
            <p className="font-display text-3xl font-extrabold uppercase leading-tight">
              More work <span className="font-serif font-normal normal-case italic text-grad">brewing</span>
            </p>
            <p className="text-sm text-muted">Posters, logos and experiments live in the playground.</p>
            <Link href="#playground" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
              Open playground <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

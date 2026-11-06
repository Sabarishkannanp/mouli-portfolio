"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SpotlightCard from "@/components/ui/SpotlightCard";
import TiltCard from "@/components/ui/TiltCard";
import Magnetic from "@/components/ui/Magnetic";
import { CircleBadge, SectionLabel, StatusPill, Sticker } from "@/components/ui/bits";
import HeroSceneLoader from "./HeroSceneLoader";
import { site, tools } from "@/data/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Letters = ({ word, grad = false }: { word: string; grad?: boolean }) => {
  const n = word.length;
  return (
    <span className="block overflow-hidden pb-[0.06em]" aria-label={word}>
      {word.split("").map((c, i) => (
        <span
          key={i}
          aria-hidden
          data-letter
          className="inline-block"
          // each letter shows its own slice of one continuous gradient (background-clip doesn't reach transformed children)
          style={
            grad
              ? {
                  backgroundImage: "linear-gradient(90deg,#7C5CFF,#FF4FD8)",
                  backgroundSize: `${n * 100}% 100%`,
                  backgroundPosition: `${(i / (n - 1)) * 100}% 0`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }
              : undefined
          }
        >
          {c}
        </span>
      ))}
    </span>
  );
};

function Phone({ className = "", variant = 0 }: { className?: string; variant?: 0 | 1 }) {
  return (
    <div className={`relative aspect-[9/19] w-[30%] max-w-[130px] rounded-[18px] border border-white/15 bg-[#0d0b14] p-1.5 shadow-2xl ${className}`}>
      <div className="flex h-full flex-col gap-1.5 overflow-hidden rounded-[13px] bg-[linear-gradient(180deg,#1a1530,#0d0b14)] p-2">
        <div className="mx-auto h-1 w-8 rounded-full bg-white/20" />
        {variant === 0 ? (
          <>
            <div className="mt-1 h-1.5 w-2/3 rounded bg-white/70" />
            <div className="h-1 w-1/2 rounded bg-white/30" />
            <div className="mt-1 grid aspect-square place-items-center rounded-full border-[5px] border-violet/80 border-r-pink">
              <span className="font-mono text-[9px] text-white">72%</span>
            </div>
            <div className="h-6 rounded-md bg-violet/40" />
            <div className="h-6 rounded-md bg-white/10" />
          </>
        ) : (
          <>
            <div className="mt-1 h-1.5 w-1/2 rounded bg-white/70" />
            {[0.9, 0.6, 0.75, 0.4, 0.85].map((w, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="size-3 shrink-0 rounded bg-gradient-to-br from-violet to-pink" />
                <span className="h-1 rounded bg-white/30" style={{ width: `${w * 100}%` }} />
              </div>
            ))}
            <div className="mt-auto h-5 rounded-full bg-gradient-to-r from-violet to-pink" />
          </>
        )}
      </div>
    </div>
  );
}

export default function HeroBento() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]");
      gsap.set(tiles, { autoAlpha: 0, y: 40, scale: 0.97 });
      ScrollTrigger.batch(tiles, {
        start: "top 92%",
        once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out", stagger: 0.1 }),
      });
      gsap.from("[data-letter]", {
        yPercent: 110,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.035,
        scrollTrigger: { trigger: "[data-name]", start: "top 90%", once: true },
      });
      const counter = { v: 0 };
      gsap.to(counter, {
        v: 3,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: { trigger: "[data-count]", start: "top 92%", once: true },
        onUpdate: () => {
          const el = ref.current?.querySelector("[data-count]");
          if (el) el.textContent = String(Math.round(counter.v));
        },
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="intro" className="relative px-[var(--pad-x)] pb-10 pt-16 sm:pt-24">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-6 flex items-end justify-between gap-4">
          <SectionLabel n="01">Intro</SectionLabel>
          <Sticker rot={6} variant="grad">open to work ✦</Sticker>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Big tile */}
          <div data-tile className="md:col-span-2 lg:row-span-3">
            <SpotlightCard className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8 lg:min-h-[460px]">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill />
                <Sticker rot={-5} className="hidden xs:inline-flex">Figma nerd</Sticker>
              </div>
              <div className="@container">
                <h2 data-name className="font-display text-[clamp(26px,10.2cqw,120px)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]">
                  <Letters word="MOULI" />
                  <Letters word="PRASANTH" grad />
                </h2>
                <p className="mt-5 font-serif text-[clamp(22px,4.6cqw,34px)] italic leading-tight text-ink">
                  designing <span className="text-pink">feelings</span> into pixels.
                </p>
                <p className="shiny mt-2 text-sm sm:text-base">{site.role} · {site.location}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Magnetic>
                  <Link href="#work" className="btn-grad inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold" data-cursor-label="View">
                    See the work <ArrowUpRight className="size-4" />
                  </Link>
                </Magnetic>
                <Magnetic>
                  <a
                    href={site.resume}
                    download
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-white/[.03] px-6 text-sm font-semibold text-ink transition-colors hover:border-violet"
                  >
                    Resume <Download className="size-4" />
                  </a>
                </Magnetic>
              </div>
            </SpotlightCard>
          </div>

          {/* 3D tile */}
          <div data-tile className="relative md:col-span-2 lg:row-span-3">
            <CircleBadge className="absolute -left-3 -top-5 z-20 hidden size-24 sm:block lg:-left-7 lg:-top-7 lg:size-28" />
            <TiltCard className="h-full rounded-[20px]">
              <SpotlightCard className="relative h-[clamp(380px,62vw,520px)] lg:h-full lg:min-h-[460px]">
                <div aria-hidden className="absolute inset-0 dot-grid opacity-70" />
                <div className="absolute inset-0">
                  <HeroSceneLoader />
                </div>
                <div
                  aria-hidden
                  className="absolute left-1/2 top-[55%] size-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(124,92,255,.45), rgba(255,79,216,.12) 45%, transparent 70%)" }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[8%] flex justify-center">
                  <div className="pointer-events-auto relative h-full w-[min(62%,300px)] overflow-hidden rounded-t-full border border-white/10 bg-[linear-gradient(180deg,rgba(124,92,255,.25),rgba(255,79,216,.08)_60%,transparent)] shadow-[0_0_60px_-10px_rgba(124,92,255,.7)]">
                    <Image
                      src="/hero.png"
                      alt="Mouli Prasanth in a black blazer"
                      fill
                      sizes="(max-width: 768px) 62vw, 300px"
                      className="object-cover object-top"
                      data-cursor="pick"
                      data-palette="#08070D,#3A2A6E,#C99A82,#7C5CFF,#FF4FD8"
                    />
                    <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-card to-transparent" />
                  </div>
                </div>
                <Sticker rot={8} className="absolute bottom-5 right-5 z-20">pixel perfect</Sticker>
              </SpotlightCard>
            </TiltCard>
          </div>

          {/* Stat tile */}
          <div data-tile className="lg:row-span-2">
            <SpotlightCard className="flex h-full min-h-[200px] flex-col justify-between p-6">
              <p className="label">( projects )</p>
              <div>
                <p className="font-display text-7xl font-extrabold leading-none">
                  <span data-count>3</span>
                  <span className="text-grad">+</span>
                </p>
                <p className="mt-2 text-sm text-muted">Brand, print, app — shipped end-to-end.</p>
              </div>
            </SpotlightCard>
          </div>

          {/* Toolkit tile */}
          <div data-tile className="lg:row-span-2">
            <div
              className="card flex h-full min-h-[200px] flex-col justify-between p-6"
              style={{ background: "linear-gradient(135deg,#7C5CFF,#FF4FD8)", borderColor: "transparent" }}
            >
              <p className="font-mono text-xs uppercase tracking-wider text-white/80">( toolkit )</p>
              <div className="grid grid-cols-3 gap-2">
                {tools.slice(0, 6).map((t) => (
                  <span
                    key={t.key}
                    title={t.name}
                    className="grid aspect-square place-items-center rounded-xl border border-white/25 bg-white/15 shadow-[inset_0_-3px_0_rgba(0,0,0,.2)] backdrop-blur"
                  >
                    <Image src={t.logo} alt={t.name} width={40} height={40} unoptimized className="size-[52%] object-contain" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Featured tile */}
          <div data-tile className="md:col-span-2 lg:row-span-2">
            <SpotlightCard
              as={Link}
              href="/work/gym-app"
              beam
              data-cursor-label="View"
              className="group flex h-full min-h-[240px] flex-col gap-4 p-6 sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 flex-col gap-2">
                <p className="label">( featured case study )</p>
                <h3 className="font-display text-2xl font-extrabold uppercase leading-tight sm:text-3xl">Gym Training App</h3>
                <p className="text-sm text-muted">Research → flows → wireframes → hi-fi UI → prototype. Figma.</p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm text-ink">
                  Read case study <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
              <div className="flex flex-1 items-end justify-center gap-3 sm:justify-end">
                <Phone className="-rotate-6 transition-transform duration-500 group-hover:-rotate-3 group-hover:-translate-y-1" />
                <Phone variant={1} className="translate-y-3 rotate-6 transition-transform duration-500 group-hover:translate-y-1 group-hover:rotate-3" />
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}

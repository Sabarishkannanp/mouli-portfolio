"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionLabel } from "@/components/ui/bits";
import Reveal from "@/components/ui/Reveal";
import { skills, tools } from "@/data/site";

export default function Toolkit() {
  const [pressed, setPressed] = useState<string | null>(null);
  const press = (k: string) => {
    setPressed(k);
    setTimeout(() => setPressed((p) => (p === k ? null : p)), 160);
  };

  return (
    <Reveal as="section" id="toolkit" className="relative px-[var(--pad-x)] py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px]">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel n="05">Toolkit</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(36px,6vw,80px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
              My <span className="font-serif font-normal normal-case italic text-grad">keys</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted sm:text-base">Tools I reach for every day — press a key.</p>
        </div>

        <div data-reveal className="mt-10 rounded-[24px] border border-line bg-[linear-gradient(180deg,#16131f,#0e0c15)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] sm:p-6 [perspective:900px]">
          <div className="grid grid-cols-4 gap-3 sm:gap-4 md:grid-cols-8 [transform:rotateX(14deg)]">
            {tools.map((t) => {
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => press(t.key)}
                  data-pressed={pressed === t.key}
                  aria-label={t.name}
                  className="keycap group relative flex aspect-square flex-col items-start justify-between rounded-xl border border-white/10 bg-[linear-gradient(180deg,#2a2540,#1c1830)] p-2.5 text-left sm:rounded-2xl sm:p-3"
                >
                  <span className="font-mono text-[10px] uppercase leading-none text-muted">{t.key}</span>
                  <Image
                    src={t.logo}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                    className="mx-auto size-[42%] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,.45)] transition-transform duration-200 group-hover:scale-110"
                  />
                  <span className="hidden w-full truncate font-mono text-[10px] uppercase tracking-wider text-muted xs:block">{t.name}</span>
                  <span aria-hidden className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-violet/60 transition-all group-hover:bg-cyan group-hover:shadow-[0_0_8px_2px_rgba(61,245,255,.7)]" />
                </button>
              );
            })}
          </div>
        </div>

        <ul data-reveal className="mt-8 flex flex-wrap gap-2.5">
          {skills.map((s) => (
            <li key={s} className="rounded-full border border-line bg-card px-4 py-2 text-sm text-ink transition-colors hover:border-violet">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

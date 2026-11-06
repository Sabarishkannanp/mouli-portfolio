"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { scrollToTarget } from "@/lib/hooks";
import { site } from "@/data/site";
import MarqueeBand from "@/components/ui/MarqueeBand";

function SalemTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-IN", { timeZone: site.timezone, hour: "2-digit", minute: "2-digit", hour12: true });
    const u = () => setT(f.format(new Date()));
    u();
    const id = setInterval(u, 30_000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t || "--:--"} IST</span>;
}

const NAME = "MOULI PRASANTH";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-void">
      <MarqueeBand />
      <div className="px-[var(--pad-x)] pb-8 pt-14">
      <p
        aria-label={site.name}
        className="group/name flex flex-wrap justify-center font-display text-[clamp(28px,9vw,170px)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em]"
      >
        {NAME.split(" ").map((word) => (
          <span key={word} aria-hidden className="whitespace-nowrap px-[0.12em]">
            {word.split("").map((c, i) => (
              <span
                key={i}
                className="inline-block text-transparent transition-all duration-300 [-webkit-text-stroke:1.5px_#3a3452] hover:-translate-y-[0.05em] hover:[-webkit-text-stroke-color:transparent] hover:[background:linear-gradient(135deg,#7C5CFF,#FF4FD8)] hover:[-webkit-background-clip:text] hover:[background-clip:text]"
              >
                {c}
              </span>
            ))}
          </span>
        ))}
      </p>

      <div className="mx-auto mt-10 flex max-w-[1320px] flex-col items-start justify-between gap-6 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          Salem, IN · <SalemTime />
        </p>
        <p>Designed by Mouli · Built with Next.js</p>
        <button
          type="button"
          onClick={() => scrollToTarget(0)}
          className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-ink"
        >
          Back to top <ArrowUp className="size-4" />
        </button>
      </div>
      </div>
    </footer>
  );
}

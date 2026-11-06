"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

/** "Next project" link that wipes the screen with a full-screen colour before navigating. */
export default function NextProjectLink({ slug, title, accent }: { slug: string; title: string; accent: string }) {
  const router = useRouter();
  const [go, setGo] = useState(false);
  const href = `/work/${slug}`;

  const onClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    setGo(true);
    router.prefetch(href);
    setTimeout(() => {
      router.push(href);
      window.scrollTo(0, 0);
    }, 650);
    setTimeout(() => setGo(false), 1200);
  };

  return (
    <>
      <a
        href={href}
        onClick={onClick}
        data-cursor-label="Next"
        className="group relative block overflow-hidden border-t border-line px-[var(--pad-x)] py-16 sm:py-24"
      >
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3">
          <p className="label">( next project )</p>
          <p className="flex items-center gap-4 font-display text-[clamp(28px,5.5vw,76px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] transition-colors group-hover:text-pink">
            {title}
            <ArrowRight className="size-[0.7em] shrink-0 transition-transform group-hover:translate-x-2" />
          </p>
        </div>
      </a>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90] origin-bottom transition-transform duration-[650ms] ease-[cubic-bezier(.7,0,.2,1)]"
        style={{
          background: `linear-gradient(135deg, ${accent}, #FF4FD8)`,
          transform: go ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: go ? "bottom" : "top",
        }}
      />
    </>
  );
}

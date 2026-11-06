"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { playground } from "@/data/playground";
import { scrollLock } from "@/lib/hooks";

const COLS = 6;
const ROWS = 4;

// deterministic pseudo-random so server/client agree
const rand = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const slots = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS, row = Math.floor(i / COLS);
  // offset every other row so the cycle of 12 items doesn't line up in columns
  const item = (i + row * 5) % playground.length;
  return { i, col, row, item, jx: rand(i, 1) - 0.5, jy: rand(i, 2) - 0.5, rot: (rand(i, 3) - 0.5) * 10 };
});

export default function PlaygroundCanvas() {
  const wrap = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [cell, setCell] = useState(300);

  useEffect(() => {
    const m = window.matchMedia("(max-width: 640px)");
    const u = () => setCell(m.matches ? 210 : 300);
    u();
    m.addEventListener("change", u);
    return () => m.removeEventListener("change", u);
  }, []);

  useEffect(() => {
    const el = wrap.current!;
    const TW = COLS * cell, TH = ROWS * cell;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ox = 0, oy = 0, vx = reduced ? 0 : -0.35, vy = 0, dragging = false, raf = 0, visible = false;
    let sx = 0, sy = 0, lx = 0, ly = 0, moved = 0, lastT = 0;
    const touchOnly = window.matchMedia("(pointer: coarse)").matches;
    const mod = (a: number, n: number) => ((a % n) + n) % n;

    const place = () => {
      for (const s of slots) {
        const node = els.current[s.i];
        if (!node) continue;
        const x = mod(s.col * cell + s.jx * cell * 0.3 + ox + cell, TW) - cell;
        const y = mod(s.row * cell + s.jy * cell * 0.3 + oy + cell, TH) - cell;
        node.style.transform = `translate3d(${x}px,${y}px,0)`;
      }
    };
    const loop = () => {
      if (!dragging) {
        ox += vx;
        oy += vy;
        // inertia decays toward a gentle idle drift
        vx += ((reduced ? 0 : -0.35) - vx) * 0.05;
        vy *= 0.95;
      }
      place();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    place();

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = 0;
      sx = lx = e.clientX;
      sy = ly = e.clientY;
      lastT = performance.now();
      vx = vy = 0;
      el.dataset.dragging = "true";
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = touchOnly ? 0 : e.clientY - ly;
      if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 6 && !el.hasPointerCapture(e.pointerId)) {
        el.setPointerCapture(e.pointerId);
      }
      ox += dx;
      oy += dy;
      const now = performance.now(), dt = Math.max(1, now - lastT);
      vx = (dx / dt) * 16;
      vy = (dy / dt) * 16;
      lastT = now;
      lx = e.clientX;
      ly = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
    };
    const up = () => {
      dragging = false;
      delete el.dataset.dragging;
      vx = Math.max(-40, Math.min(40, vx));
      vy = Math.max(-40, Math.min(40, vy));
    };
    // swallow the click that ends a drag
    const click = (e: MouseEvent) => {
      if (moved > 6) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
    };
  }, [cell]);

  /* ---------- lightbox ---------- */
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((o) => (o == null ? o : (o + d + playground.length) % playground.length)), []);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    scrollLock.set("lightbox", open != null);
    if (open == null) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      scrollLock.set("lightbox", false);
    };
  }, [open, close, step]);

  const item = open != null ? playground[open] : null;

  return (
    <>
      <div
        ref={wrap}
        data-cursor="hand"
        className="group/pg relative h-[clamp(440px,75svh,820px)] select-none overflow-hidden rounded-[20px] border border-line bg-card/40 [touch-action:pan-y] sm:[touch-action:none]"
        aria-label="Draggable collage of posters and creatives"
      >
        <div aria-hidden className="dot-grid absolute inset-0" />
        {slots.map((s) => {
          const it = playground[s.item];
          const w = cell * 0.74;
          return (
            <button
              key={s.i}
              ref={(n) => {
                els.current[s.i] = n;
              }}
              type="button"
              onClick={() => setOpen(s.item)}
              aria-label={`Open ${it.alt}`}
              className="absolute left-0 top-0 block will-change-transform hover:z-10 focus-visible:z-10"
              style={{ width: w }}
            >
              <span
                className="block overflow-hidden rounded-xl border border-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,.8)] transition-[transform,box-shadow] duration-300 hover:z-10 hover:shadow-[0_30px_60px_-20px_rgba(124,92,255,.6)] [[data-dragging]_&]:transition-none"
                style={{ transform: `rotate(${s.rot}deg)` }}
                onPointerEnter={(e) => (e.currentTarget.style.transform = "rotate(0deg) translateY(-8px) scale(1.05)")}
                onPointerLeave={(e) => (e.currentTarget.style.transform = `rotate(${s.rot}deg)`)}
              >
                <Image
                  src={it.src}
                  alt={it.alt}
                  width={it.w}
                  height={it.h}
                  draggable={false}
                  sizes={`${Math.round(w)}px`}
                  className="pointer-events-none h-auto w-full"
                />
              </span>
            </button>
          );
        })}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4">
          <span className="glass rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-muted">
            ✋ drag to explore · click to open
          </span>
        </div>
      </div>

      {item && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={item.alt}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-void/90 p-4 backdrop-blur-md"
          onClick={close}
        >
          <div className="relative flex max-h-full w-full max-w-5xl items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Image
              src={item.src}
              alt={item.alt}
              width={item.w}
              height={item.h}
              sizes="(max-width: 1024px) 92vw, 1000px"
              className="max-h-[82svh] w-auto rounded-2xl border border-line object-contain"
            />
            <p className="absolute -bottom-9 left-0 font-mono text-xs text-muted">{item.alt}</p>
          </div>
          <button ref={closeBtn} type="button" onClick={close} aria-label="Close" className="glass absolute right-4 top-4 grid size-12 place-items-center rounded-full">
            <X className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous"
            className="glass absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next"
            className="glass absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </>
  );
}

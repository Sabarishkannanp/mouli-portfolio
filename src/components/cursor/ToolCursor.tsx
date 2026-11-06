"use client";

/**
 * Design-tool cursor: Move (default) · Type (text) · Picker + loupe (images) · Pen (links) · Hand (drag areas).
 * Mark elements with data-cursor="move|type|pick|pen|hand", data-cursor-label="View", data-palette="#hex,#hex".
 * Disabled on touch devices and with reduced motion.
 */
import { useEffect, useRef, useState } from "react";

type Tool = "move" | "type" | "pick" | "pen" | "hand";

const TEXT_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE", "SPAN", "EM", "STRONG", "TIME", "DD", "DT"]);

function resolve(target: Element | null): { tool: Tool; label?: string; palette?: string[]; el?: Element } {
  if (!target) return { tool: "move" };
  const marked = target.closest<HTMLElement>("[data-cursor]");
  const link = target.closest<HTMLElement>("a,button,[role=button],label,select,summary");
  if (marked && (!link || marked.contains(link) === false || marked === link)) {
    const tool = marked.dataset.cursor as Tool;
    return {
      tool,
      label: marked.dataset.cursorLabel,
      palette: marked.dataset.palette?.split(","),
      el: marked,
    };
  }
  if (link) return { tool: "pen", label: link.dataset.cursorLabel ?? (link.tagName === "A" ? "Open" : undefined) };
  if (target.closest("input,textarea")) return { tool: "type" };
  if (target.tagName === "IMG") return { tool: "pick", el: target };
  if (TEXT_TAGS.has(target.tagName) && target.textContent?.trim()) return { tool: "type" };
  return { tool: "move" };
}

const ICONS: Record<Tool, React.ReactNode> = {
  move: (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="#FFD43B" stroke="#08070D" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  type: (
    <svg width="22" height="26" viewBox="0 0 22 26">
      <path d="M6 2h4l1 1 1-1h4M11 3v20M6 24h4l1-1 1 1h4" fill="none" stroke="#08070D" strokeWidth="4" strokeLinecap="round" />
      <path d="M6 2h4l1 1 1-1h4M11 3v20M6 24h4l1-1 1 1h4" fill="none" stroke="#F2F0FF" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  pick: (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M2.5 21.5l1.2-3.7L13 8.5l2.5 2.5-9.3 9.3z" fill="#F2F0FF" stroke="#08070D" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M13.5 6.5l2-2a2.1 2.1 0 013 0l1 1a2.1 2.1 0 010 3l-2 2 1 1-1.5 1.5-5-5L13.5 6.5z" fill="#7C5CFF" stroke="#08070D" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  pen: (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M3 21l3.5-11L15 6.5 17.5 9 14 17.5z" fill="#F2F0FF" stroke="#08070D" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="9.6" cy="14.4" r="1.6" fill="#08070D" />
      <path d="M3 21l6-6" stroke="#08070D" strokeWidth="1.2" />
      <path d="M15 6.5l2-2 2.5 2.5-2 2" fill="#FF4FD8" stroke="#08070D" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  hand: (
    <svg width="26" height="26" viewBox="0 0 24 24">
      <path
        d="M8 11V5.5a1.5 1.5 0 013 0V10m0-.5V4a1.5 1.5 0 013 0v6m0-.5V5.5a1.5 1.5 0 013 0V13m0-3a1.5 1.5 0 013 0v4.5A7.5 7.5 0 0112.5 22h-.6a6 6 0 01-4.6-2.2L3.6 15.4a1.6 1.6 0 012.4-2.1L8 15V11"
        fill="#F2F0FF"
        stroke="#08070D"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export default function ToolCursor() {
  const [enabled, setEnabled] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ tool: Tool; label?: string; hex?: string }>({ tool: "move" });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduced.matches);
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("tool-cursor");
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, shown = false;
    let last: { tool: Tool; label?: string; hex?: string } = { tool: "move" };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        rx = x;
        ry = y;
        shown = true;
        iconRef.current!.style.opacity = "1";
        ringRef.current!.style.opacity = "1";
      }
      const r = resolve(e.target as Element);
      let hex: string | undefined;
      if (r.tool === "pick") {
        // sample from a pre-computed palette, by horizontal position across the element
        const pal = r.palette ?? r.el?.closest<HTMLElement>("[data-palette]")?.dataset.palette?.split(",") ?? ["#7C5CFF", "#B04FE8", "#FF4FD8"];
        const box = (r.el ?? (e.target as Element)).getBoundingClientRect();
        const fx = Math.min(0.999, Math.max(0, (x - box.left) / box.width));
        const fy = Math.min(0.999, Math.max(0, (y - box.top) / box.height));
        hex = pal[Math.floor(((fx + fy * 0.35) % 1) * pal.length)].trim().toUpperCase();
      }
      if (r.tool !== last.tool || r.label !== last.label || hex !== last.hex) {
        last = { tool: r.tool, label: r.label, hex };
        setState(last);
      }
    };
    const onLeave = () => {
      shown = false;
      if (iconRef.current) iconRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };
    const onDown = () => ringRef.current?.style.setProperty("--press", "0.85");
    const onUp = () => ringRef.current?.style.setProperty("--press", "1");

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (iconRef.current) iconRef.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      if (loupeRef.current) loupeRef.current.style.transform = `translate3d(${x + 22}px,${y + 22}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("tool-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  const { tool, label, hex } = state;
  const big = tool === "pen" && !!label;
  // hotspot offsets so the tip of each icon sits on the pointer
  const offset: Record<Tool, string> = {
    move: "-3px,-2px",
    type: "-11px,-13px",
    pick: "-3px,-21px",
    pen: "-3px,-21px",
    hand: "-13px,-13px",
  };

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={ringRef} className="absolute left-0 top-0 opacity-0" style={{ ["--press" as string]: 1 }}>
        <div
          className={`grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-all duration-300 ease-out ${
            big ? "size-16 bg-[linear-gradient(135deg,#7C5CFF,#FF4FD8)] shadow-[0_0_30px_rgba(124,92,255,.6)]" : tool === "hand" ? "size-12 border border-white/30" : "size-8 border border-violet/60"
          }`}
          style={{ scale: "var(--press)" }}
        >
          {big && <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">{label}</span>}
        </div>
      </div>
      <div ref={iconRef} className="absolute left-0 top-0 opacity-0 drop-shadow-[0_2px_6px_rgba(0,0,0,.5)]">
        <div style={{ transform: `translate(${offset[tool]})` }} className={big ? "opacity-0" : ""}>
          {ICONS[tool]}
        </div>
      </div>
      {tool === "pick" && hex && (
        <div ref={loupeRef} className="absolute left-0 top-0">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-[#13111C]/90 py-1 pl-1 pr-3 shadow-xl backdrop-blur">
            <span className="size-6 rounded-full border-2 border-white/80" style={{ background: hex }} />
            <span className="font-mono text-[11px] text-ink">{hex}</span>
          </div>
        </div>
      )}
    </div>
  );
}

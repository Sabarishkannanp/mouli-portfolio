import type { ReactNode } from "react";

/** `( 02 — WORK )` style mono label */
export function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="label flex items-center gap-2">
      <span className="text-violet">(</span>
      {n} — {children}
      <span className="text-violet">)</span>
    </p>
  );
}

export function Sticker({
  children,
  rot = -6,
  variant = "glass",
  className = "",
}: {
  children: ReactNode;
  rot?: number;
  variant?: "glass" | "grad";
  className?: string;
}) {
  return (
    <span
      style={{ ["--rot" as string]: `${rot}deg`, transform: `rotate(${rot}deg)` }}
      className={`sticker inline-flex select-none items-center gap-1 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider shadow-lg ${
        variant === "grad" ? "btn-grad" : "glass text-ink"
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusPill({ children = "Available for work" }: { children?: ReactNode }) {
  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-ink">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-cyan shadow-[0_0_10px_2px_rgba(61,245,255,.7)]" />
      </span>
      {children}
    </span>
  );
}

export function CircleBadge({ text = "UI/UX • GRAPHIC • BRANDING • ", className = "" }: { text?: string; className?: string }) {
  return (
    <div className={`relative size-28 sm:size-32 ${className}`} aria-hidden>
      <svg viewBox="0 0 120 120" className="spin-slow size-full">
        <defs>
          <path id="circle-path" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill="#13111C" stroke="#262236" />
        <text fill="#F2F0FF" fontSize="10.5" letterSpacing="2.2" fontFamily="var(--font-space-mono)">
          <textPath href="#circle-path">{text}</textPath>
        </text>
      </svg>
      <span className="text-grad absolute inset-0 grid place-items-center text-3xl">✺</span>
    </div>
  );
}

export function GlowBlobs({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="glow-blob violet -left-[10%] top-[5%] size-[60vmax] max-w-[900px] max-h-[900px]" />
      <div className="glow-blob pink -right-[15%] bottom-[0%] size-[50vmax] max-w-[800px] max-h-[800px]" />
    </div>
  );
}

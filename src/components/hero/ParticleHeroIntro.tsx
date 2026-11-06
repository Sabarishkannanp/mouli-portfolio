"use client";

/**
 * "Spark → Name → Morph → Particle Portrait → Photo" intro, ported from reference/preloader-reference.html.
 * The intro does not cover the hero — it becomes the hero (full viewport section).
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { intro, scrollLock, useIntroDone, useReducedMotion } from "@/lib/hooks";

const PORTRAIT_SRC = "/hero-cutout.png";
const NAME = "MOULI";
const FINAL = "PORTFOLIO";
const SEEN_KEY = "mouli-intro-seen";
const WORD_Y = 0.78; // final word centre, as a fraction of the hero height

type Particle = {
  x: number; y: number; s: number; a: number; lum: number; tw: number; delay: number;
  tx: number | null; ty: number | null; sx: number; sy: number; ang: number; col?: string; colKey?: number;
};

const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function ParticleHeroIntro() {
  const rootRef = useRef<HTMLElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const forceFull = useRef(false);

  const introDone = useIntroDone();
  const staticMode = useReducedMotion();
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const root = rootRef.current!, cv = cvRef.current!, spot = spotRef.current!, glow = glowRef.current!, photo = photoRef.current!;
    const dot = dotRef.current!, bar = barRef.current!, word = wordRef.current!, text = textRef.current!, sub = subRef.current!, cta = ctaRef.current!;
    const ctx = cv.getContext("2d")!;

    let runId = 0;
    let W = 0, H = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let P: Particle[] = [];
    let mode: "dust" | "assemble" = "dust";
    let assembleT0 = 0, ASSEMBLE = 2400;
    // once the real photo is visible, particles become a lighter sparkle layer on top
    let photoShown = false;
    let photoTimer: ReturnType<typeof setTimeout> | undefined;
    let raf = 0, visible = true;
    let portrait: HTMLImageElement | null = null;
    const mouse = { x: -9999, y: -9999 };

    /* ---------- helpers ---------- */
    const alive = (id: number) => id === runId;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    function tween(ms: number, fn: (e: number, t: number) => void, e: (t: number) => number = ease) {
      const id = runId;
      return new Promise<void>((res) => {
        const t0 = performance.now();
        const f = (now: number) => {
          if (!alive(id)) return res();
          const t = Math.min(1, (now - t0) / ms);
          fn(e(t), t);
          if (t < 1) requestAnimationFrame(f);
          else res();
        };
        requestAnimationFrame(f);
      });
    }
    const fadeIn = (el: HTMLElement, ms: number, dy = 8) =>
      tween(ms, (e) => {
        el.style.opacity = String(e);
        if (dy) el.style.transform = `translateY(${(1 - e) * dy}px)`;
      });

    /** Final word centre: ~78% down, but always leaving room for the subtitle + bottom buttons. */
    function finalCenter() {
      const fontPx = parseFloat(getComputedStyle(word).fontSize) || 100;
      return Math.min(H * WORD_Y, H - 126 - fontPx * 1.12 * 0.55);
    }

    function layoutFinal() {
      const dy = finalCenter() - H / 2;
      word.style.transform = `translate(-50%, calc(-50% + ${dy}px)) scale(1.12)`;
      const fr = word.getBoundingClientRect(), rr = root.getBoundingClientRect();
      sub.style.left = `${Math.max(16, fr.left - rr.left + 8)}px`;
      sub.style.top = `${fr.bottom - rr.top + 6}px`;
    }

    function resize() {
      W = root.clientWidth;
      H = root.clientHeight;
      cv.width = Math.round(W * DPR);
      cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    const loadPortrait = () =>
      new Promise<HTMLImageElement | null>((res) => {
        const img = new window.Image();
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = PORTRAIT_SRC;
      });

    /** Portrait box (sits on top of the word). Also positions the glow and the real photo. */
    function portraitBox(img: HTMLImageElement) {
      const fontPx = parseFloat(getComputedStyle(word).fontSize) || 100;
      const wordCenter = finalCenter();
      const bottom = wordCenter + fontPx * 1.12 * 0.5 * 0.35;
      const top = Math.max(H * 0.07, 60);
      const aspect = img.width / img.height;
      const h = Math.max(120, Math.min(bottom - top, 640, (W * 0.92) / aspect));
      const w = h * aspect;
      const ox = (W - w) / 2, oy = bottom - h;
      // glow behind the portrait
      const g = h * 1.15;
      Object.assign(glow.style, { width: `${g}px`, height: `${g}px`, left: `${W / 2 - g / 2}px`, top: `${oy + h * 0.45 - g / 2}px` });
      Object.assign(photo.style, { left: `${ox}px`, top: `${oy}px`, width: `${w}px`, height: `${h}px` });
      return { ox, oy, w, h };
    }

    /** Sample the portrait into particle targets (every 3px, 4px on mobile). */
    function buildTargets(img: HTMLImageElement) {
      const { ox, oy, w, h } = portraitBox(img);
      const step = W < 700 ? 4 : 3;
      const c = document.createElement("canvas");
      c.width = Math.round(w);
      c.height = Math.round(h);
      const cx = c.getContext("2d", { willReadFrequently: true })!;
      cx.drawImage(img, 0, 0, c.width, c.height);
      const d = cx.getImageData(0, 0, c.width, c.height).data;
      const out: { x: number; y: number; lum: number }[] = [];
      for (let y = 0; y < c.height; y += step)
        for (let x = 0; x < c.width; x += step) {
          const i = (y * c.width + x) * 4;
          if (d[i + 3] < 140) continue;
          const lum = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
          out.push({ x: ox + x + (Math.random() - 0.5) * step * 0.6, y: oy + y + (Math.random() - 0.5) * step * 0.6, lum });
        }
      return out;
    }

    const newDust = (): Particle => ({
      x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.2 + 0.4, a: Math.random() * 0.5 + 0.1,
      lum: Math.random(), tw: Math.random() * 6.28, delay: Math.random(), tx: null, ty: null, sx: 0, sy: 0, ang: 0,
    });
    const makeDust = (n: number) => (P = Array.from({ length: n }, newDust));

    function assignTargets(targets: { x: number; y: number; lum: number }[], ms = 2400) {
      while (P.length < targets.length) P.push(newDust());
      P.sort(() => Math.random() - 0.5);
      P.forEach((p, i) => {
        const t = targets[i];
        p.col = undefined;
        if (t) {
          p.tx = t.x; p.ty = t.y; p.lum = t.lum; p.sx = p.x; p.sy = p.y; p.ang = Math.random() * 6.28;
        } else p.tx = null;
      });
      ASSEMBLE = ms;
      assembleT0 = performance.now();
      mode = "assemble";
    }

    function draw(now: number) {
      if (!visible) {
        raf = 0;
        return;
      }
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        let alpha: number, size: number;
        if (mode === "dust" || p.tx == null || p.ty == null) {
          p.tw += 0.03;
          p.x += Math.sin(p.tw) * 0.15;
          p.y -= 0.08;
          if (p.y < -5) p.y = H + 5;
          size = p.s;
          alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw * 2)) * (mode === "dust" ? 1 : 0.45);
          ctx.fillStyle = `rgba(214,208,255,${alpha.toFixed(3)})`;
        } else {
          const t = Math.max(0, Math.min(1, (now - assembleT0 - p.delay * ASSEMBLE * 0.4) / (ASSEMBLE * 0.6)));
          const e = easeInOut(t);
          const swirl = (1 - e) * 120;
          const bx = p.sx + (p.tx - p.sx) * e + Math.cos(p.ang + e * 4) * swirl;
          const by = p.sy + (p.ty - p.sy) * e + Math.sin(p.ang + e * 4) * swirl;
          let rx = 0, ry = 0;
          if (t >= 1) {
            const dx = bx - mouse.x, dy = by - mouse.y, d2 = dx * dx + dy * dy;
            if (d2 < 9000) {
              const f = (1 - d2 / 9000) * 26;
              const dd = Math.sqrt(d2) || 1;
              rx = (dx / dd) * f;
              ry = (dy / dd) * f;
            }
            p.tw += 0.05;
          }
          // ease back toward the pushed position so particles drift rather than snap
          const nx = bx + rx + (t >= 1 ? Math.sin(p.tw) * 0.3 : 0), ny = by + ry;
          p.x = t >= 1 ? p.x + (nx - p.x) * 0.2 : nx;
          p.y = t >= 1 ? p.y + (ny - p.y) * 0.2 : ny;
          const l = p.lum;
          size = 1.4 + l * 1.6;
          const key = photoShown ? 2 : 1;
          if (t >= 1 && p.col && p.colKey === key) ctx.fillStyle = p.col;
          else {
            alpha = (0.45 + l * 0.55) * (0.35 + 0.65 * e) * (photoShown ? 0.55 : 1);
            // dark pixels → violet rgb(124,92,255), light pixels → lilac white rgb(242,240,255)
            const r = Math.round(124 + 118 * l), g = Math.round(92 + 148 * l);
            const col = `rgba(${r},${g},255,${alpha.toFixed(3)})`;
            if (t >= 1) {
              p.col = col;
              p.colKey = key;
            }
            ctx.fillStyle = col;
          }
        }
        ctx.fillRect(p.x, p.y, size, size);
      }
      raf = requestAnimationFrame(draw);
    }
    const startLoop = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    /** Crossfade the real (violet-tinted) photo in under the particles so the face reads clearly. */
    function showPhotoAfter(ms: number, id: number) {
      clearTimeout(photoTimer);
      photoTimer = setTimeout(() => {
        if (!alive(id)) return;
        photoShown = true;
        photo.animate([{ opacity: 0, filter: "blur(8px)" }, { opacity: 0.92, filter: "blur(0px)" }], {
          duration: 1200,
          fill: "forwards",
          easing: "ease-out",
        });
      }, ms);
    }

    /* ---------- reset DOM to the starting state (also used by Replay) ---------- */
    function resetDom(final: boolean) {
      clearTimeout(photoTimer);
      photo.getAnimations().forEach((a) => a.cancel());
      photo.style.opacity = "0";
      photoShown = false;
      text.textContent = final ? FINAL : NAME;
      word.style.clipPath = final ? "none" : "inset(0 100% 0 0)";
      word.style.transform = "translate(-50%,-50%)";
      for (const el of [dot, bar, sub, cta, glow, spot]) el.style.opacity = "0";
      dot.style.transform = "scale(0)";
      bar.style.transform = "none";
    }

    function markDone() {
      scrollLock.set("intro", false);
      intro.set(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    }

    /* ---------- the full ~5.5s timeline ---------- */
    async function play(id: number) {
      resetDom(false);
      makeDust(Math.round((W * H) / 2600));
      startLoop();
      const imgP = loadPortrait();

      // 1. spotlight + spark
      fadeIn(spot, 700, 0);
      const wr0 = word.getBoundingClientRect(), rr = root.getBoundingClientRect();
      const wr = { left: wr0.left - rr.left, top: wr0.top - rr.top, width: wr0.width, height: wr0.height, bottom: wr0.bottom - rr.top };
      const dotY = wr.bottom + 18;
      dot.style.top = `${dotY}px`;
      dot.style.opacity = "1";
      await tween(420, (e) => (dot.style.transform = `scale(${e})`));
      await sleep(350);
      if (!alive(id)) return;

      // 2. light bar grows out of the spark, swings up and writes the name
      const startX = W / 2, baseY = wr.top + wr.height * 0.55;
      bar.style.opacity = "1";
      await tween(380, (e) => {
        bar.style.transform = `translate(${startX}px,${dotY - 6}px) rotate(${-20 - e * 140}deg) scaleX(${e})`;
      });
      await tween(
        1050,
        (e) => {
          const x = wr.left + wr.width * e;
          word.style.clipPath = `inset(0 ${100 - e * 100}% 0 0)`;
          bar.style.transform = `translate(${x}px,${baseY}px) rotate(${-68 + Math.sin(e * 9) * 6}deg) scaleX(1)`;
          dot.style.transform = `translate(${(x - W / 2) * 0.35}px,0) scale(${1 - e * 0.3})`;
        },
        (t) => t,
      );
      await tween(300, (e) => {
        bar.style.opacity = String(1 - e);
        dot.style.opacity = String(1 - e);
      });
      await sleep(250);
      if (!alive(id)) return;

      // 3. scramble morph MOULI → PORTFOLIO
      const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#&*%@";
      await tween(
        1000,
        (e) => {
          const n = Math.round(NAME.length + (FINAL.length - NAME.length) * Math.min(1, e * 1.6));
          let s = "";
          for (let i = 0; i < n; i++) {
            const settled = e > (i + 1) / (FINAL.length + 1);
            s += settled ? FINAL[i] : Math.random() < 0.55 && NAME[i] ? NAME[i] : glyphs[(Math.random() * glyphs.length) | 0];
          }
          text.textContent = s;
        },
        (t) => t,
      );
      if (!alive(id)) return;
      text.textContent = FINAL;
      await sleep(250);

      // 4. drop + 5. particles swirl into the portrait
      portrait = await imgP;
      if (!alive(id)) return;
      fadeIn(glow, 1600, 0);
      if (portrait) {
        assignTargets(buildTargets(portrait), 2400);
        showPhotoAfter(2100, id);
      }
      const dy = finalCenter() - H / 2;
      await tween(900, (e) => {
        word.style.transform = `translate(-50%, calc(-50% + ${dy * e}px)) scale(${1 + e * 0.12})`;
      }, easeInOut);
      if (!alive(id)) return;
      layoutFinal();
      fadeIn(sub, 600);
      intro.set(true); // navbar fades in
      setTimeout(() => alive(id) && fadeIn(cta, 600, 0), 600);
      tween(1200, (e) => (spot.style.opacity = String(1 - e * 0.65)));
      markDone();
    }

    /** Later visits / Skip: straight to the final state, particles assemble in 0.9s. */
    async function finishFast(id: number) {
      resetDom(true);
      spot.style.opacity = "0.35";
      for (const el of [sub, cta]) {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
      layoutFinal();
      if (!P.length) makeDust(Math.round((W * H) / 2600));
      startLoop();
      markDone();
      portrait = portrait ?? (await loadPortrait());
      if (!alive(id) || !portrait) return;
      fadeIn(glow, 800, 0);
      assignTargets(buildTargets(portrait), 900);
      showPhotoAfter(700, id);
    }

    /* ---------- boot ---------- */
    resize();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      resetDom(true);
      for (const el of [sub, cta]) el.style.opacity = "1";
      spot.style.opacity = "0.35";
      glow.style.opacity = "1";
      layoutFinal();
      intro.set(true);
      loadPortrait().then((img) => {
        if (!img) return;
        portrait = img;
        portraitBox(img);
        photo.style.opacity = "0.92";
      });
      return;
    }

    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    const full = forceFull.current || !seen;
    forceFull.current = false;
    if (full) {
      intro.set(false);
      scrollLock.set("intro", true);
      window.scrollTo(0, 0);
      play(++runId);
    } else {
      finishFast(++runId);
    }
    skipRef.current = () => finishFast(++runId);

    /* ---------- listeners ---------- */
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let rt: ReturnType<typeof setTimeout>;
    let lastW = W;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        // ignore mobile URL-bar height jitter
        if (root.clientWidth === lastW && Math.abs(root.clientHeight - H) < 120) return;
        lastW = root.clientWidth;
        resize();
        if (mode === "assemble" && portrait) {
          layoutFinal();
          assignTargets(buildTargets(portrait), 700);
        } else if (mode === "dust") {
          for (const p of P) {
            p.x = Math.random() * W;
            p.y = Math.random() * H;
          }
        }
      }, 200);
    };
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) startLoop();
    });
    io.observe(root);

    return () => {
      runId++;
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(rt);
      clearTimeout(photoTimer);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      scrollLock.set("intro", false);
    };
  }, [replayKey]);

  const replay = () => {
    forceFull.current = true;
    setReplayKey((k) => k + 1);
  };

  return (
    <section
      ref={rootRef}
      id="top"
      aria-label="Intro"
      className="relative h-[100svh] min-h-[540px] w-full overflow-hidden bg-void"
    >
      <div
        ref={spotRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(900px,150vmax)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{ background: "radial-gradient(circle,rgba(124,92,255,.16) 0%,rgba(124,92,255,.05) 35%,transparent 65%)" }}
      />
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute rounded-full opacity-0"
        style={{ background: "radial-gradient(circle,rgba(124,92,255,.32),rgba(255,79,216,.08) 45%,transparent 70%)" }}
      />
      {/* real photo under the particles: grayscale + violet→pink tint masked to the cut-out, bottom fades out */}
      <div
        ref={photoRef}
        id="hero-photo"
        className="pointer-events-none absolute opacity-0"
        style={{
          WebkitMaskImage: "linear-gradient(180deg,#000 70%,transparent 98%)",
          maskImage: "linear-gradient(180deg,#000 70%,transparent 98%)",
        }}
      >
        <Image
          src={PORTRAIT_SRC}
          alt="Portrait of Mouli Prasanth"
          fill
          priority
          sizes="(max-width: 700px) 92vw, 600px"
          className="object-contain"
          style={{ filter: "grayscale(1) contrast(1.15) brightness(1.05)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg,#9b85ff,#7C5CFF 55%,#ff4fd8)",
            mixBlendMode: "color",
            WebkitMaskImage: `url(${PORTRAIT_SRC})`,
            maskImage: `url(${PORTRAIT_SRC})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        />
      </div>
      <canvas ref={cvRef} aria-hidden className={`absolute inset-0 size-full ${staticMode ? "hidden" : ""}`} />

      <div
        ref={dotRef}
        aria-hidden
        className="absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 size-3 rounded-full bg-white opacity-0"
        style={{ boxShadow: "0 0 18px 4px rgba(200,190,255,.65)", transform: "scale(0)" }}
      />
      <div
        ref={barRef}
        aria-hidden
        className="absolute left-0 top-0 -ml-1.5 -mt-1.5 h-3 w-[58px] rounded-lg opacity-0"
        style={{
          transformOrigin: "6px 6px",
          background: "linear-gradient(90deg,#fff,rgba(220,214,255,.85) 60%,rgba(124,92,255,0))",
          boxShadow: "0 0 16px rgba(200,190,255,.55)",
        }}
      />

      <h1 className="sr-only">Mouli Prasanth — UI/UX &amp; Graphic Designer portfolio</h1>
      <div
        ref={wordRef}
        id="hero-word"
        aria-hidden
        className="absolute left-1/2 top-1/2 whitespace-nowrap font-display font-extrabold leading-none tracking-[-0.02em]"
        style={{
          // PORTFOLIO in Syne 800 is ~9.75em wide; at 1.12 scale this keeps it inside ~90vw
          fontSize: "clamp(26px, min(8.2vw, 19svh), 168px)",
          transform: "translate(-50%,-50%)",
          clipPath: "inset(0 100% 0 0)",
        }}
      >
        <span ref={textRef} className="text-chrome inline-block py-[0.04em]">
          {NAME}
        </span>
      </div>

      <p
        ref={subRef}
        data-hero-reveal
        className="absolute left-4 top-0 whitespace-nowrap text-[clamp(14px,1.3vw,19px)] font-bold text-ink opacity-0"
      >
        UI/UX &amp; Graphic <em className="text-grad pr-1 font-serif text-[1.25em] font-normal">Designer</em>
      </p>

      <div
        ref={ctaRef}
        data-hero-reveal
        className="absolute bottom-5 right-4 flex items-center gap-4 opacity-0 sm:bottom-8 sm:right-8"
      >
        <a
          href="#contact"
          className="group flex min-h-11 items-center gap-3 rounded-full py-1 pl-4 pr-1 text-sm text-ink"
          data-cursor-label="Hello"
        >
          Say hello
          <span className="btn-grad grid size-10 place-items-center rounded-full transition-transform group-hover:scale-110">
            ✦
          </span>
        </a>
      </div>

      <div className="absolute bottom-5 left-4 flex items-center gap-3 sm:bottom-8 sm:left-8">
        {!introDone ? (
          <button
            type="button"
            onClick={() => skipRef.current()}
            className="glass min-h-11 rounded-lg px-4 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-ink"
          >
            Skip intro
          </button>
        ) : (
          <>
            <span className="label hidden sm:inline">( scroll )</span>
            {!staticMode && (
              <button
                type="button"
                onClick={replay}
                aria-label="Replay intro"
                className="glass grid size-11 place-items-center rounded-full text-muted hover:text-ink"
              >
                <RotateCcw className="size-4" />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

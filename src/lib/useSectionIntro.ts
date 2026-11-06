"use client";

/**
 * Section intros, ported from reference/preloader-reference.html.
 * Runs once when the section is 25% into view:
 *  - [data-intro-title]      spark + light bar sweep across the heading, clip-path reveal, letters scramble in
 *  - [data-intro-particles]  the image inside builds from its own pixels, then the real image fades in
 *  - [data-intro-fade]       fade up 24px, 90ms stagger (items before the title go first)
 * Hidden start states live in globals.css; elements are marked [data-shown] when revealed.
 */
import { useEffect, type RefObject } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#&*%@";
const SAFETY_MS = 15000;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function tween(ms: number, fn: (e: number, t: number) => void, e: (t: number) => number = ease) {
  return new Promise<void>((res) => {
    const t0 = performance.now();
    const f = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      fn(e(t), t);
      if (t < 1) requestAnimationFrame(f);
      else res();
    };
    requestAnimationFrame(f);
  });
}

const loadImg = (src: string) =>
  new Promise<HTMLImageElement | null>((r) => {
    const i = new Image();
    i.onload = () => r(i);
    i.onerror = () => r(null);
    i.src = src;
  });

/* ---------- reveal helpers ---------- */
function showFade(el: HTMLElement) {
  el.dataset.shown = "true";
}
function showTitle(el: HTMLElement) {
  el.style.clipPath = "";
  el.dataset.shown = "true";
}
function showParticles(box: HTMLElement) {
  box.dataset.shown = "true";
}
function revealAll(section: HTMLElement) {
  section.querySelectorAll<HTMLElement>("[data-intro-fade]").forEach(showFade);
  section.querySelectorAll<HTMLElement>("[data-intro-title]").forEach(showTitle);
  section.querySelectorAll<HTMLElement>("[data-intro-particles]").forEach(showParticles);
}

function fadeIn(els: HTMLElement[]) {
  els.forEach((el, i) => {
    showFade(el);
    const a = el.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }], {
      duration: 700,
      delay: i * 90,
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "backwards",
    });
    // let inline transforms (tilt, rotation) take over again once done
    a.finished.then(() => a.cancel()).catch(() => {});
  });
}

/** Scramble only the text nodes so nested spans (gradient words) survive. */
async function writeTitle(section: HTMLElement, title: HTMLElement) {
  const sr = section.getBoundingClientRect();
  const er = title.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(title);
  const tr = range.getBoundingClientRect();
  const left = tr.left - sr.left, top = tr.top - sr.top, w = tr.width, h = tr.height;

  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  const nodes: { node: Text; text: string; start: number }[] = [];
  let total = 0;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent ?? "";
    nodes.push({ node: n as Text, text, start: total });
    total += text.length;
  }

  const spark = document.createElement("div");
  spark.className = "intro-spark";
  const bar = document.createElement("div");
  bar.className = "intro-bar";
  spark.style.left = `${left}px`;
  spark.style.top = `${top + h + 14}px`;
  bar.style.opacity = "0";
  section.append(spark, bar);

  // clip in px relative to the heading box (the text may be narrower than the heading)
  const textLeftInEl = tr.left - er.left;
  const clip = (e: number) => `inset(-20% ${Math.max(0, er.width - textLeftInEl - w * e)}px -20% 0)`;
  title.style.clipPath = clip(0);
  title.dataset.shown = "true";

  await tween(300, (e) => (spark.style.transform = `scale(${e})`));
  bar.style.opacity = "1";
  await tween(
    Math.min(1100, 450 + w * 0.6),
    (e) => {
      const x = left + w * e;
      title.style.clipPath = clip(e);
      bar.style.transform = `translate(${x}px,${top + h * 0.55}px) rotate(${-66 + Math.sin(e * 8) * 6}deg)`;
      spark.style.transform = `translate(${w * e * 0.9}px,0) scale(${1 - e * 0.3})`;
      for (const { node, text, start } of nodes) {
        let s = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          s += /\s/.test(ch) || (start + i) / total < e - 0.15 ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        node.textContent = s;
      }
    },
    (t) => t,
  );
  for (const { node, text } of nodes) node.textContent = text;
  title.style.clipPath = "";
  await tween(260, (e) => {
    spark.style.opacity = bar.style.opacity = String(1 - e);
  });
  spark.remove();
  bar.remove();
}

async function particleImage(box: HTMLElement) {
  const img = box.querySelector("img");
  if (!img) return showParticles(box);
  const src = await loadImg(img.currentSrc || img.src);
  const w = box.clientWidth, h = box.clientHeight;
  if (!src || !w || !h) return showParticles(box);

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const c = document.createElement("canvas");
  c.className = "intro-cv";
  c.width = Math.round(w * DPR);
  c.height = Math.round(h * DPR);
  box.appendChild(c);
  const x = c.getContext("2d")!;
  x.setTransform(DPR, 0, 0, DPR, 0, 0);

  // sample the image's own pixels (object-fit: cover) every 6px
  const sc = document.createElement("canvas");
  sc.width = Math.round(w);
  sc.height = Math.round(h);
  const sx = sc.getContext("2d", { willReadFrequently: true })!;
  const s = Math.max(w / src.width, h / src.height), dw = src.width * s, dh = src.height * s;
  sx.drawImage(src, (w - dw) / 2, (h - dh) / 2, dw, dh);
  let d: Uint8ClampedArray;
  try {
    d = sx.getImageData(0, 0, sc.width, sc.height).data;
  } catch {
    c.remove();
    return showParticles(box);
  }
  const step = 6;
  const pts: { x: number; y: number; col: string; sx: number; sy: number; d: number }[] = [];
  for (let yy = 0; yy < sc.height; yy += step)
    for (let xx = 0; xx < sc.width; xx += step) {
      const i = (yy * sc.width + xx) * 4;
      if (d[i + 3] < 140) continue;
      pts.push({
        x: xx + (Math.random() - 0.5) * step * 0.6,
        y: yy + (Math.random() - 0.5) * step * 0.6,
        col: `${d[i]},${d[i + 1]},${d[i + 2]}`,
        sx: Math.random() * w,
        sy: h + Math.random() * h * 0.6,
        d: Math.random(),
      });
    }

  await tween(
    1300,
    (_, t) => {
      x.clearRect(0, 0, w, h);
      for (const p of pts) {
        const k = easeInOut(Math.max(0, Math.min(1, (t - p.d * 0.35) / 0.65)));
        x.fillStyle = `rgba(${p.col},${0.25 + 0.75 * k})`;
        x.fillRect(p.sx + (p.x - p.sx) * k, p.sy + (p.y - p.sy) * k, 4, 4);
      }
    },
    (t) => t,
  );
  showParticles(box);
  img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600 });
  c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: "forwards" }).finished.then(() => c.remove());
}

async function sectionIntro(section: HTMLElement) {
  const title = section.querySelector<HTMLElement>("[data-intro-title]");
  const fades = [...section.querySelectorAll<HTMLElement>("[data-intro-fade]")];
  const before = title ? fades.filter((f) => f.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING) : [];
  fadeIn(before);
  if (title) await writeTitle(section, title);
  fadeIn(fades.filter((f) => !before.includes(f)));
  section
    .querySelectorAll<HTMLElement>("[data-intro-particles]")
    .forEach((b, i) => setTimeout(() => particleImage(b), 150 + i * 160));
}

export function useSectionIntro(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealAll(section);
      return;
    }
    // safety net: nothing can stay hidden
    const safety = setTimeout(() => revealAll(section), SAFETY_MS);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        sectionIntro(section);
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(section);
    return () => {
      clearTimeout(safety);
      io.disconnect();
    };
  }, [ref]);
}

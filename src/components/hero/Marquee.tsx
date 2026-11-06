"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WORDS = ["UI/UX", "BRANDING", "POSTERS", "PROTOTYPING", "ILLUSTRATION", "DESIGN SYSTEMS"];
const STAR = ["text-violet", "text-pink", "text-cyan"];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w, i) => (
        <span key={w} className="flex items-center">
          <span className="px-5 font-display text-[clamp(28px,5vw,64px)] font-extrabold uppercase tracking-tight sm:px-8">{w}</span>
          <span className={`text-[clamp(20px,3vw,40px)] ${STAR[i % 3]}`}>✺</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tween = gsap.to("[data-track]", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = Math.min(5, 1 + Math.abs(self.getVelocity()) / 400);
          gsap.to(tween, { timeScale: self.direction < 0 ? -v : v, duration: 0.2, overwrite: true });
          gsap.to(tween, { timeScale: self.direction < 0 ? -1 : 1, duration: 1.2, delay: 0.25 });
        },
      });
      // pause on hover (mouse only), like the footer band
      const el = ref.current!;
      const pause = (e: PointerEvent) => e.pointerType === "mouse" && tween.pause();
      const resume = () => tween.resume();
      el.addEventListener("pointerenter", pause);
      el.addEventListener("pointerleave", resume);
      return () => {
        st.kill();
        el.removeEventListener("pointerenter", pause);
        el.removeEventListener("pointerleave", resume);
      };
    },
    { scope: ref },
  );
  return (
    <div ref={ref} aria-label="UI/UX, Branding, Posters, Prototyping, Illustration, Design Systems" className="relative overflow-hidden border-y border-line bg-card/40 py-5 sm:py-7">
      <div data-track aria-hidden className="marquee-track">
        <Row />
        <Row />
      </div>
    </div>
  );
}

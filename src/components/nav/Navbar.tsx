"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/data/site";
import { scrollLock, useIntroDone } from "@/lib/hooks";

export default function Navbar() {
  const pathname = usePathname();
  const introDone = useIntroDone();
  const visibleByIntro = pathname !== "/" || introDone;
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // hide on scroll down, show on scroll up
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;
      setHidden(y > lastY && y > 160);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // active section dot
  useEffect(() => {
    if (pathname !== "/") return;
    const ids = nav.map((n) => n.href.split("#")[1]);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // menu: lock scroll + Esc closes
  useEffect(() => {
    scrollLock.set("menu", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      scrollLock.set("menu", false);
    };
  }, [open]);

  const show = visibleByIntro && (!hidden || open);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-3 z-50 flex justify-center px-3 transition-all duration-500 sm:top-4 ${
          show ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-6 opacity-0"
        }`}
      >
        <nav
          aria-label="Main"
          className="glass flex w-full max-w-[720px] items-center justify-between gap-2 rounded-full py-1.5 pl-5 pr-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,.6)]"
        >
          <Link href="/" className="group flex min-h-11 items-center font-display text-lg font-extrabold tracking-tight" aria-label="Mouli Prasanth — home">
            {site.shortName}
            <span className="ml-0.5 inline-block text-pink transition-transform duration-700 group-hover:rotate-[360deg]">*</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {nav.map((n) => {
              const isActive = active === n.href.split("#")[1];
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={`relative flex min-h-11 items-center rounded-full px-3.5 text-sm transition-colors ${
                      isActive ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {n.label}
                    {isActive && (
                      <span className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_8px_2px_rgba(61,245,255,.7)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1">
            <Link
              href="/#contact"
              className="btn-grad hidden min-h-10 items-center rounded-full px-5 text-sm font-semibold xs:flex"
              data-cursor-label="Hire"
            >
              Hire me
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-11 place-items-center rounded-full md:hidden"
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-0.5 w-5 rounded bg-ink transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-0.5 w-5 rounded bg-ink transition-all ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* mobile full-screen menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto px-6 pb-8 pt-28 transition-[opacity,visibility] duration-500 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(124,92,255,.55), transparent 60%), radial-gradient(100% 70% at 100% 100%, rgba(255,79,216,.45), transparent 60%), #08070D",
        }}
      >
        <ul className="flex flex-col gap-1">
          {[...nav, { label: "Contact", href: "/#contact" }].map((n, i) => (
            <li
              key={n.href}
              className="transition-all duration-500"
              style={{
                transitionDelay: open ? `${80 + i * 60}ms` : "0ms",
                transform: open ? "none" : "translateY(24px)",
                opacity: open ? 1 : 0,
              }}
            >
              <Link
                href={n.href}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="relative flex min-h-12 items-center py-1 pl-7 font-display text-[clamp(22px,6.6vw,56px)] font-extrabold uppercase leading-[1.05] tracking-tight"
              >
                <span className="absolute left-0 top-2 font-mono text-[11px] text-white/50">0{i + 1}</span>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col gap-2 text-sm text-white/70">
          <a href={`mailto:${site.email}`} tabIndex={open ? 0 : -1} className="break-all">
            {site.email}
          </a>
          <span>{site.location}</span>
        </div>
      </div>
    </>
  );
}

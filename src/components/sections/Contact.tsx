"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Copy, Download, Phone } from "lucide-react";
import Magnetic from "@/components/ui/Magnetic";
import { SectionLabel, Sticker } from "@/components/ui/bits";
import { useSectionIntro } from "@/lib/useSectionIntro";
import { site } from "@/data/site";

const TYPES = ["UI/UX", "Branding", "Poster", "Other"];

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  useSectionIntro(ref);
  const [copied, setCopied] = useState(false);
  const [type, setType] = useState("UI/UX");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      window.location.href = `mailto:${site.email}`;
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  const links = [
    { label: "LinkedIn", href: site.socials.linkedin },
    { label: "Naukri", href: site.socials.naukri },
    { label: "Behance", href: site.socials.behance },
    { label: "Dribbble", href: site.socials.dribbble },
  ];

  return (
    <section ref={ref} id="contact" className="relative overflow-hidden px-[var(--pad-x)] py-20 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="glow-blob violet left-[-10%] top-[10%] size-[70vmax] opacity-90" />
        <div className="glow-blob pink right-[-20%] top-[30%] size-[60vmax]" />
      </div>
      <div className="relative mx-auto max-w-[1320px]">
        <div>
          <div data-intro-fade>
            <SectionLabel n="07">Say hello</SectionLabel>
          </div>
          <h2 data-intro-title className="mt-4 max-w-5xl font-display text-[clamp(26px,8.4vw,124px)] font-extrabold uppercase leading-[0.92] tracking-[-0.02em]">
            Let&apos;s make something <span className="font-serif font-normal normal-case italic text-grad">beautiful.</span>
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div data-intro-fade className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center gap-6">
              <Magnetic strength={0.4}>
                <a
                  href={`mailto:${site.email}`}
                  data-cursor-label="Mail"
                  className="btn-grad grid size-32 place-items-center rounded-full text-center font-display text-lg font-extrabold uppercase leading-tight sm:size-40 sm:text-xl"
                >
                  Say
                  <br />
                  hello
                </a>
              </Magnetic>
              <div className="relative">
                <button
                  type="button"
                  onClick={copy}
                  className="glass inline-flex min-h-12 max-w-full items-center gap-2 rounded-full px-5 text-sm"
                  aria-label={`Copy email ${site.email}`}
                >
                  <span className="truncate">{site.email}</span>
                  <Copy className="size-4 shrink-0" />
                </button>
                <span
                  aria-live="polite"
                  className={`absolute -top-8 right-2 transition-all duration-300 ${copied ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
                >
                  {copied && <Sticker rot={-6} variant="grad">Copied ✦</Sticker>}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-2 text-ink hover:text-pink">
                <Phone className="size-4" /> {site.phone}
              </a>
              <a href={site.whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-ink hover:text-pink">
                <ArrowUpRight className="size-4" /> WhatsApp
              </a>
            </div>

            <ul className="flex flex-wrap gap-2">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-card/70 px-4 text-sm hover:border-violet"
                  >
                    {l.label} <ArrowUpRight className="size-3.5" />
                  </a>
                </li>
              ))}
              <li>
                <a href={site.resume} download className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-card/70 px-4 text-sm hover:border-violet">
                  Resume <Download className="size-3.5" />
                </a>
              </li>
            </ul>
          </div>

          <form data-intro-fade onSubmit={submit} className="card flex flex-col gap-5 p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="label">Name</span>
                <input required name="name" autoComplete="name" className="min-h-12 rounded-xl border border-line bg-void px-4 text-ink outline-none transition-colors focus:border-violet" />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="label">Email</span>
                <input required type="email" name="email" autoComplete="email" className="min-h-12 rounded-xl border border-line bg-void px-4 text-ink outline-none transition-colors focus:border-violet" />
              </label>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="label mb-2">Project type</legend>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={type === t}
                    onClick={() => setType(t)}
                    className={`min-h-11 rounded-full border px-4 text-sm transition-all ${
                      type === t ? "btn-grad border-transparent" : "border-line bg-void text-muted hover:text-ink"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-2 text-sm">
              <span className="label">Message</span>
              <textarea required name="message" rows={4} className="rounded-xl border border-line bg-void px-4 py-3 text-ink outline-none transition-colors focus:border-violet" />
            </label>
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-grad inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : status === "sent" ? "Sent — talk soon ✦" : "Send message"}
            </button>
            {status === "error" && (
              <p role="alert" className="text-sm text-pink">
                Couldn&apos;t send right now — email me directly at {site.email}.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

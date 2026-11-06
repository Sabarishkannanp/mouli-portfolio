import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProject, work } from "@/data/work";
import { SectionLabel } from "@/components/ui/bits";
import NextProjectLink from "@/components/work/NextProjectLink";
import Footer from "@/components/sections/Footer";

export function generateStaticParams() {
  return work.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    openGraph: { images: [{ url: p.cover, width: 1920, height: 1200 }] },
  };
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const idx = work.findIndex((w) => w.slug === p.slug);
  const next = work[(idx + 1) % work.length];

  return (
    <>
      <main id="main" className="relative overflow-x-clip">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[120svh]" />
        <div aria-hidden className="glow-blob violet -left-[15%] top-0 size-[60vmax] opacity-70" />

        <header className="relative px-[var(--pad-x)] pb-10 pt-28 sm:pt-36">
          <div className="mx-auto max-w-[1200px]">
            <Link href="/#work" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-ink">
              <ArrowLeft className="size-4" /> All work
            </Link>
            <p className="label mt-6">
              ( {String(idx + 1).padStart(2, "0")} — case study )
            </p>
            <h1 className="mt-3 font-display text-[clamp(28px,6.5vw,92px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
              {p.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted sm:text-lg">{p.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full border border-line bg-card px-3 py-1 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="relative px-[var(--pad-x)]">
          <div className="card mx-auto aspect-[16/10] max-w-[1200px]" data-cursor="pick" data-palette={p.palette.join(",")}>
            <Image src={p.cover} alt={`${p.title} — cover`} fill priority sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover" />
          </div>
        </div>

        <section className="relative px-[var(--pad-x)] py-16 sm:py-24">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              ["Role", p.role],
              ["Tools", p.tools.join(", ")],
              ["Timeline", p.timeline],
            ].map(([k, v]) => (
              <div key={k} className="card p-6">
                <p className="label">{k}</p>
                <p className="mt-2 text-lg">{v}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-16 grid max-w-[1200px] grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <SectionLabel n="01">Problem</SectionLabel>
            <p className="text-xl leading-relaxed sm:text-2xl">{p.problem}</p>
          </div>

          <div className="mx-auto mt-16 grid max-w-[1200px] grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <SectionLabel n="02">Process</SectionLabel>
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {p.process.map((s, i) => (
                <li key={s.title} className="card p-6">
                  <p className="font-mono text-xs text-muted">0{i + 1}</p>
                  <h2 className="mt-1 font-display text-xl font-extrabold uppercase">{s.title}</h2>
                  <p className="mt-2 text-sm text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mx-auto mt-16 max-w-[1200px]">
            <SectionLabel n="03">Gallery</SectionLabel>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {p.gallery.map((src, i) => (
                <div key={src} className={`card relative aspect-[16/10] ${i === 0 ? "md:col-span-2" : ""}`} data-cursor="pick" data-palette={p.palette.join(",")}>
                  <Image src={src} alt={`${p.title} — image ${i + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-[1200px] grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <SectionLabel n="04">Outcome</SectionLabel>
            <p className="text-xl leading-relaxed sm:text-2xl">{p.outcome}</p>
          </div>
        </section>

        <NextProjectLink slug={next.slug} title={next.title} accent={next.accent} />
      </main>
      <Footer />
    </>
  );
}

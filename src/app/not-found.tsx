import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="relative grid min-h-svh place-items-center px-6 text-center">
      <div aria-hidden className="dot-grid absolute inset-0" />
      <div className="relative">
        <p className="label">( 404 — lost layer )</p>
        <h1 className="mt-4 font-display text-[clamp(64px,18vw,220px)] font-extrabold leading-none text-chrome">404</h1>
        <p className="mt-2 font-serif text-2xl italic text-muted">this frame is empty.</p>
        <Link href="/" className="btn-grad mt-8 inline-flex min-h-12 items-center rounded-full px-6 text-sm font-semibold">
          Back home
        </Link>
      </div>
    </main>
  );
}

import ParticleHeroIntro from "@/components/hero/ParticleHeroIntro";
import HeroBento from "@/components/hero/HeroBento";
import Marquee from "@/components/hero/Marquee";
import Work from "@/components/sections/Work";
import Playground from "@/components/sections/Playground";
import Process from "@/components/sections/Process";
import Toolkit from "@/components/sections/Toolkit";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <main id="main" className="relative overflow-x-clip">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-x-0 top-[100svh] h-[160svh]" />
        <ParticleHeroIntro />
        <div className="relative">
          <div aria-hidden className="glow-blob violet -left-[20%] top-0 size-[60vmax] opacity-70" />
          <HeroBento />
        </div>
        <Marquee />
        <Work />
        <Playground />
        <Process />
        <Toolkit />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

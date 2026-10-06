import type { Page } from "@/lib/content";
import type { HomeSection } from "@/lib/home";
import { Hero, Stats, WhatAre, WhyChoose } from "@/components/sections/home/Intro";
import Team from "@/components/sections/home/Team";
import { Growth, Projects, Trusted } from "@/components/sections/home/Services";
import { Ai, Cta, Faq, Process, Testimonials, TestimonialsIntro } from "@/components/sections/home/Proof";
import GenericPage from "./GenericPage";

// Homepage: structured sections from scripts/extract-home.mjs. A section the extractor couldn't read
// arrives as { kind: "raw" } and renders as WP HTML so nothing goes missing.
function Section({ s }: { s: HomeSection }) {
  switch (s.kind) {
    case "hero": return <Hero s={s} />;
    case "stats": return <Stats s={s} />;
    case "whatAre": return <WhatAre s={s} />;
    case "whyChoose": return <WhyChoose s={s} />;
    case "team": return <Team s={s} />;
    case "trusted": return <Trusted s={s} />;
    case "growth": return <Growth s={s} />;
    case "projects": return <Projects s={s} />;
    case "ai": return <Ai s={s} />;
    case "process": return <Process s={s} />;
    case "testimonialsIntro": return <TestimonialsIntro s={s} />;
    case "testimonials": return <Testimonials s={s} />;
    case "faq": return <Faq s={s} />;
    case "cta": return <Cta s={s} />;
    case "raw": return <div className="wp-content" dangerouslySetInnerHTML={{ __html: s.html }} />;
  }
}

export default function Home({ page }: { page: Page }) {
  if (!page.home) return <GenericPage page={page} />;
  return (
    <main>
      {page.home.map((s) => (
        <Section key={s.id} s={s} />
      ))}
    </main>
  );
}

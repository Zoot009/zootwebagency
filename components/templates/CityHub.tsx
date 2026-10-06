import type { CitySection, Page } from "@/lib/content";
import Awards from "@/components/sections/Awards";
import AuditForm from "@/components/sections/AuditForm";
import CaseStudies from "@/components/sections/CaseStudies";
import CtaBand from "@/components/sections/CtaBand";
import Faq from "@/components/sections/Faq";
import Hero from "@/components/sections/Hero";
import IntroCard from "@/components/sections/IntroCard";
import ServiceCards from "@/components/sections/ServiceCards";
import StatsBand from "@/components/sections/StatsBand";
import Testimonials from "@/components/sections/Testimonials";
import WhyCards from "@/components/sections/WhyCards";
import { box, Fallback } from "@/components/sections/wp";
import GenericPage from "./GenericPage";

// Unrecognised sections still render, part by part.
function Generic({ s }: { s: CitySection }) {
  return (
    <section className={`${box} flex flex-col gap-[20px] p-[10px] py-[60px]`}>
      {[...s.parts, ...(s.cards ?? []).flatMap((c) => c.parts)].map((p, i) => <Fallback key={i} p={p} />)}
    </section>
  );
}

const SECTIONS: Record<CitySection["kind"], (props: { s: CitySection; page: Page }) => React.ReactNode> = {
  hero: Hero,
  stats: StatsBand,
  intro: IntroCard,
  audit: AuditForm,
  cases: CaseStudies,
  testimonials: Testimonials,
  cta: CtaBand,
  services: ServiceCards,
  why: WhyCards,
  awards: Awards,
  faq: Faq,
  generic: Generic,
};

// City hubs and city service pages share one Elementor layout, so one template renders both.
export default function CityHub({ page }: { page: Page }) {
  if (!page.city?.sections.length) return <GenericPage page={page} />;
  return (
    // Body text comes from <body>, except line height: the kit's 2.1em is a fixed 29.4px that children inherit.
    // Links take their parent's color (a heading's links follow the heading color, as Elementor's does); explicit link colors win.
    // wp-default: page used WP's default template, where the Hello theme underlines content links.
    <main className={`leading-[29.4px] [:where(&)_a]:text-inherit ${page.wpTemplate === "" ? "wp-default" : ""}`}>
      {page.city.sections.map((s, i) => {
        const Section = SECTIONS[s.kind];
        return <Section key={i} s={s} page={page} />;
      })}
    </main>
  );
}

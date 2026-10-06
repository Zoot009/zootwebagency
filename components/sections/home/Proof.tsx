import Image from "next/image";
import type { EkitHeading, HomeSection } from "@/lib/home";
import { ArrowRight } from "../icons";
import Slider from "../Slider";
import { Headline, Rich, Svg, container, hide, sectionTitle } from "../ui";
import AiTabs from "./AiTabs";

type S<K> = Extract<HomeSection, { kind: K }>;

// ElementsKit heading whose <span> is filled with a gradient ("text_fill" style).
function Ekit({ h, className, fill }: { h: EkitHeading; className: string; fill: string }) {
  const Tag = h.tag as "h4";
  return (
    <Tag
      className={`${className} [&>span]:bg-clip-text [&>span]:text-transparent ${fill}`}
      dangerouslySetInnerHTML={{ __html: h.html }}
    />
  );
}

// Small rounded label above a heading (emoji + "OUR PROCESS" / "TESTIMONIALS").
function Badge({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="font-display text-[23px]/[1.3]">{emoji}</span>
      <p className="rounded-lg bg-[radial-gradient(circle_at_center,transparent_14%,color-mix(in_srgb,var(--color-blue)_38%,transparent)_100%)] px-2.5 py-1 font-nunito text-xs/6 tracking-[1.5px] text-white uppercase max-md:text-[10px]/5">
        {label}
      </p>
    </div>
  );
}

export function Ai({ s }: { s: S<"ai"> }) {
  return (
    <section className="relative isolate bg-night-6 bg-[url(/uploads/2026/01/ChatGPT-Image-Jan-13-2026-12_09_59-PM.png)] bg-cover bg-center py-[50px] before:absolute before:inset-0 before:-z-10 before:bg-navy/87 max-md:pt-2.5 max-md:pb-[30px]">
      <div className={container}>
        <Headline h={s.title} className={`${sectionTitle} text-center max-md:text-left max-md:text-[22px]/[1.5]`} />
        <Rich html={s.subtitle} className="mt-12 text-center max-md:mt-5 max-md:text-left" />
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {s.counters.map((c, i) => (
            <div key={i} className="rounded-lg border border-white/12 py-5 text-center">
              <p className="font-tight text-[30px]/[30px] font-semibold text-counter">
                {c.prefix}
                {c.value.toLocaleString("en-US").replaceAll(",", c.separator)}
                {c.suffix}
              </p>
              <p className="text-[17px]/[42.5px] text-counter-title">{c.title}</p>
            </div>
          ))}
        </div>
        <div className="mt-[30px] grid items-center gap-10 md:grid-cols-2 [&>*]:min-w-0">
          <Rich html={s.body} />
          <div className={hide(s.tabsHidden)}>
            <AiTabs tabs={s.tabs} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Process({ s }: { s: S<"process"> }) {
  return (
    <section className="border-t border-white/12 bg-night-7 py-4">
      <div className="relative isolate mx-auto w-[85%] overflow-hidden rounded-[25px] bg-navy-2 max-md:w-[95%] xl:w-[90%] xl:max-w-[1026px]">
        <div className="absolute inset-0 -z-10 bg-[url(/uploads/2025/08/BG-014.jpg)] bg-cover opacity-80" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-process)_0%,black_100%)] opacity-50" />
        <div className="px-5 pt-6 pb-5 md:px-[80px] md:py-[70px]">
          <Badge {...s.badge} />
          <Ekit
            h={s.title}
            fill="[&>span]:bg-[linear-gradient(165deg,var(--color-cyan)_0%,var(--color-blue-2)_100%)]"
            className="mt-2.5 text-center font-sans md:mt-4 text-[25px]/[1.2] font-medium tracking-[-2px] text-white max-md:text-left md:text-[45px]/[1.2] lg:text-[53px]/[1.2] xl:text-[50px]/[1.2] [&>span]:text-[40px]/[1.2] [&>span]:font-bold md:[&>span]:text-[47px]/[1.2] lg:[&>span]:text-[60px]/[1.2] xl:[&>span]:text-[56px]/[1.2]"
          />
          <Rich html={s.body} className="mx-auto mt-2.5 max-w-[620px] text-center text-heading max-md:text-left md:mt-5" />
          <div className="mt-5 grid gap-x-5 gap-y-5 md:mt-16 md:grid-cols-2 md:gap-y-8">
            {s.items.map((it) => (
              <a key={it.title} href={it.href ?? "#"} className="block text-[15px]/[29.4px] tracking-[-0.1px] text-body">
                <span className="grid size-[34px] place-items-center rounded-full bg-white p-2">
                  <Svg svg={it.icon} className="size-4" />
                </span>
                <p className="pt-2.5">{it.title}</p>
                <p>{it.text}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsIntro({ s }: { s: S<"testimonialsIntro"> }) {
  return (
    <section className="relative isolate bg-night-8 pt-12 max-md:pt-0">
      <div className="absolute inset-0 -z-10 bg-[url(/uploads/2025/08/BG-011.jpg)] bg-contain bg-left bg-no-repeat opacity-50" />
      <div className={container}>
        <Badge {...s.badge} />
        <Headline
          h={s.title}
          className="mt-[70px] text-center font-display text-[22px]/[1.5] font-semibold tracking-[-0.3px] max-md:mt-5 max-md:text-left md:text-[39px]/[1.3] xl:text-[45px]/[1.3]"
        />
        <Rich html={s.body} className="mt-10 text-center text-[15px]/[20px] text-heading max-md:mt-5 max-md:text-left xl:text-sm/[2.1]" />
      </div>
    </section>
  );
}

export function Testimonials({ s }: { s: S<"testimonials"> }) {
  return (
    <section className="bg-night-8 px-[15px] pb-5">
      <div className={container}>
        <Slider label="Testimonials" perView={[1, 2, 3]} gap={30}>
          {s.items.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-[10px] border border-white/12 bg-testimonial pt-[34px] pr-10 pb-8 pl-[30px] max-md:min-h-0"
            >
              <Rich html={t.html} className="flex-1 font-lato text-sm/6 text-white lg:max-xl:text-[15px]/[25px]" />
              <figcaption className="mt-10">
                {t.stars && <Image src={t.stars.src} alt={t.stars.alt} width={120} height={24} />}
                <p className="group mt-2.5 font-lato text-lg/6 font-bold text-white hover:text-blue-3">{t.name}</p>
                {t.role && <p className="font-lato text-sm/6 text-blue-3">{t.role}</p>}
              </figcaption>
            </figure>
          ))}
        </Slider>
      </div>
    </section>
  );
}

export function Faq({ s }: { s: S<"faq"> }) {
  return (
    <section className="relative isolate bg-night-9 bg-[url(/uploads/2026/01/ChatGPT-Image-Jan-13-2026-12_09_59-PM.png)] bg-cover bg-center pt-[99px] pb-[30px] before:absolute before:inset-0 before:-z-10 before:bg-black/70 max-md:pt-10">
      <div className={container}>
        <Headline h={s.title} className={`${sectionTitle} text-center max-md:text-left max-md:text-[22px]/[1.5]`} />
        <Rich html={s.intro} className="mx-auto mt-5 max-w-[866px] text-center font-semibold max-md:text-left" />
        <div className="mt-8 grid items-start gap-x-20 gap-y-5 md:grid-cols-2">
          {s.columns.map((col, i) => (
            <div key={i} className="flex flex-col gap-[11px] md:gap-5 md:px-[31px]">
              {col.map((q) => (
                <details key={q.q} open={q.open} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-faq p-[15px] md:px-5 md:py-4 text-[15px]/[1.4] font-bold text-heading [&::-webkit-details-marker]:hidden">
                    {q.q}
                    <svg viewBox="0 0 448 512" className="size-[19px] shrink-0 fill-blue transition group-open:rotate-180 max-md:hidden" aria-hidden="true">
                      <path d="M125.1 208h197.8c10.7 0 16.1 13 8.5 20.5l-98.9 98.3c-4.7 4.7-12.2 4.7-16.9 0l-98.9-98.3c-7.7-7.5-2.3-20.5 8.4-20.5zM448 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48zm-48 346V86c0-3.3-2.7-6-6-6H54c-3.3 0-6 2.7-6 6v340c0 3.3 2.7 6 6 6h340c3.3 0 6-2.7 6-6z" />
                    </svg>
                  </summary>
                  <Rich html={q.a} className="p-[30px] text-[13px]/6 [&_p]:mb-[13px] md:pt-5 md:pb-2.5 md:text-[13px]/[29.4px]" />
                </details>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Cta({ s }: { s: S<"cta"> }) {
  return (
    <section className="relative isolate flex min-h-[65vh] flex-col overflow-hidden rounded-xl bg-[linear-gradient(117deg,var(--color-blue)_0%,var(--color-cyan)_100%)] px-2.5 md:min-h-[45vh] md:justify-center">
      <div className="absolute inset-0 -z-10 bg-[url(/uploads/2025/08/Asset-045.png)] bg-contain bg-right-bottom bg-no-repeat" />
      <div className="max-w-[764px] p-2.5 max-md:pt-8">
        <Ekit
          h={s.title}
          fill="[&>span]:bg-[linear-gradient(165deg,var(--color-cta-accent)_0%,var(--color-blue)_100%)]"
          className="font-sans text-[40px]/[1.2] font-bold tracking-[-2px] text-white md:text-[47px]/[1.2] lg:text-[60px]/[1.2] xl:text-[56px]/[1.2]"
        />
        <Rich html={s.body} className="mt-5 text-heading" />
        <a
          href={s.button.href}
          className="mt-8 inline-flex items-center gap-3 rounded-xl bg-navy px-[30px] py-[17px] text-sm/none font-semibold tracking-[0.3px] text-white"
        >
          {s.button.text}
          <ArrowRight className="size-3" />
        </a>
      </div>
    </section>
  );
}

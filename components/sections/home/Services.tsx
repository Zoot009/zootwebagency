import Image from "next/image";
import Link from "next/link";
import type { FlowItem, HomeSection } from "@/lib/home";
import { BoxTitle, Headline, Rich, Svg, container, hide, sectionTitle } from "../ui";

type S<K> = Extract<HomeSection, { kind: K }>;

// Text widgets styled with blue links on WP ("View case study").
const BLUE_LINKS = new Set(["95c27c1"]);

// A column of headings and rich text, in WP order.
function Flow({ items }: { items: FlowItem[] }) {
  return items.map((it, i) => {
    if (it.kind === "headline")
      return it.tag === "h4" ? (
        <Headline key={i} h={it} className="mt-5" />
      ) : (
        <Headline
          key={i}
          h={it}
          className="mb-[46px] font-sans text-[28px]/[49px] font-semibold tracking-[-2px] md:text-[39px]/[49px] xl:text-[43px]/[49px]"
        />
      );
    if (it.kind === "html") return <Rich key={i} html={it.html} className={`mt-5 first:mt-0 [h4+&]:mt-[34px] ${BLUE_LINKS.has(it.id) ? "text-blue-2 [&_a]:text-blue" : ""} ${hide(it.hidden)}`} />;
    return null;
  });
}

export function Trusted({ s }: { s: S<"trusted"> }) {
  return (
    <section className="bg-night-3 pt-[70px] pb-[50px] max-md:pt-10">
      <div className={`${container} grid gap-12 md:grid-cols-2 md:gap-[48px]`}>
        <div className="flex flex-col">
          <Flow items={s.left} />
        </div>
        <div>
          <div className="grid grid-cols-3 gap-5 max-md:grid-cols-2">
            {s.tiles.map((t) => (
              <Link
                key={t.title}
                href={t.href ?? "#"}
                className="flex flex-col items-center gap-2.5 rounded-[15px] border border-white/19 bg-tile px-2 pt-[21px] pb-2.5 text-center transition hover:bg-[linear-gradient(180deg,var(--color-tile-hover)_0%,var(--color-tile-hover-2)_100%)]"
              >
                <Svg svg={t.icon} className="size-[26px] text-tile-icon" />
                <BoxTitle box={t} className="text-[15px]/[29.4px] text-body" />
              </Link>
            ))}
          </div>
          <Rich html={s.cardTitle} className="mt-10 font-tight text-xl/[29.4px] font-medium" />
          <div className="mt-10 rounded-[11px] border border-white/28 pt-10 pr-[30px] pb-10 pl-10 max-md:px-5">
            <div className="grid grid-cols-2 gap-5">
              {s.cardStats.map((b) => (
                <div key={b.title} className="flex items-start gap-4 rounded-md bg-stat-card px-[15px] py-5 max-md:flex-col max-md:items-center max-md:text-center">
                  <Svg svg={b.icon} className="size-10 shrink-0" />
                  <div>
                    <BoxTitle box={b} className="font-tight text-base/[29.4px] font-semibold tracking-[0.6px]" />
                    <Rich html={b.html} className="mt-2 text-[15px]/[19px]" />
                  </div>
                </div>
              ))}
            </div>
            <Rich html={s.cardBody} className="mt-10 px-[11px] max-md:px-0" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Growth({ s }: { s: S<"growth"> }) {
  return (
    <section className="bg-night-4 pt-[90px] pb-[50px] max-md:pt-[50px]">
      <div className={container}>
        <div className="grid items-start gap-5 md:grid-cols-2 md:gap-10">
          <Image src={s.image.src} alt={s.image.alt} width={s.image.width} height={s.image.height} className="h-auto w-full rounded-[11px]" />
          <div className="flex flex-col gap-11 max-md:gap-0">
            <Headline h={s.title} className={`${sectionTitle} max-md:text-[22px]/[1.5]`} />
            <Rich html={s.body} />
          </div>
        </div>
        <div className="mt-[60px] rounded-[10px] border border-white/10 px-5 py-[25px] max-md:mt-5 max-md:py-0">
          <Headline h={s.boxTitle} className={`${sectionTitle} text-center max-md:text-left max-md:text-[22px]/[1.5]`} />
          <Rich html={s.boxBody} className="mx-auto mt-8 max-w-[760px] text-center max-md:mt-0 max-md:pb-5 max-md:text-left" />
        </div>
      </div>
    </section>
  );
}

export function Projects({ s }: { s: S<"projects"> }) {
  return (
    <section className="bg-night-5 pt-[50px] pb-20">
      <div className={container}>
        <Headline h={s.title} className={`${sectionTitle} text-center max-md:text-left max-md:text-[22px]/[1.5]`} />
        <Rich html={s.intro} className="mt-5 text-center text-[15px]/[20px] text-heading max-md:text-left xl:text-[15px]/[2.1]" />
        <div className="mt-[100px] grid gap-5 max-md:mt-10 md:grid-cols-2 lg:grid-cols-3">
          {s.items.map((p) => {
            const Title = p.titleTag as "p";
            const img = <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} className="aspect-[3/2] h-auto w-full rounded-xl object-cover" />;
            return (
              <div key={p.title} className="rounded-xl border border-white/11 bg-navy p-2.5 pb-[30px] max-md:pb-4">
                {p.href ? <a href={p.href}>{img}</a> : img}
                <div className="px-[9px]">
                  <Title className="mt-10 font-display max-md:mt-5 text-[23px]/[1.3] tracking-[-0.3px] text-white max-lg:text-[22px] max-md:text-[21px]">
                    {p.href ? <a href={p.href} className="text-white">{p.title}</a> : p.title}
                  </Title>
                  <ul className="mt-2.5 flex flex-wrap gap-x-4">
                    {p.tags.map((t) => (
                      <li key={t} className="font-tight text-sm/[1.6] font-light tracking-[0.1px] text-body hover:text-blue-2 max-lg:text-[13px]">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

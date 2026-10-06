import Image from "next/image";
import type { CSSProperties, ElementType } from "react";
import type { CityPart, CitySection } from "@/lib/content";

type Part<T extends CityPart["t"]> = Extract<CityPart, { t: T }>;

// WordPress HTML, rendered verbatim: copy, inline links and heading tags must match WP exactly.
// `link`/`align`: the widget's link color and text alignment from WP when the page sets them
// (they vary per page); otherwise rich text uses the kit's link color and the class alignment.
type HtmlProps = { as?: string; html: string; className?: string; link?: string; align?: string };
export function Html({ as = "div", html, className, link, align }: HtmlProps) {
  const Tag = as as ElementType; // tag names come from WP markup (h1-h6, p, div, span, strong)
  const style = link || align ? ({ "--link": link, textAlign: align } as CSSProperties) : undefined;
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

// WP link styling: the widget's color (else the kit's), underlined on pages that used WP's default
// template (main.wp-default), like the Hello theme does there.
export const links = "[&_a]:text-[var(--link,var(--color-heading))] in-[.wp-default]:[&_a]:underline";
// WP rich text: browser-default spacing (Tailwind's reset removes it) plus link styling.
export const rich = `[&_p]:my-[1em] [&_ul]:my-[1em] [&_ul]:list-disc [&_ul]:pl-10 [&_ol]:my-[1em] [&_ol]:list-decimal [&_ol]:pl-10 [&_h2]:my-[0.83em] [&_h3]:my-[1em] [&_h4]:my-[1.33em] ${links}`;

// Elementor "boxed" content width.
export const box = "mx-auto w-full max-w-site";

// Per-page paddings (section, its first container, the item grid) and content width as CSS vars;
// classes fall back to the usual values.
export const padVars = (s: CitySection) =>
  ({ "--sec": s.pad?.sec, "--box": s.pad?.box, "--grid": s.pad?.grid, "--width": s.width }) as CSSProperties;

export function Img({ p, sizes, className, eager }: { p: Part<"img">; sizes: string; className?: string; eager?: boolean }) {
  return (
    <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes={sizes} preload={eager} className={className} />
  );
}

export function Svg({ svg, className }: { svg: string; className?: string }) {
  return <span aria-hidden="true" className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function Btn({ p, className }: { p: Part<"btn">; className?: string }) {
  return <a href={p.href ?? undefined} className={className} dangerouslySetInnerHTML={{ __html: p.html }} />;
}

// Elementor "highlighted" animated headline. Its animated marker is transparent on the live site, so it's omitted.
type HeadlineProps = { p: Part<"headline">; className?: string; plain?: string; highlight: string };
export function Headline({ p, className, plain, highlight }: HeadlineProps) {
  const Tag = p.tag as ElementType;
  return (
    <Tag className={className}>
      <span className={plain} dangerouslySetInnerHTML={{ __html: p.before }} />{" "}
      <span className={`inline-block ${highlight}`} dangerouslySetInnerHTML={{ __html: p.highlight }} />
      {p.after && <>{" "}<span className={plain} dangerouslySetInnerHTML={{ __html: p.after }} /></>}
    </Tag>
  );
}

// Any part a section doesn't expect still renders, with neutral styling. (Forms, testimonials, FAQs
// and breadcrumbs only render in their own sections; the importer warns if one appears elsewhere.)
export function Fallback({ p }: { p: CityPart }) {
  switch (p.t) {
    case "h": return <Html as={p.tag} html={p.html} align={p.align} className="font-inter text-[24px] font-bold text-white" />;
    case "text": return <Html html={p.html} className={rich} link={p.link} align={p.align} />;
    case "html": return <Html html={p.html} />;
    case "img": return <Img p={p} sizes="(min-width: 1140px) 1140px, 100vw" className="h-auto max-w-full" />;
    case "btn": return <Btn p={p} className="text-blue" />;
    case "icon": return <Svg svg={p.svg} className="text-band [&_svg]:size-[25px]" />;
    case "headline": return <Headline p={p} highlight="text-blue" className="text-center font-inter text-[36px] font-extrabold" />;
    case "iconbox":
      return (
        <div>
          <Svg svg={p.svg} className="text-blue [&_svg]:size-[35px]" />
          <Html as={p.tag} html={p.html} className="my-[16px] font-tight text-[16px] font-semibold text-white" />
          <Html as="p" html={p.desc} link={p.link} className={`text-stat-label ${rich}`} />
        </div>
      );
    case "raw": return <Html html={p.html} className="wp-content" />;
    default: return null;
  }
}

import Image from "next/image";
import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import type { Page } from "@/lib/content";
import type { Device } from "@/lib/home";
import { Caret } from "./icons";
import { hide } from "./ui";
import { byClass, decode, find, findAll, hasClass, isContainer, isWidget, parse, raw, rawOuter, text, widgetType, type El } from "./elementor-html";

// Renders a page's Elementor HTML (page.html) as Tailwind-styled sections.
// Layout comes from the container tree; copy, heading tags, links and alt text are always copied from the
// source HTML. Widgets without a renderer fall back to their own (sanitized) HTML, so nothing is dropped.

export type Variant = "landing" | "classic"; // landing = WP template "elementor_header_footer", classic = default
type Ctx = { html: string; variant: Variant; page: Page; eager?: boolean }; // eager: above-the-fold section, load images now (LCP)

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const MD_COLS = ["", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"];
const COL_W: Record<string, string> = {
  "elementor-col-50": "md:w-1/2",
  "elementor-col-33": "md:w-1/3",
  "elementor-col-66": "md:w-2/3",
  "elementor-col-25": "md:w-1/4",
  "elementor-col-75": "md:w-3/4",
  "elementor-col-20": "md:w-1/5",
};
// Elementor "hide on <device>" classes -> shared hide() (mobile / tablet / laptop / desktop breakpoints).
const DEVICES: Device[] = ["mobile", "tablet", "laptop", "desktop"];
const vis = (el: El) => hide(DEVICES.filter((d) => hasClass(el, `elementor-hidden-${d}`)));
const settings = (el: El) => el.attrs["data-settings"] ?? "";
const types = (els: El[]) => els.filter(isWidget).map((w) => widgetType(w)!);
const isEyebrow = (s: string) => s.length < 60 && s === s.toUpperCase() && /[A-Z]/.test(s);
const isStat = (s: string) => /^\+?[₹$€£]?[\d.,]+\s*[%xX+kKMB]*$/.test(s.trim());

// WP draws some icons with plugin icon fonts (<i class="xlmetriz metriz-number-one"></i>, Ionicons, Phosphor, ...),
// which this site doesn't load. Numbered steps get a CSS-drawn circled digit; other glyphs a small dot.
// ponytail: dot stand-in, swap for per-glyph inline SVGs if the exact icons matter.
const ICON_FONT = [
  "[&_i[class]:empty:not([class*=metriz-number])]:inline-block [&_i[class]:empty:not([class*=metriz-number])]:size-2.5 [&_i[class]:empty:not([class*=metriz-number])]:rounded-full [&_i[class]:empty:not([class*=metriz-number])]:bg-blue-500",
  "[&_i[class*=metriz-number]]:grid [&_i[class*=metriz-number]]:size-8 [&_i[class*=metriz-number]]:place-items-center [&_i[class*=metriz-number]]:border-2 [&_i[class*=metriz-number]]:border-blue-500 [&_i[class*=metriz-number]]:bg-transparent [&_i[class*=metriz-number]]:text-sm [&_i[class*=metriz-number]]:font-bold [&_i[class*=metriz-number]]:not-italic [&_i[class*=metriz-number]]:text-blue-500",
  "[&_.metriz-number-one]:before:content-['1'] [&_.metriz-number-two]:before:content-['2'] [&_.metriz-number-three]:before:content-['3'] [&_.metriz-number-four]:before:content-['4'] [&_.metriz-number-five]:before:content-['5'] [&_.metriz-number-six]:before:content-['6'] [&_.metriz-number-seven]:before:content-['7']",
].join(" ");

export default function Elementor({ page, variant }: { page: Page; variant: Variant }) {
  const root = parse(page.html);
  const doc = find(root, (e) => "data-elementor-type" in e.attrs) ?? root;
  const ctx = { html: page.html, variant, page };
  return (
    <main className={cx("w-full", ICON_FONT, variant === "landing" && "font-inter")}>
      {doc.children.map((c, i) => (
        <Node key={c.start} el={c} prev={doc.children[i - 1]} ctx={i === 0 ? { ...ctx, eager: true } : ctx} top />
      ))}
    </main>
  );
}

// top: direct child of the page (a full-width band); inGrid: somewhere inside a multi-column layout.
// WP markup can nest an "e-parent" container inside a legacy section (the landing hero does), so position decides, not the class.
type NodeProps = { el: El; prev?: El; ctx: Ctx; top?: boolean; inGrid?: boolean; center?: boolean };

function Node(p: NodeProps) {
  if (isWidget(p.el)) return <Widget {...p} />;
  if (isContainer(p.el)) return <Container {...p} />;
  return <Raw className="" html={rawOuter(p.ctx.html, p.el)} />;
}

const Raw = ({ html, className }: { html: string; className: string }) => (
  <div className={cx("wp-raw", className)} dangerouslySetInnerHTML={{ __html: html }} />
);

// ---- Layout --------------------------------------------------------------------------------

const TEXTUAL = new Set(["heading", "animated-headline", "text-editor", "button", "breadcrumbs"]);
const textual = (el: El) => findAll(el, isWidget).every((w) => TEXTUAL.has(widgetType(w)!));

function Container({ el, ctx, top, inGrid, center }: NodeProps) {
  const kind = el.attrs["data-element_type"]; // container | section | column
  const sub = (cls: string) => el.children.find((c) => hasClass(c, cls));
  const body =
    (kind === "section" ? sub("elementor-container") : kind === "column" ? sub("elementor-widget-wrap") : hasClass(el, "e-con-boxed") ? sub("e-con-inner") : el) ?? el;
  const items = body.children.filter((c) => isWidget(c) || isContainer(c));
  const grid = hasClass(el, "e-grid");
  const hasBg = settings(el).includes('"background_background"');
  const w = types(items);

  // Header blocks (title + intro) are centered. Landing: blocks led by a two-tone headline or the breadcrumb (hero).
  // Classic: headline + text blocks, unless set beside an image. Centering reaches nested text/button-only blocks
  // (hero intro + CTAs) but not cards.
  const header =
    ctx.variant === "landing"
      ? w.some((t) => t === "animated-headline" || t === "breadcrumbs") || items.some((c) => byClass(c, "elementor-heading-title")?.tag === "h1")
      : w.length === items.length && w.includes("animated-headline") && !inGrid;
  const centerKids = center || header;
  // Landing stats strip: a band that is only a grid of icon-less icon boxes ("427%+ Increase in ...").
  const all = top ? findAll(el, isWidget) : [];
  const strip = ctx.variant === "landing" && all.length > 0 && all.every((x) => widgetType(x) === "icon-box" && !byClass(x, "elementor-icon-box-icon"));

  const n = items.length;
  // Grids nested in a column are half width: at most 2 across (the 2x2 stat cards beside "What is ...").
  // Widgets trailing two or more column containers wrap below them (classic hero: text | image, audit bar under the text).
  const trailing = n - 1 - items.findLastIndex(isContainer);
  const across = n - trailing >= 2 && items.slice(0, n - trailing).every(isContainer) ? n - trailing : n;
  const cols = inGrid ? Math.min(across, 2) : across <= 4 ? across : 3;
  // Flex containers stack, except 4+ column containers: on WP that is always a wrapping 2-up gallery ("Projects we are proud of").
  const gallery = !grid && kind === "container" && n >= 4 && items.every(isContainer);
  const layout =
    kind === "section" ? "flex flex-col md:flex-row" : grid ? cx("grid grid-cols-1", MD_COLS[cols]) : gallery ? "grid grid-cols-1 md:grid-cols-2" : "flex flex-col";
  const boxed = hasClass(el, "e-con-boxed") || hasClass(el, "elementor-section-boxed");
  const kids = items.map((c, i) => (
    <Node key={c.start} el={c} prev={items[i - 1]} ctx={ctx} inGrid={inGrid || grid || kind === "section"} center={centerKids && (isWidget(c) ? TEXTUAL.has(widgetType(c)!) : textual(c))} />
  ));

  if (top) {
    const Tag = el.tag as ElementType;
    return (
      <Tag className={cx("w-full overflow-x-clip px-4", strip ? cx("bg-blue-600 py-6", STRIP) : "py-12 md:py-20", hasBg && !strip && (ctx.variant === "landing" ? "bg-night" : "bg-navy"), vis(el))}>
        <div className={cx(layout, "gap-5", boxed && "mx-auto w-full max-w-site")}>{kids}</div>
      </Tag>
    );
  }
  // A child container with a background is a card; a grid with one is just a panel around cards.
  const card = hasBg && !grid && cx("rounded-2xl p-6 md:p-8", ctx.variant === "landing" ? "bg-slate-800" : "bg-gray-900");
  const col = kind === "column" && cx("w-full", Object.entries(COL_W).find(([c]) => hasClass(el, c))?.[1]);
  return <div className={cx(layout, "min-w-0 gap-5", boxed && "mx-auto w-full max-w-site", card, col, vis(el))}>{kids}</div>;
}

// ---- Widgets -------------------------------------------------------------------------------

const HEADING: Record<Variant, Record<"h1" | "eyebrow" | "lead" | "sub" | "title" | "stat", string>> = {
  landing: {
    h1: "font-inter text-[30px] font-black leading-[1.2] tracking-[0.2px] text-white md:text-[35px]",
    eyebrow: "font-inter text-xs font-bold uppercase tracking-wide text-blue-500 md:text-sm",
    lead: "font-inter text-[25px] font-extrabold leading-[1.2] tracking-[0.3px] text-blue-500 md:text-[30px]",
    sub: "font-inter text-base font-bold tracking-normal text-blue-500",
    title: "font-inter text-2xl font-extrabold leading-tight tracking-normal text-white md:text-[32px]",
    stat: "font-tight text-4xl font-black tracking-normal text-blue-500 md:text-[52px]",
  },
  classic: {
    h1: "font-display text-3xl font-semibold leading-tight text-heading md:text-[40px]",
    eyebrow: "text-xs font-semibold uppercase tracking-[3px] text-blue-2",
    lead: "font-display text-xl font-semibold text-blue",
    sub: "text-lg font-semibold text-blue",
    title: "font-display text-2xl font-semibold leading-tight text-heading md:text-[40px]",
    stat: "font-tight text-4xl font-bold text-blue-3 md:text-[55px]",
  },
};

// Two-tone headline: plain text + highlighted part (Amita script on classic pages). Rotating words: show the active one.
const HEADLINE: Record<Variant, string> = {
  landing:
    "font-inter text-2xl font-extrabold leading-tight tracking-normal text-white md:text-4xl [&_.elementor-headline-dynamic-wrapper]:text-blue-500",
  classic:
    "font-display text-[25px] font-semibold leading-tight text-heading md:text-[40px] [&_.elementor-headline-dynamic-wrapper]:font-script [&_.elementor-headline-dynamic-wrapper]:font-bold [&_.elementor-headline-dynamic-wrapper]:text-blue",
};
const HEADLINE_BASE = "[&_.elementor-headline-dynamic-text:not(.elementor-headline-text-active)]:hidden [&_svg]:hidden";

const TEXT: Record<Variant, string> = {
  landing: "text-[15px] leading-[1.8]",
  classic: "",
};
const TEXT_BASE =
  "[&_p:not(:last-child)]:mb-4 [&_a]:text-blue [&_a]:underline-offset-2 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-white [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-white [&_h5]:font-semibold [&_h5]:text-white [&_h6]:font-semibold [&_h6]:text-white";

const BUTTON = {
  base: "[&_a]:inline-flex [&_a]:items-center [&_a]:justify-center [&_a]:gap-2 [&_a]:font-extrabold [&_a]:transition [&_svg]:size-4 [&_svg]:fill-current",
  solid: "[&_a]:rounded-md [&_a]:px-6 [&_a]:py-3 [&_a]:bg-blue-500 [&_a]:text-white [&_a:hover]:bg-blue-600",
  outline: "[&_a]:rounded-md [&_a]:px-6 [&_a]:py-3 [&_a]:border [&_a]:border-white/60 [&_a]:text-white [&_a:hover]:bg-white/10",
  // Label over a case-study image ("Healthcare Clinic (GBP Optimization)").
  pill: "[&_a]:rounded-full [&_a]:border [&_a]:border-white/15 [&_a]:bg-navy [&_a]:px-5 [&_a]:py-2 [&_a]:text-xs [&_a]:text-white",
  // Uppercase tag ("FREE STRATEGY SESSION"); WP uses #f97316 = Tailwind orange-500.
  badge: "[&_a]:rounded-full [&_a]:border [&_a]:border-orange-500 [&_a]:px-5 [&_a]:py-2 [&_a]:text-xs [&_a]:text-orange-500",
};
const ALIGN: Record<string, string> = {
  "elementor-align-center": "text-center",
  "elementor-align-right": "md:text-right",
  "elementor-align-left": "text-left",
  "elementor-align-justify": "[&_a]:w-full",
  "elementor-mobile-align-center": "max-md:text-center",
  "elementor-mobile-align-left": "max-md:text-left",
  "elementor-mobile-align-justify": "max-md:[&_a]:w-full",
};
const align = (el: El) => cx(...Object.entries(ALIGN).map(([c, v]) => hasClass(el, c) && v));

const ICON = {
  stacked: "[&_.elementor-icon]:inline-flex [&_.elementor-icon]:rounded-lg [&_.elementor-icon]:bg-blue-3 [&_.elementor-icon]:p-2.5 [&_.elementor-icon]:text-white",
  framed: "[&_.elementor-icon]:inline-flex [&_.elementor-icon]:rounded-lg [&_.elementor-icon]:border [&_.elementor-icon]:border-blue-2 [&_.elementor-icon]:p-2.5 [&_.elementor-icon]:text-blue-2",
  default: "[&_.elementor-icon]:inline-flex [&_.elementor-icon]:text-blue-500",
};
const ICON_BOX =
  "[&_.elementor-icon-box-wrapper]:flex [&_.elementor-icon-box-wrapper]:flex-col [&_.elementor-icon-box-wrapper]:gap-4 [&_.elementor-icon_svg]:size-6 [&_.elementor-icon_svg]:fill-current [&_.elementor-icon-box-title]:font-tight [&_.elementor-icon-box-title]:text-lg [&_.elementor-icon-box-title]:font-semibold [&_.elementor-icon-box-title]:leading-snug [&_.elementor-icon-box-title]:tracking-normal [&_.elementor-icon-box-description]:mt-2 [&_.elementor-icon-box-description]:leading-relaxed";
const ICON_TEXT = "[&_.elementor-icon-box-title]:text-white [&_.elementor-icon-box-description]:text-[13px]";
const ICON_LEFT = "[&_.elementor-icon-box-wrapper]:flex-row [&_.elementor-icon-box-wrapper]:items-start";
// Big number card ("5.5B / Internet users worldwide"). Numeric titles in h5/h6 are small stat chips inside case-study cards.
const STAT_BOX =
  "text-center [&_.elementor-icon-box-title]:text-[26px] [&_.elementor-icon-box-title]:font-extrabold [&_.elementor-icon-box-title]:tracking-[0.8px] [&_.elementor-icon-box-title]:text-blue-500 md:[&_.elementor-icon-box-title]:text-[31px] [&_.elementor-icon-box-description]:text-base [&_.elementor-icon-box-description]:font-semibold";
const CHIP = "rounded-[11px] border border-white/10 bg-gray-900 p-4 [&_.elementor-icon-box-title]:text-white [&_.elementor-icon-box-description]:text-[15px]";
// Stat boxes sit directly on the blue strip: no card, white text, 4 across even on mobile (as on WP).
const STRIP =
  "[&_.grid]:grid-cols-4 [&_.grid]:gap-2 [&_.ib-card]:border-0 [&_.ib-card]:bg-transparent [&_.ib-card]:p-0 [&_.ib-card]:text-white [&_.ib-card_.elementor-icon-box-title]:text-white max-md:[&_.ib-card_.elementor-icon-box-title]:text-[11px] max-md:[&_.ib-card_.elementor-icon-box-description]:mt-0.5 max-md:[&_.ib-card_.elementor-icon-box-description]:text-[8px] max-md:[&_.ib-card_.elementor-icon-box-description]:leading-tight";
const CARD: Record<Variant, string> = {
  landing: "rounded-xl border border-white/5 bg-gray-900 p-6",
  classic: "rounded-xl bg-gray-900 p-6",
};

const EKIT_ICON_BOX =
  "rounded-xl bg-slate-800 p-6 [&_.elementskit-infobox]:flex [&_.elementskit-infobox]:gap-4 [&_.elementskit-info-box-icon_svg]:size-7 [&_.elementskit-info-box-icon_svg]:fill-blue-2 [&_.elementskit-info-box-title]:mb-2 [&_.elementskit-info-box-title]:font-archivo [&_.elementskit-info-box-title]:font-semibold [&_.elementskit-info-box-title]:text-white [&_p]:text-[13px] [&_p]:leading-relaxed";

const FORM =
  "rounded-xl [&_.elementor-form-fields-wrapper]:grid [&_.elementor-form-fields-wrapper]:grid-cols-1 [&_.elementor-form-fields-wrapper]:gap-4 md:[&_.elementor-form-fields-wrapper]:grid-cols-2 md:[&_.elementor-col-100]:col-span-2 [&_label]:mb-1 [&_label]:block [&_label]:text-sm [&_label]:text-orange [&_:is(input,select,textarea)]:w-full [&_:is(input,select,textarea)]:rounded-md [&_:is(input,select,textarea)]:bg-slate-800 [&_:is(input,select,textarea)]:px-4 [&_:is(input,select,textarea)]:py-3 [&_:is(input,select,textarea)]:text-sm [&_:is(input,select,textarea)]:text-white [&_select]:appearance-none [&_.elementor-select-wrapper]:relative [&_.select-caret-down-wrapper]:pointer-events-none [&_.select-caret-down-wrapper]:absolute [&_.select-caret-down-wrapper]:right-4 [&_.select-caret-down-wrapper]:top-1/2 [&_.select-caret-down-wrapper]:-translate-y-1/2 [&_.select-caret-down-wrapper_svg]:size-3 [&_.select-caret-down-wrapper_svg]:fill-white [&_button]:w-full [&_button]:rounded-md [&_button]:bg-linear-to-r [&_button]:from-blue [&_button]:to-cyan [&_button]:px-6 [&_button]:py-3 [&_button]:font-bold [&_button]:text-white md:[&_.elementor-field-type-submit]:col-span-2";

const TESTIMONIALS =
  "[&_.swiper-wrapper]:flex [&_.swiper-wrapper]:snap-x [&_.swiper-wrapper]:snap-mandatory [&_.swiper-wrapper]:gap-5 [&_.swiper-wrapper]:overflow-x-auto [&_.swiper-wrapper]:pb-4 [&_.swiper-slide]:shrink-0 [&_.swiper-slide]:basis-full [&_.swiper-slide]:snap-start md:[&_.swiper-slide]:basis-[calc((100%-1.25rem)/2)] lg:[&_.swiper-slide]:basis-[calc((100%-2.5rem)/3)] [&_.swiper-slide-inner]:h-full [&_.elementskit-single-testimonial-slider]:relative [&_.elementskit-single-testimonial-slider]:flex [&_.elementskit-single-testimonial-slider]:h-full [&_.elementskit-single-testimonial-slider]:flex-col [&_.elementskit-single-testimonial-slider]:gap-4 [&_.elementskit-single-testimonial-slider]:rounded-[10px] [&_.elementskit-single-testimonial-slider]:border [&_.elementskit-single-testimonial-slider]:border-white/10 [&_.elementskit-single-testimonial-slider]:bg-slate-800 [&_.elementskit-single-testimonial-slider]:px-8 [&_.elementskit-single-testimonial-slider]:py-8 [&_.elementskit-stars]:flex [&_.elementskit-stars]:gap-1.5 [&_.elementskit-stars_svg]:size-3.5 [&_.elementskit-stars_svg]:fill-orange-300 [&_.elementskit-watermark-icon]:absolute [&_.elementskit-watermark-icon]:right-7 [&_.elementskit-watermark-icon]:bottom-7 [&_.elementskit-watermark-icon_svg]:size-10 [&_.elementskit-watermark-icon_svg]:fill-blue-500/20 [&_.elementskit-commentor-content]:min-h-36 [&_.elementskit-commentor-content]:grow [&_.elementskit-commentor-content]:text-sm [&_.elementskit-commentor-content]:leading-6 [&_.elementskit-commentor-content]:text-white [&_.elementskit-author-name]:text-lg [&_.elementskit-author-name]:font-bold [&_.elementskit-author-name]:text-white";

const LIST =
  "[&_ul]:space-y-2 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_.elementor-icon-list-icon_svg]:mt-1.5 [&_.elementor-icon-list-icon_svg]:size-3.5 [&_.elementor-icon-list-icon_svg]:fill-blue-2";
const LIST_INLINE = "[&_ul]:flex [&_ul]:flex-wrap [&_ul]:gap-x-4 [&_ul]:space-y-0";

const COUNTER =
  "text-center [&_.elementor-counter]:flex [&_.elementor-counter]:flex-col-reverse [&_.elementor-counter]:gap-1 [&_.elementor-counter-number-wrapper]:font-tight [&_.elementor-counter-number-wrapper]:text-5xl [&_.elementor-counter-number-wrapper]:font-bold [&_.elementor-counter-number-wrapper]:text-blue-3 [&_.elementor-counter-title]:text-lg [&_.elementor-counter-title]:font-semibold [&_.elementor-counter-title]:text-white";

const PROGRESS =
  "[&_.elementor-title]:text-sm [&_.elementor-title]:text-white [&_.elementor-progress-wrapper]:mt-1 [&_.elementor-progress-wrapper]:overflow-hidden [&_.elementor-progress-wrapper]:rounded-full [&_.elementor-progress-wrapper]:bg-white/10 [&_.elementor-progress-bar]:flex [&_.elementor-progress-bar]:justify-end [&_.elementor-progress-bar]:rounded-full [&_.elementor-progress-bar]:bg-blue-3 [&_.elementor-progress-bar]:px-2 [&_.elementor-progress-bar]:text-[10px] [&_.elementor-progress-bar]:leading-4 [&_.elementor-progress-bar]:text-white";

const REPORT_BAR =
  "[&_.zoot-report-bar]:flex [&_.zoot-report-bar]:max-w-md [&_.zoot-report-bar]:gap-2 [&_.zoot-report-bar]:rounded-xl [&_.zoot-report-bar]:border [&_.zoot-report-bar]:border-white/10 [&_.zoot-report-bar]:bg-gray-900 [&_.zoot-report-bar]:p-2 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:rounded-lg [&_input]:bg-night [&_input]:px-4 [&_input]:text-sm [&_input]:text-white [&_.zoot-btn]:shrink-0 [&_.zoot-btn]:rounded-lg [&_.zoot-btn]:bg-linear-to-r [&_.zoot-btn]:from-blue-600 [&_.zoot-btn]:to-blue-500 [&_.zoot-btn]:px-4 [&_.zoot-btn]:py-2.5 [&_.zoot-btn]:text-sm [&_.zoot-btn]:font-semibold [&_.zoot-btn]:text-white";

const RATING =
  "[&_.e-rating-wrapper]:flex [&_.e-rating-wrapper]:gap-1 [&_.e-icon-unmarked]:hidden [&_svg]:size-4 [&_svg]:fill-orange";

function Widget({ el, prev, ctx, center }: NodeProps): ReactNode {
  const { html, variant } = ctx;
  const t = widgetType(el);
  const v = cx(vis(el), center && "text-center");
  const r = () => raw(html, el);

  switch (t) {
    case "heading": {
      const h = byClass(el, "elementor-heading-title");
      if (!h) break;
      const s = text(html, h);
      const p = prev && widgetType(prev) === "heading" ? byClass(prev, "elementor-heading-title") : undefined;
      const role =
        h.tag === "h1" ? "h1"
        : isEyebrow(s) ? "eyebrow"
        : isStat(s) ? "stat"
        : p?.tag === "h1" ? "lead"
        : p && !isEyebrow(text(html, p)) ? "sub"
        : "title";
      const Tag = h.tag as ElementType;
      return <Tag className={cx(HEADING[variant][role], v)} dangerouslySetInnerHTML={{ __html: raw(html, h) }} />;
    }
    case "animated-headline": {
      const h = byClass(el, "elementor-headline");
      if (!h) break;
      const Tag = h.tag as ElementType;
      return <Tag className={cx(HEADLINE[variant], HEADLINE_BASE, v)} dangerouslySetInnerHTML={{ __html: raw(html, h) }} />;
    }
    case "elementskit-heading":
      return <Raw className={cx(HEADING[variant].title, "[&_p]:mt-2 [&_p]:text-sm [&_p]:font-normal", v)} html={r()} />;
    case "text-editor":
      return <Raw className={cx(TEXT[variant], TEXT_BASE, v)} html={r()} />;
    case "breadcrumbs":
      return <Breadcrumbs page={ctx.page} className={v} />;
    case "image": {
      const img = find(el, (e) => e.tag === "img");
      if (!img) break;
      const cap = find(el, (e) => e.tag === "figcaption");
      return (
        <div className={cx("text-center", v)}>
          <WpImage widget={el} eager={ctx.eager} />
          {cap && <figcaption className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: raw(html, cap) }} />}
        </div>
      );
    }
    case "image-box": {
      const img = find(el, (e) => e.tag === "img");
      const content = byClass(el, "elementor-image-box-content");
      if (!img || !content) break;
      // Elementor's image-box image is 30% wide beside the text (position left/right), full width on top.
      const side = hasClass(el, "elementor-position-left") || hasClass(el, "elementor-position-right");
      return (
        <div className={cx("flex gap-4", side ? "flex-row items-center" : "flex-col", hasClass(el, "elementor-position-right") && "flex-row-reverse", v)}>
          <div className={side ? "w-[30%] shrink-0" : undefined}>
            <WpImage widget={el} eager={ctx.eager} className="w-full rounded-lg" />
          </div>
          <Raw
            className="[&_.elementor-image-box-title]:font-tight [&_.elementor-image-box-title]:text-xl [&_.elementor-image-box-title]:font-semibold [&_.elementor-image-box-title]:text-white [&_.elementor-image-box-description]:mt-2 [&_.elementor-image-box-description]:text-[13px]"
            html={rawOuter(html, content)}
          />
        </div>
      );
    }
    case "button":
    case "elementskit-button": {
      // Filled by default; the second of a pair is outlined (hero: "Get My Free Proposal" + "Explore Services").
      const after = prev && widgetType(prev);
      const style = isEyebrow(text(html, el)) ? BUTTON.badge : after === "image" ? BUTTON.pill : /button/.test(after || "") ? BUTTON.outline : BUTTON.solid;
      return <Raw className={cx(BUTTON.base, style, align(el), v)} html={r()} />;
    }
    case "icon-box": {
      const title = byClass(el, "elementor-icon-box-title");
      const view = hasClass(el, "elementor-view-stacked") ? "stacked" : hasClass(el, "elementor-view-framed") ? "framed" : "default";
      const numeric = !!title && !byClass(el, "elementor-icon-box-icon") && isStat(text(html, title));
      const kind = !numeric ? cx(ICON_TEXT, CARD[variant]) : /^h[56]$/.test(title.tag) ? CHIP : cx(STAT_BOX, CARD[variant]);
      return <Raw className={cx(ICON_BOX, ICON[view], hasClass(el, "elementor-position-left") && ICON_LEFT, kind, "ib-card", v)} html={r()} />;
    }
    case "elementskit-icon-box":
      return <Raw className={cx(EKIT_ICON_BOX, v)} html={r()} />;
    case "icon-list":
      return <Raw className={cx(LIST, hasClass(el, "elementor-icon-list--layout-inline") && LIST_INLINE, v)} html={r()} />;
    case "counter": {
      // Elementor animates from 0 with JS; render the final value it counts to.
      const num = byClass(el, "elementor-counter-number");
      const to = num?.attrs["data-to-value"] ?? "";
      const value = to.replace(/^\d+/, (d) => d.replace(/\B(?=(\d{3})+$)/g, num?.attrs["data-delimiter"] ?? ""));
      return <Raw className={cx(COUNTER, v)} html={r().replace(/(class="elementor-counter-number"[^>]*>)[^<]*/, `$1${value}`)} />;
    }
    case "progress":
      return <Raw className={cx(PROGRESS, v)} html={r().replace(/class="elementor-progress-bar" data-max="(\d+)"/, '$& style="width:$1%"')} />;
    case "rating":
      return <Raw className={cx(RATING, v)} html={r()} />;
    case "form":
      return <Raw className={cx(FORM, v)} html={r()} />;
    case "elementskit-testimonial":
      return <Raw className={cx(TESTIMONIALS, "min-w-0", v)} html={r()} />;
    case "elementskit-client-logo": // logo carousel: 6 across on desktop, swipeable below
      return (
        <Raw
          className={cx(
            "min-w-0 [&_.swiper-wrapper]:flex [&_.swiper-wrapper]:snap-x [&_.swiper-wrapper]:gap-4 [&_.swiper-wrapper]:overflow-x-auto [&_.swiper-slide]:shrink-0 [&_.swiper-slide]:basis-full [&_.swiper-slide]:snap-start md:[&_.swiper-slide]:basis-[calc((100%-1rem)/2)] lg:[&_.swiper-slide]:basis-[calc((100%-5rem)/6)] [&_img]:mx-auto [&_img]:h-12 [&_img]:w-auto",
            v,
          )}
          html={r()}
        />
      );
    case "elementskit-accordion":
      return <Faq el={el} html={html} className={v} />;
    case "spacer":
      return <div className={cx("h-6 md:h-12", v)} />;
    case "divider":
      return <Raw className={cx("[&_.elementor-divider-separator]:block [&_.elementor-divider-separator]:border-t [&_.elementor-divider-separator]:border-white/15", v)} html={r()} />;
  }
  // html widgets and anything unknown. The "website audit" bar's CSS lives in WP site-wide custom CSS, not in the page.
  return <Raw className={cx("min-w-0", r().includes("zoot-report-bar") && REPORT_BAR, v)} html={r()} />;
}

/** The widget's <img> as next/image, keeping a wrapping link (<a href><img></a>) if WP has one. */
function WpImage({ widget, eager, className }: { widget: El; eager?: boolean; className?: string }) {
  const link = find(widget, (e) => e.tag === "a" && !!find(e, (x) => x.tag === "img"));
  const img = find(widget, (e) => e.tag === "img")!;
  const { src, alt = "", title, width, height } = img.attrs;
  // ponytail: Elementor custom-size thumbs have no width/height; render unsized (no CLS reservation) until the importer records sizes.
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const image = (
    <Image
      src={src}
      alt={alt}
      title={title || undefined}
      width={w}
      height={h}
      sizes="(min-width: 768px) 50vw, 100vw"
      loading={eager ? "eager" : undefined}
      className={cx("mx-auto h-auto max-w-full", !w && "w-full", className ?? "rounded-lg")}
    />
  );
  if (!link) return image;
  const { href, target, rel } = link.attrs;
  return <a href={href} target={target} rel={rel}>{image}</a>;
}

/** Rank Math breadcrumb, built from the page's BreadcrumbList JSON-LD (page.html has it rendered without page context). */
function Breadcrumbs({ page, className }: { page: Page; className?: string }) {
  type Item = { item: { "@id": string; name: string } };
  const nodes = page.jsonLd.flatMap((ld) => (ld as { "@graph"?: object[] })["@graph"] ?? [ld]) as { "@type"?: string; itemListElement?: Item[] }[];
  const items = nodes.find((n) => n["@type"] === "BreadcrumbList")?.itemListElement ?? [];
  return (
    <nav aria-label="breadcrumbs" className={cx("text-sm", className)}>
      <p>
        {items.map(({ item }, i) =>
          i === items.length - 1 ? (
            <span key={i} className="text-white">{decode(item.name)}</span>
          ) : (
            <span key={i}>
              <Link href={new URL(item["@id"]).pathname} className="text-blue-500 hover:underline">
                {decode(item.name)}
              </Link>
              <span> - </span>
            </span>
          ),
        )}
      </p>
    </nav>
  );
}

/** ElementsKit accordion -> native <details> (no JS). Keeps the question's ARIA heading level from WP. */
function Faq({ el, html, className }: { el: El; html: string; className?: string }) {
  const cards = findAll(el, (e) => hasClass(e, "elementskit-card"));
  return (
    <div className={cx("flex min-w-0 flex-col gap-4", className)}>
      {cards.map((c) => {
        const head = byClass(c, "elementskit-card-header");
        const title = byClass(c, "ekit-accordion-title");
        const body = byClass(c, "elementskit-card-body");
        if (!title || !body) return <Raw key={c.start} className="" html={rawOuter(html, c)} />;
        return (
          <details key={c.start} open={hasClass(byClass(c, "collapse") ?? c, "show")} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md border border-white/20 bg-slate-800 px-4 py-3 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
              <span role={head?.attrs.role} aria-level={head?.attrs["aria-level"] ? Number(head.attrs["aria-level"]) : undefined} dangerouslySetInnerHTML={{ __html: raw(html, title) }} />
              <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center rounded-[3px] bg-white transition group-open:rotate-180">
                <Caret className="w-2 text-slate-800" />
              </span>
            </summary>
            <div className="wp-raw px-4 pt-4 text-sm leading-relaxed [&_p:not(:last-child)]:mb-3" dangerouslySetInnerHTML={{ __html: raw(html, body) }} />
          </details>
        );
      })}
    </div>
  );
}

import type { Device, Headline as H, IconBox } from "@/lib/home";

// Elementor "hide on <device>" -> Tailwind (mobile <768, tablet 768–1024, laptop 1025–1366, desktop ≥1367).
const HIDE: Record<Device, string> = {
  mobile: "max-md:hidden",
  tablet: "md:max-lg:hidden",
  laptop: "lg:max-xl:hidden",
  desktop: "xl:hidden",
};
export const hide = (devices: Device[] = []) => devices.map((d) => HIDE[d]).join(" ");

// WP headline: plain text + Amita accent ("highlight"), rendered at its original heading level.
export function Headline({ h, className = "" }: { h: H; className?: string }) {
  const Tag = h.tag as "h2";
  return (
    <Tag className={`${className} ${hide(h.hidden)}`}>
      {h.before}
      {h.highlight && (
        <>
          {" "}
          <span className="inline-block font-script text-blue">{h.highlight}</span>
        </>
      )}
      {h.after && ` ${h.after}`}
    </Tag>
  );
}

// WP rich text (text-editor widget). Spacing follows the Hello Elementor theme defaults.
const RICH =
  "[&_p]:mb-[0.9rem] [&_p:last-child]:mb-0 [&_ul]:mb-[0.9rem] [&_ul]:list-disc [&_ul]:pl-10 [&_ul:last-child]:mb-0 [&_strong]:font-bold [&_h4]:mb-[0.9rem]";
export function Rich({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`${RICH} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

// Inline SVG icon from WP markup (trusted: our own CMS content).
export function Svg({ svg, className = "" }: { svg: string | null; className?: string }) {
  if (!svg) return null;
  return <span aria-hidden="true" className={`inline-flex [&_svg]:size-full ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function BoxTitle({ box, className = "" }: { box: IconBox; className?: string }) {
  const Tag = box.titleTag as "p";
  return <Tag className={className}>{box.title}</Tag>;
}

// Elementor boxed container: 1140px content with 10px padding (content starts at x=70 on a 1280 screen).
export const container = "mx-auto w-full max-w-[calc(var(--container-site)+20px)] px-2.5";
// Section headline: DM Sans 600, 45px desktop / 39px laptop+tablet; mobile size varies per section.
export const sectionTitle = "font-display font-semibold tracking-[-1px] text-[45px]/[1.5] max-xl:text-[39px]";

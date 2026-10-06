import type { CitySection, Page } from "@/lib/content";
import Breadcrumbs, { crumbsFrom } from "./Breadcrumbs";
import { box, Fallback, Html, Img, padVars, rich } from "./wp";

// Breadcrumb, h1, blue subheading, intro copy; image on the right (below on mobile).
export default function Hero({ s, page }: { s: CitySection; page: Page }) {
  const img = s.parts.find((p) => p.t === "img");
  const headings = s.parts.filter((p) => p.t === "h");
  return (
    <section style={padVars(s)} className="p-[10px]">
      <div className={`${box} grid items-center gap-[20px] md:grid-cols-2`}>
        <div className="flex flex-col gap-[20px] p-[var(--box,10px)]">
          {s.parts.some((p) => p.t === "crumbs") && (
            <Breadcrumbs items={crumbsFrom(page.jsonLd)} className="pl-[20px] text-[13px] text-muted" />
          )}
          <div className="flex flex-col gap-[20px] p-[10px]">
            {s.parts.map((p, i) =>
              p.t === "h" ? (
                <Html
                  key={i}
                  as={p.tag}
                  html={p.html}
                  className={
                    p === headings[0]
                      ? "font-inter text-[48px] leading-[1.2] font-black tracking-[-1px] text-white"
                      : "font-inter text-[28px] leading-[1.2] font-extrabold tracking-[-2px] text-link"
                  }
                />
              ) : p.t === "text" ? (
                <Html key={i} html={p.html} link={p.link} align={p.align} className={`text-[16px] ${rich}`} />
              ) : p.t === "crumbs" || p === img ? null : (
                <Fallback key={i} p={p} />
              ),
            )}
          </div>
        </div>
        {img && (
          <Img p={img} eager sizes="(min-width: 1200px) 560px, (min-width: 768px) 48vw, 95vw" className="h-auto w-full rounded-[10px]" />
        )}
      </div>
    </section>
  );
}

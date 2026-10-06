import type { CitySection } from "@/lib/content";
import { box, Fallback, Html, padVars, rich, Svg } from "./wp";

// "Why Choose Zoot As Your {City} …": intro copy + 3-column grid of icon boxes.
export default function WhyCards({ s }: { s: CitySection }) {
  const boxes = s.parts.filter((p) => p.t === "iconbox");
  return (
    <section style={padVars(s)} className="bg-ink-850 p-[var(--sec,60px_0px)]">
      <div className={`${box} flex flex-col gap-[24px] p-[var(--box,10px)]`}>
        {s.parts.map((p, i) =>
          p.t === "h" ? (
            <Html key={i} as={p.tag} html={p.html} align={p.align} className="font-inter text-[34px] leading-[1.2] font-extrabold tracking-[.6px] text-white" />
          ) : p.t === "text" ? (
            <Html key={i} html={p.html} link={p.link} align={p.align} className={`text-[16px] leading-[1.8] text-muted ${rich}`} />
          ) : p === boxes[0] ? (
            <div key={i} className="grid w-full gap-[20px] p-[var(--grid,10px)] md:grid-cols-3">
              {boxes.map((b, j) => (
                <div key={j} className="flex flex-col gap-[5px] rounded-[9px] border border-line-glow bg-ink-600 p-[20px]">
                  <Svg svg={b.svg} className="text-blue [&_svg]:size-[35px]" />
                  <div>
                    <Html as={b.tag} html={b.html} className="my-[16px] font-tight text-[16px] font-semibold text-white" />
                    <Html as="p" html={b.desc} link={b.link} className={`text-stat-label ${rich}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : p.t === "iconbox" ? null : (
            <Fallback key={i} p={p} />
          ),
        )}
      </div>
    </section>
  );
}

import type { CitySection } from "@/lib/content";
import { box, Fallback, Html, padVars, rich, Svg } from "./wp";

// "{City} Digital Marketing Services": 3-column grid of icon / h3 / copy cards.
export default function ServiceCards({ s }: { s: CitySection }) {
  return (
    <section style={padVars(s)} className="bg-ink-800 p-[var(--sec,60px_0px)]">
      <div className={`${box} flex flex-col gap-[24px] p-[var(--box,10px)]`}>
        {s.parts.map((p, i) =>
          p.t === "h" ? (
            <Html key={i} as={p.tag} html={p.html} align={p.align} className="font-inter text-[34px] leading-[1.2] font-extrabold tracking-[.6px] text-white" />
          ) : p.t === "text" ? (
            <Html key={i} html={p.html} link={p.link} align={p.align} className={`font-inter text-[16px] leading-[1.8] text-muted ${rich}`} />
          ) : p.t === "cards" ? (
            <div key={i} className="grid w-full gap-[24px] p-[var(--grid,10px)] md:grid-cols-3">
              {s.cards?.map((c, j) => (
                <div key={j} className="flex flex-col gap-[12px] rounded-[10px] border border-line-card bg-ink-600 p-[28px]">
                  {c.parts.map((x, k) =>
                    x.t === "icon" ? (
                      <div key={k} className="pb-[9.4px]">
                        <Svg svg={x.svg} className="flex size-[56px] items-center justify-center rounded-full border-[3px] border-band text-band [&_svg]:size-[25px]" />
                      </div>
                    ) : x.t === "h" ? (
                      <Html key={k} as={x.tag} html={x.html} align={x.align} className="font-inter text-[19px] leading-[1.5] font-bold tracking-[-1px] text-white" />
                    ) : x.t === "text" ? (
                      <Html key={k} html={x.html} link={x.link} align={x.align} className={`text-[15px] leading-[1.85] text-muted ${rich}`} />
                    ) : (
                      <Fallback key={k} p={x} />
                    ),
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Fallback key={i} p={p} />
          ),
        )}
      </div>
    </section>
  );
}

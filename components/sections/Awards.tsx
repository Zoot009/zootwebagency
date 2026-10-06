import type { CitySection } from "@/lib/content";
import { box, Fallback, Html, Img, padVars, rich } from "./wp";

// "Award-Winning … in {City}": two award cards (image, h3, copy), in the page's own order.
export default function Awards({ s }: { s: CitySection }) {
  return (
    <section style={padVars(s)} className="bg-ink-800 p-[var(--sec,60px_0px)]">
      <div className={`${box} flex flex-col gap-[24px] p-[var(--box,10px)]`}>
        {s.parts.map((p, i) =>
          p.t === "h" ? (
            <Html key={i} as={p.tag} html={p.html} align={p.align} className="font-inter text-[34px] leading-[1.2] font-extrabold tracking-[.6px] text-white" />
          ) : p.t === "cards" ? (
            <div key={i} className="grid w-full gap-x-[24px] p-[var(--grid,10px)] md:grid-cols-2">
              {s.cards?.map((c, j) => (
                <div key={j} className="flex flex-col items-start gap-[16px] rounded-[12px] border border-line-card bg-ink-600 p-[32px]">
                  {c.parts.map((x, k) =>
                    x.t === "img" ? (
                      <Img key={k} p={x} sizes="(min-width: 1140px) 472px, (min-width: 768px) 42vw, 85vw" className="h-auto w-full" />
                    ) : x.t === "h" ? (
                      <Html key={k} as={x.tag} html={x.html} align={x.align} className="font-inter text-[19px] leading-[1.2] font-bold tracking-[.6px] text-white" />
                    ) : x.t === "text" ? (
                      <Html key={k} html={x.html} link={x.link} align={x.align} className={`text-[15px] leading-[1.8] text-muted ${rich}`} />
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

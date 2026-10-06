import type { CitySection } from "@/lib/content";
import { box, Fallback, Html, Img, padVars, rich } from "./wp";

const metric = "flex items-center justify-center rounded-[8px] border border-line-card bg-ink-700 p-[16px]";

// "Our {City} Clients Get Results": two case cards, each photo + two metrics + labels + quote.
export default function CaseStudies({ s }: { s: CitySection }) {
  return (
    <section style={padVars(s)} className="bg-ink-900 p-[var(--sec,60px_0px)]">
      <div className={`${box} flex flex-col gap-[24px] p-[var(--box,10px)]`}>
        {s.parts.map((p, i) =>
          p.t === "h" ? (
            <Html key={i} as={p.tag} html={p.html} align={p.align} className="font-inter text-[34px] leading-[1.2] font-extrabold tracking-[.6px] text-white" />
          ) : p.t === "text" ? (
            <Html key={i} html={p.html} link={p.link} align={p.align} className={`font-inter text-[16px] leading-[1.8] text-muted ${rich}`} />
          ) : p.t === "cards" ? (
            <div key={i} className="grid w-full gap-[24px] p-[var(--grid,10px)] md:grid-cols-2">
              {s.cards?.map((c, j) => {
                const heads = c.parts.filter((x) => x.t === "h");
                const values = heads.slice(0, heads.length / 2), labels = heads.slice(heads.length / 2);
                return (
                  <div key={j} className="flex flex-col gap-[20px] rounded-[10px] border border-line-card bg-ink-700 p-[10px]">
                    {c.parts.map((x, k) =>
                      x.t === "img" ? (
                        <Img key={k} p={x} sizes="(min-width: 1140px) 516px, (min-width: 768px) 45vw, 90vw" className="h-auto w-full rounded-t-[8px]" />
                      ) : x === heads[0] ? (
                        <div key={k} className="flex flex-col gap-[10px] px-[24px] pt-[20px] pb-[24px]">
                          <div className="grid gap-x-[12px] p-[10px] md:grid-cols-2">
                            {values.map((v, n) => (
                              <div key={n} className={metric}>
                                <Html as={v.tag} html={v.html} align={v.align} className="max-w-full text-center font-tight text-[32px] leading-none font-black text-link" />
                              </div>
                            ))}
                          </div>
                          <div className="grid gap-x-[12px] p-[10px] md:grid-cols-2">
                            {labels.map((l, n) => (
                              <Html key={n} as={l.tag} html={l.html} align={l.align} className="text-center text-[12px] leading-none font-medium text-muted" />
                            ))}
                          </div>
                          {c.parts.filter((x) => x.t === "text").map((q, n) => (
                            <Html key={n} html={q.html} link={q.link} align={q.align} className={`leading-[1.7] text-muted ${rich}`} />
                          ))}
                        </div>
                      ) : x.t === "h" || x.t === "text" ? null : (
                        <Fallback key={k} p={x} />
                      ),
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Fallback key={i} p={p} />
          ),
        )}
      </div>
    </section>
  );
}

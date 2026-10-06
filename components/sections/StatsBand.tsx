import { Fragment } from "react";
import type { CitySection } from "@/lib/content";
import { Fallback, Html, Img, padVars } from "./wp";

// Blue band of stats (value, star row, label). Hubs built from layout A have 3 stats with
// dividers; layout B (service pages, some hubs) has 4 columns, full width unless the page boxes it.
export default function StatsBand({ s }: { s: CitySection }) {
  const cards = s.cards ?? [];
  const a = cards.length === 3;
  const grid = (
    <div className={a ? "mx-auto grid w-full max-w-[var(--width,1140px)] p-[var(--box,10px)] md:grid-cols-3" : "mx-auto grid max-w-[var(--width,none)] md:grid-cols-4"}>
      {cards.map((c, i) => (
        <div key={i} className={a ? "flex flex-col items-center gap-[4px] border-r border-white/25 p-[10px]" : "flex flex-col gap-[20px] p-[10px]"}>
          {c.parts.map((p, j) =>
            p.t === "h" ? (
              <Html
                key={j}
                as={p.tag}
                html={p.html}
                className={
                  j === 0
                    ? "text-center font-tight text-[44px] leading-none font-black text-white"
                    : a
                      ? "text-center font-inter text-[14px] leading-none font-semibold text-white/85"
                      : "text-center font-inter text-[15px] leading-none font-semibold text-muted"
                }
              />
            ) : p.t === "html" ? (
              <Html key={j} html={p.html} />
            ) : p.t === "img" ? (
              // Inline on WP, so it sits on a text line (adds the line's baseline space).
              <div key={j} className="text-center"><Img p={p} sizes="300px" className="inline-block h-auto max-w-full" /></div>
            ) : (
              <Fallback key={j} p={p} />
            ),
          )}
        </div>
      ))}
    </div>
  );
  return (
    <section style={padVars(s)} className={`bg-band ${a ? "p-[var(--sec,44px_24px)]" : "p-[var(--sec,50px_24px)]"}`}>
      {s.parts.map((p, i) => (p.t === "cards" ? <Fragment key={i}>{grid}</Fragment> : <Fallback key={i} p={p} />))}
    </section>
  );
}

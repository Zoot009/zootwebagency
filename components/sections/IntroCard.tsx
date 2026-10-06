import Image from "next/image";
import type { CitySection } from "@/lib/content";
import { box, Btn, Fallback, Html, padVars, rich } from "./wp";

// h2 + copy next to a photo CTA card. Layout A (hubs): card on the right with an h3.
// Layout B (service pages, some hubs): "FREE STRATEGY SESSION" pill card shown first; the copy
// stays first in the HTML (WP moves it with CSS order), so heading order is unchanged.
export default function IntroCard({ s }: { s: CitySection }) {
  const a = s.cards?.[0]?.parts[0]?.t === "h";
  return (
    <section style={padVars(s)} className="bg-ink-800 p-[var(--sec,60px_0px)]">
      <div className={`${box} grid gap-x-[40px] p-[var(--box,10px)] md:grid-cols-2`}>
        <div className={`flex flex-col gap-[20px] p-[10px] ${a ? "" : "order-last"}`}>
          {s.parts.map((p, i) =>
            p.t === "h" ? (
              <Html key={i} as={p.tag} html={p.html} align={p.align} className="font-inter text-[32px] leading-[1.2] font-extrabold tracking-[-2px] text-white" />
            ) : p.t === "text" ? (
              <Html key={i} html={p.html} link={p.link} align={p.align} className={`text-[16px] leading-[1.9] text-muted ${rich}`} />
            ) : p.t === "cards" ? null : (
              <Fallback key={i} p={p} />
            ),
          )}
        </div>
        {s.cards?.map((card, j) => {
          const firstText = card.parts.find((p) => p.t === "text");
          const btns = card.parts.filter((p) => p.t === "btn");
          const pill = !a && btns.length > 1 ? btns[0] : undefined;
          return (
            <div key={j} className={`relative flex flex-col items-center justify-center gap-[20px] overflow-hidden rounded-[10px] ${a ? "min-h-[380px] p-[40px]" : ""}`}>
              {card.bg && <Image src={card.bg} alt="" fill sizes="(min-width: 1140px) 540px, (min-width: 768px) 50vw, 100vw" className="object-cover" />}
              <div className={`absolute inset-0 bg-black ${a ? "opacity-70" : "opacity-67"}`} />
              {card.parts.map((p, i) =>
                p.t === "h" ? (
                  <Html key={i} as={p.tag} html={p.html} align={p.align} className="relative text-center font-inter text-[24px] leading-[1.5] font-extrabold tracking-[-1px] text-white" />
                ) : p.t === "text" ? (
                  <Html
                    key={i}
                    html={p.html}
                    link={p.link}
                    align={p.align}
                    className={`relative ${rich} ${
                      a ? "text-center text-[15px] leading-[1.7] text-card-text" : p === firstText ? "w-[91%] font-inter text-[19px] font-extrabold text-snow" : "w-[91%]"
                    }`}
                  />
                ) : p.t === "btn" ? (
                  <Btn
                    key={i}
                    p={p}
                    className={`relative leading-none font-extrabold tracking-[.3px] ${
                      a
                        ? "rounded-[6px] bg-blue px-[24px] py-[16px] text-[15px] text-white"
                        : p === pill
                          ? "rounded-[30px] border border-pill bg-pill-bg px-[26px] py-[18px] text-[13px] text-pill"
                          : "rounded-[6px] bg-blue px-[26px] py-[18px] text-[17px] text-white"
                    }`}
                  />
                ) : (
                  <div key={i} className="relative"><Fallback p={p} /></div>
                ),
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

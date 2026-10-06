import type { CitySection } from "@/lib/content";
import { box, Fallback, Headline, Html, links, padVars, rich } from "./wp";

const CARET = "M448 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48zM92.5 220.5l123 123c4.7 4.7 12.3 4.7 17 0l123-123c7.6-7.6 2.2-20.5-8.5-20.5H101c-10.7 0-16.1 12.9-8.5 20.5z";

// "Frequently Asked Questions": two columns of independent toggles. Native <details>, so the
// open/closed state each item has on WordPress needs no JS.
export default function Faq({ s }: { s: CitySection }) {
  const lists = s.parts.filter((p) => p.t === "faq");
  return (
    <section style={padVars(s)} className="bg-night-9 p-[var(--sec,0px_0px_30px)]">
      <div className={`${box} flex flex-col justify-center gap-[20px] p-[var(--box,60px_0px_0px)]`}>
        {s.parts.map((p, i) =>
          p.t === "headline" ? (
            <Headline key={i} p={p} plain="text-white" highlight="font-script text-blue" className="my-[5px] text-center font-display text-[45px] leading-[1.5] font-semibold tracking-[-1px] text-heading" />
          ) : p.t === "text" ? (
            <Html key={i} html={p.html} link={p.link} align={p.align} className={`mx-auto w-1/2 text-center ${rich}`} />
          ) : p.t === "faq" ? null : (
            <Fallback key={i} p={p} />
          ),
        )}
      </div>
      <div className={`${box} mt-[20px] grid gap-[20px] p-[var(--grid,10px)] md:grid-cols-2`}>
        {lists.map((list, i) => (
          <div key={i} className="p-[10px]">
            <div className="mb-[40px] flex flex-col gap-[10px]">
              {list.items.map((item, j) => (
                <details key={j} open={item.open} className="group rounded-[14px]">
                  {/* Like the live accordion, the caret sits over the end of the question rather than reserving space. */}
                  <summary className="relative block cursor-pointer list-none rounded-[11px_0_10px_0] border border-line-faq bg-faq-head-closed px-[30px] py-[20px] text-[16px] leading-[24px] font-bold text-faq-q group-open:bg-faq-head [&::-webkit-details-marker]:hidden">
                    {/* The live accordion marks each question role="heading" aria-level="3". */}
                    <span role="heading" aria-level={3} className="block pr-[10px]" dangerouslySetInnerHTML={{ __html: item.q }} />
                    <svg viewBox="0 0 448 512" aria-hidden="true" className="absolute top-1/2 right-[30px] size-[22px] -translate-y-1/2 fill-blue-2 group-open:fill-faq-icon"><path d={CARET} /></svg>
                  </summary>
                  <Html html={item.a} className={`rounded-[10px] p-[30px] text-[16px] leading-[24px] text-faq-a [&_p]:mb-[1em] [&_p:last-child]:mb-0 ${links}`} />
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { CitySection } from "@/lib/content";
import { Btn, Fallback, Html, padVars, rich } from "./wp";

// Blue "Ready to grow…" band: centered h2, copy, gradient button.
export default function CtaBand({ s }: { s: CitySection }) {
  return (
    <section style={padVars(s)} className="bg-band p-[var(--sec,70px_24px)]">
      <div className="mx-auto flex max-w-[var(--width,900px)] flex-col gap-[20px] p-[10px]">
        {s.parts.map((p, i) =>
          p.t === "h" ? (
            <Html key={i} as={p.tag} html={p.html} align={p.align} className="text-center font-inter text-[34px] leading-[1.2] font-extrabold tracking-[.6px] text-white" />
          ) : p.t === "text" ? (
            <Html key={i} html={p.html} link={p.link} align={p.align} className={`font-inter text-[16px] leading-[1.8] text-band-text ${rich}`} />
          ) : p.t === "btn" ? (
            <Btn key={i} p={p} className="self-center rounded-[6px] bg-linear-[134deg] from-blue from-27% to-cyan px-[26px] py-[18px] text-[17px] leading-none font-extrabold tracking-[.3px] text-white" />
          ) : (
            <Fallback key={i} p={p} />
          ),
        )}
      </div>
    </section>
  );
}

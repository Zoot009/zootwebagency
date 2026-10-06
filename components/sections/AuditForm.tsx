import type { CitySection } from "@/lib/content";
import { box, Fallback, Headline, padVars } from "./wp";

const field = "w-full rounded-[12px] bg-field pt-[12px] pr-[20px] pb-[11px] pl-[30px] text-white placeholder:text-white/60";

// "Get Your FREE … Audit" headline + the Elementor Pro audit form (same fields on every city page).
// TODO(team): WP handled submissions (admin-ajax); pick where this form posts before cutover.
export default function AuditForm({ s }: { s: CitySection }) {
  return (
    <section style={padVars(s)} className="p-[var(--sec,0px)]">
      <div className={`${box} flex flex-col justify-center gap-[20px] p-[var(--box,21px_0px_40px)]`}>
        {s.parts.map((p, i) =>
          p.t === "headline" ? (
            <Headline key={i} p={p} highlight="text-blue" className="mt-[38px] mb-[8px] text-center font-inter text-[38px] leading-[1.2] font-extrabold" />
          ) : p.t === "form" ? (
            <form key={i} method="post" name={p.name} aria-label={p.name} className="grid gap-[21px] px-[40px] pt-[10px] md:grid-cols-2">
              {p.fields.map((f) => (
                <div key={f.name} className={f.width === 100 ? "md:col-span-2" : ""}>
                  {f.label && <label htmlFor={f.id} className="block text-heading">{f.label}</label>}
                  {f.tag === "select" ? (
                    <div className="relative">
                      <select name={f.name} id={f.id} className={`${field} appearance-none`}>
                        {f.options?.map((o) => <option key={o}>{o}</option>)}
                      </select>
                      <svg aria-hidden="true" viewBox="0 0 571.4 571.4" className="pointer-events-none absolute top-1/2 right-[10px] size-[11px] -translate-y-1/2 fill-white">
                        <path d="M571 393Q571 407 561 418L311 668Q300 679 286 679T261 668L11 418Q0 407 0 393T11 368 36 357H536Q550 357 561 368T571 393Z" />
                      </svg>
                    </div>
                  ) : f.tag === "textarea" ? (
                    <textarea name={f.name} id={f.id} placeholder={f.placeholder ?? undefined} aria-label={f.label ? undefined : (f.placeholder ?? undefined)} className={field} />
                  ) : (
                    <input type={f.type ?? "text"} name={f.name} id={f.id} placeholder={f.placeholder ?? undefined} aria-label={f.label ? undefined : (f.placeholder ?? undefined)} className={field} />
                  )}
                </div>
              ))}
              <button type="submit" className="min-h-[59px] rounded-[12px] bg-linear-[134deg] from-blue from-27% to-cyan px-[30px] py-[15px] leading-none font-semibold tracking-[.3px] text-white md:col-span-2" dangerouslySetInnerHTML={{ __html: p.submit }} />
            </form>
          ) : (
            <Fallback key={i} p={p} />
          ),
        )}
      </div>
    </section>
  );
}

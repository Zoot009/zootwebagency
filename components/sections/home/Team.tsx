import Image from "next/image";
import type { HomeSection } from "@/lib/home";
import Slider from "../Slider";
import { Headline, Rich, container, hide, sectionTitle } from "../ui";

type S<K> = Extract<HomeSection, { kind: K }>;

export default function Team({ s }: { s: S<"team"> }) {
  return (
    <section className="border-t border-white/7 bg-night-2 py-[50px]">
      <div className={container}>
        <Headline h={s.title} className={`${sectionTitle} text-center max-md:text-left max-md:text-[32px]/[1.5]`} />
        <Rich
          html={s.intro}
          className="mx-auto mt-9 max-w-[958px] text-center text-[15px]/[20px] text-heading max-md:text-left xl:text-sm/[2.1]"
        />
        <div className="mt-9 grid grid-cols-2 gap-5 md:grid-cols-3">
          {s.leads.map((p) => {
            const Name = p.nameTag as "h3";
            return (
              <div
                key={p.name}
                className={`flex gap-5 rounded-[15px] border border-blue/18 p-2.5 shadow-[0_0_10px_rgba(0,0,0,0.5)] max-md:flex-col max-md:gap-3 ${hide(p.hidden)}`}
              >
                <Image src={p.image.src} alt={p.image.alt} width={100} height={100} className="size-[100px] shrink-0 rounded-full object-cover max-md:size-[54px]" />
                <div className="pt-2.5 max-md:pt-0">
                  <Name className="font-display text-xl/[30px] font-semibold tracking-[-1px] max-md:text-base/5">{p.name}</Name>
                  <p className="mt-5 text-role max-md:mt-1">{p.role}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 rounded-[15px] border border-blue/18 px-5 py-6 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          <Slider label="Team" perView={[2, 4, 6]} gap={45}>
            {s.members.map((m) => (
              <figure key={m.caption + m.image.src} className="text-center">
                <Image src={m.image.src} alt={m.image.alt} width={150} height={150} className="mx-auto aspect-square w-full max-w-[145px] rounded-full object-cover" />
                <figcaption className="mt-2.5 text-white">{m.caption}</figcaption>
              </figure>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { HomeSection } from "@/lib/home";
import { BoxTitle, Headline, Rich, container, hide } from "../ui";
import VideoEmbed from "./VideoEmbed";

type S<K> = Extract<HomeSection, { kind: K }>;

export function Hero({ s }: { s: S<"hero"> }) {
  return (
    <section className="bg-night pb-10 md:pt-[50px]">
      <div className={`${container} grid items-center gap-5 md:grid-cols-2`}>
        <div className="flex flex-col max-md:px-[15px] max-md:pt-10">
          <Headline
            h={s.title}
            className="font-display text-[26px]/[1.4] font-semibold tracking-[-1px] md:text-[39px]/[1.2] xl:text-[45px]/[1.2]"
          />
          <Rich html={s.subtitle} className="mt-1.5" />
          <Image
            src={s.banner.src}
            alt={s.banner.alt}
            width={s.banner.width}
            height={s.banner.height}
            className={`mt-5 h-auto w-full ${hide(s.banner.hidden)}`}
          />
          <div className={`mt-11 grid grid-cols-3 items-center gap-5 px-2.5 max-md:mt-6 ${hide(s.badgesHidden)}`}>
            {s.badges.map((b) => (
              <Image key={b.src} src={b.src} alt={b.alt} width={b.width} height={b.height} className="h-auto w-full" />
            ))}
          </div>
          <Rich html={s.intro} className="mt-11 text-[15px]/[20px] max-md:mt-6 xl:text-sm/[2.1]" />
          <div className="mt-11 ml-2.5 flex items-center gap-[29px] rounded-xl bg-hero-bar px-[18px] py-2.5 max-md:mt-6 max-md:flex-col max-md:items-stretch max-md:gap-2.5 max-md:p-3">
            <input
              type="search"
              aria-label="Search"
              placeholder={s.placeholder}
              className="h-14 min-w-0 flex-1 rounded-xl bg-hero-input pt-3 pr-5 pb-[11px] pl-[30px] text-heading placeholder:text-heading focus:outline-none"
            />
            <Link
              href={s.button.href}
              className="rounded-xl bg-[linear-gradient(180deg,var(--color-report)_0%,var(--color-blue-3)_100%)] px-[30px] py-[15px] text-center text-sm/none font-semibold tracking-[0.3px] text-white"
            >
              {s.button.text}
            </Link>
          </div>
        </div>
        <Image
          src={s.image.src}
          alt={s.image.alt}
          width={s.image.width}
          height={s.image.height}
          preload
          className={`mx-auto h-auto w-full max-w-[547px] rounded-full ${hide(s.image.hidden)}`}
        />
      </div>
    </section>
  );
}

export function Stats({ s }: { s: S<"stats"> }) {
  return (
    <section className="border-y border-heading/14 bg-night px-2.5">
      <div className={`${container} grid grid-cols-4 divide-x divide-heading/14`}>
        {s.items.map((it) => (
          <div key={it.label} className="pt-[42px] pb-3 text-center max-md:px-1 max-md:py-3">
            <p className="font-tight text-[31px]/[29.4px] font-extrabold tracking-[0.8px] text-stat max-md:text-[10.5px]/[1.15]">{it.value}</p>
            <p className="mt-[31px] text-base/[29.4px] font-semibold text-stat-label max-md:mt-0 max-md:text-[11px]/[1.3]">{it.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const card = "rounded-md border border-white/10 px-[19px] py-5";
const cardTitle = "text-[21px]/[29.4px] font-semibold text-body max-xl:text-lg/[29.4px] max-xl:tracking-[0.2px]";
const cardText = "mt-3 text-[15px]/[21px] max-xl:text-sm/[21px]";

export function WhatAre({ s }: { s: S<"whatAre"> }) {
  return (
    <section className="border-t border-white/7 bg-night-2 py-[50px]">
      <div className={`${container} grid gap-8 md:grid-cols-2 md:gap-5`}>
        <div className="flex flex-col gap-10">
          <Image src={s.image.src} alt={s.image.alt} width={s.image.width} height={s.image.height} className={`h-auto w-full ${hide(s.image.hidden)}`} />
          <div className={card}>
            <BoxTitle box={s.cardA} className={cardTitle} />
            <Rich html={s.cardA.html} className={cardText} />
          </div>
        </div>
        <div className="flex flex-col gap-10 md:pt-[30px]">
          <Headline h={s.title} className="font-sans text-[32px]/[1.2] font-semibold tracking-[-2px] md:text-[39px]/[1.2] xl:text-[45px]/[1.2]" />
          <Rich html={s.body} className="text-[15px]/[20px] xl:text-sm/[2.1]" />
          <div className={`${card} mt-auto`}>
            <BoxTitle box={s.cardB} className={cardTitle} />
            <Rich html={s.cardB.html} className={cardText} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyChoose({ s }: { s: S<"whyChoose"> }) {
  return (
    <section className="bg-night-3 py-10">
      <div className={`${container} grid items-start gap-10 md:grid-cols-2 md:gap-[30px]`}>
        <div className="flex flex-col gap-5 md:px-2.5">
          <Headline h={s.kicker} className="font-display text-[32px]/[50px] font-semibold tracking-[-1px] md:text-[39px]/[50px] xl:text-[40px]/[50px]" />
          <Rich html={s.body} className="[&_h4]:mb-[30px]" />
        </div>
        <VideoEmbed youtube={s.video.youtube} overlay={s.video.overlay} />
      </div>
    </section>
  );
}


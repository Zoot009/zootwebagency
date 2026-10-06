"use client";

import { useState } from "react";
import type { IconBox } from "@/lib/home";
import { BoxTitle, Rich, Svg } from "../ui";

// Elementor nested tabs: icon-only tab buttons, one card per tab.
// Tabs 3–4 used icon fonts on WP (ionicons chatbubbles, phosphor star-four); drawn here instead.
const FALLBACK: Record<string, string> = {
  "ion-ios-chatbubbles":
    '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M60 40h300a40 40 0 0 1 40 40v180a40 40 0 0 1-40 40H180l-90 70v-70H60a40 40 0 0 1-40-40V80a40 40 0 0 1 40-40zm380 120h12a40 40 0 0 1 40 40v170a40 40 0 0 1-40 40h-30v60l-80-60H220a40 40 0 0 1-40-40v-30h180a80 80 0 0 0 80-80z"/></svg>',
  "phlight-star-four":
    '<svg viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="8"><path d="M128 24c8 56 48 96 104 104-56 8-96 48-104 104-8-56-48-96-104-104 56-8 96-48 104-104z"/></svg>',
};
const iconFor = (t: { icon: string | null; iconClass: string | null }) =>
  t.icon ?? Object.entries(FALLBACK).find(([k]) => t.iconClass?.includes(k))?.[1] ?? null;

export default function AiTabs({ tabs }: { tabs: { icon: string | null; iconClass: string | null; items: IconBox[] }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-[5px]">
        {tabs.map((t, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={t.items[0]?.title}
            onClick={() => setActive(i)}
            className={`rounded-[9px] border px-[35px] py-[15px] text-blue-3 ${active === i ? "border-blue-2" : "border-white/9"}`}
          >
            <Svg svg={iconFor(t)} className="size-[27px]" />
          </button>
        ))}
      </div>
      {tabs.map((t, i) =>
        t.items.map((b) => (
          <div
            key={b.title}
            role="tabpanel"
            hidden={active !== i}
            className="mt-2.5 max-w-[427px] rounded-[10px] border border-white/27 p-2.5 shadow-[16px_16px_0_0_var(--color-tab-shadow)]"
          >
            <div className="flex gap-4 px-5 py-2.5 max-md:flex-col">
              <Svg svg={b.icon} className="size-[38px] shrink-0 text-blue-3" />
              <div>
                <BoxTitle box={b} className="font-tight text-[22px]/[29.4px] font-semibold tracking-[1.3px] text-body" />
                <Rich html={b.html} className="mt-5" />
              </div>
            </div>
          </div>
        )),
      )}
    </div>
  );
}

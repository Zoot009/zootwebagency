"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

// Native scroll-snap track (swipe/scroll works without JS). JS only adds the live site's
// autoplay (paused on hover/focus, off for reduced motion) and one dot per slide, like the live
// slider. Near the end several slides share one view, so a chosen dot stays chosen there.
export default function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const goTo = useRef<(i: number) => void>(() => {});
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  useEffect(() => {
    const t = track.current;
    if (!t || t.children.length < 2) return;
    const slide = (i: number) => t.children[i] as HTMLElement;
    let current = 0, busy = false, idle = 0;
    const settle = () => { busy = false; };
    const go = (i: number) => {
      current = i;
      setActive(i);
      busy = true; // ignore our own smooth-scroll events until it settles
      clearTimeout(idle);
      idle = window.setTimeout(settle, 1200);
      t.scrollTo({ left: slide(i).offsetLeft, behavior: "smooth" });
    };
    const onScroll = () => {
      if (busy) return;
      current = Math.round(t.scrollLeft / (slide(1).offsetLeft - slide(0).offsetLeft));
      setActive(current);
    };
    goTo.current = go;
    t.addEventListener("scroll", onScroll, { passive: true });
    t.addEventListener("scrollend", settle);
    const timer = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? undefined
      : setInterval(() => paused.current || go((current + 1) % t.children.length), 3000);
    return () => {
      t.removeEventListener("scroll", onScroll);
      t.removeEventListener("scrollend", settle);
      clearInterval(timer);
      clearTimeout(idle);
    };
  }, []);

  const pause = () => { paused.current = true; };
  const resume = () => { paused.current = false; };
  return (
    <div className="relative" onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur={resume}>
      <div
        ref={track}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="relative flex snap-x snap-mandatory items-start gap-[10px] overflow-x-auto [scrollbar-width:none] lg:gap-[30px] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="absolute inset-x-0 -bottom-[50px] flex h-[16px] items-center justify-center gap-[12px]">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active || undefined}
            onClick={() => goTo.current(i)}
            className={`rounded-full ${i === active ? "size-[16px] scale-120 bg-dot-active" : "size-[12px] bg-dot"}`}
          />
        ))}
      </div>
    </div>
  );
}

// Horizontal slider without JS: CSS scroll-snap, N slides per view (mobile / ≥768 / ≥1025).
// ponytail: no autoplay or dots (WP's Swiper had both); add a small client wrapper if that's wanted.
export default function Slider({
  children,
  perView: [m, t, d],
  gap,
  className = "",
  label,
}: {
  children: React.ReactNode[];
  perView: [number, number, number];
  gap: number;
  className?: string;
  label: string;
}) {
  return (
    <ul
      aria-label={label}
      style={{ "--m": m, "--t": t, "--d": d, "--gap": `${gap}px` } as React.CSSProperties}
      className={`flex snap-x snap-mandatory gap-(--gap) overflow-x-auto [scrollbar-width:none] [&>li]:shrink-0 [&>li]:snap-start [&>li]:basis-[calc((100%-(var(--m)-1)*var(--gap))/var(--m))] md:[&>li]:basis-[calc((100%-(var(--t)-1)*var(--gap))/var(--t))] lg:[&>li]:basis-[calc((100%-(var(--d)-1)*var(--gap))/var(--d))] ${className}`}
    >
      {children.map((c, i) => (
        <li key={i}>{c}</li>
      ))}
    </ul>
  );
}

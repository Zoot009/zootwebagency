import type { CSSProperties } from "react";
import type { CitySection } from "@/lib/content";
import Carousel from "./Carousel";
import { box, Fallback, Headline, Html, padVars } from "./wp";

// Icons from the ElementsKit testimonial widget markup.
const STAR = "M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z";
const QUOTE = "M15.301 10.724c0-4.183-3.402-7.584-7.584-7.584s-7.591 3.408-7.591 7.591 3.402 7.591 7.591 7.591c0.504 0 1.014-0.050 1.518-0.157-0.876 3.968-2.759 7.257-3.811 9.077-0.277 0.479-0.491 0.863-0.636 1.153-0.126 0.265-0.397 0.819 0.013 1.184 0.132 0.12 0.283 0.17 0.435 0.17 0.328 0 0.687-0.233 0.989-0.422 0.409-0.258 0.989-0.674 1.997-1.417l0.044-0.038c1.764-1.581 3.232-3.433 4.353-5.499 0.907-1.669 1.606-3.49 2.066-5.411 0.743-3.093 0.661-5.55 0.617-6.236v0zM13.569 16.69c-0.983 4.113-3.017 7.578-6.041 10.293-0.258 0.189-0.661 0.479-1.052 0.762 1.165-2.035 3.295-5.764 4.088-10.293l0.17-0.97-0.932 0.321c-0.68 0.239-1.38 0.353-2.079 0.353-3.54 0-6.425-2.879-6.425-6.425s2.872-6.431 6.419-6.431c3.54 0 6.425 2.872 6.425 6.419v0.044c0 0.006 0 0.025 0 0.044 0.050 0.643 0.126 2.954-0.573 5.883zM31.968 10.737v0c0-4.189-3.402-7.591-7.584-7.591s-7.584 3.402-7.584 7.584 3.402 7.584 7.584 7.584c0.504 0 1.014-0.050 1.518-0.157-0.876 3.968-2.759 7.257-3.811 9.077-0.277 0.479-0.491 0.863-0.636 1.153-0.126 0.265-0.397 0.819 0.013 1.184 0.132 0.12 0.283 0.17 0.435 0.17 0.328 0 0.687-0.233 0.995-0.416 0.409-0.258 0.989-0.674 1.997-1.417l0.044-0.038c1.764-1.581 3.232-3.433 4.353-5.499 0.907-1.669 1.606-3.49 2.066-5.411 0.743-3.087 0.661-5.543 0.611-6.224zM30.23 16.69c-0.983 4.12-3.017 7.578-6.041 10.299-0.258 0.189-0.661 0.479-1.052 0.762 1.165-2.035 3.294-5.764 4.088-10.293l0.17-0.97-0.926 0.315c-0.68 0.239-1.38 0.353-2.079 0.353-3.54 0-6.425-2.879-6.425-6.425 0-3.54 2.879-6.425 6.425-6.425 3.54 0 6.425 2.872 6.425 6.419v0.044c0 0.006 0 0.025 0 0.044 0.038 0.636 0.12 2.948-0.586 5.877z";

// "But Don't Take Our Word For It": review cards, 3/2/1 per view like the live slider.
export default function Testimonials({ s }: { s: CitySection }) {
  return (
    <section style={padVars(s)} className="bg-night-8 p-[var(--sec,80px_15px)]">
      <div className={box}>
        {s.parts.map((p, i) =>
          p.t === "headline" ? (
            <Headline key={i} p={p} highlight="text-blue" className="mt-[36px] mb-[20px] text-center font-inter text-[36px] leading-[1.2] font-extrabold" />
          ) : p.t === "testimonials" ? (
            <Carousel key={i} label="Testimonials">
              {p.items.map((t, j) => (
                <div key={j} style={{ "--mh": `${p.minHeight}px`, "--tpad": p.pad } as CSSProperties} className="relative shrink-0 basis-full snap-start rounded-[10px] border border-line-quote bg-testimonial p-[var(--tpad)] md:basis-[calc((100%-10px)/2)] lg:basis-[calc((100%-60px)/3)]">
                  <ul className="flex gap-[8px]">
                    {Array.from({ length: t.stars }, (_, n) => (
                      <li key={n} className="h-[29.4px] pt-[6px]">
                        <svg viewBox="0 0 576 512" aria-hidden="true" className="size-[14px] fill-star-quote"><path d={STAR} /></svg>
                      </li>
                    ))}
                  </ul>
                  <svg viewBox="0 0 32 32" aria-hidden="true" className="absolute right-[30px] bottom-[30px] size-[48px] fill-watermark"><path d={QUOTE} /></svg>
                  <Html html={t.html} className="relative mb-[30px] min-h-(--mh) leading-[24px] text-white lg:mb-0 [&_p]:mb-[40px]" />
                  <Html as="strong" html={t.name} className="block text-[18px] leading-none font-bold text-name" />
                </div>
              ))}
            </Carousel>
          ) : (
            <Fallback key={i} p={p} />
          ),
        )}
      </div>
    </section>
  );
}

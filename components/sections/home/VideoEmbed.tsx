"use client";

import Image from "next/image";
import { useState } from "react";

// Elementor video widget with image overlay: the YouTube player loads only after a click.
export default function VideoEmbed({ youtube, overlay }: { youtube: string; overlay: string | null }) {
  const [playing, setPlaying] = useState(false);
  const id = youtube.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1];
  return (
    <div className="relative aspect-video overflow-hidden rounded-[13px] bg-black shadow-[0_0_10px_rgba(0,0,0,0.5)]">
      {playing && id ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title="YouTube video player"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label="Play video" className="group absolute inset-0 size-full cursor-pointer">
          {overlay && <Image src={overlay} alt="" fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />}
          <svg viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 size-[100px] -translate-1/2 text-blue transition group-hover:scale-110" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
            <path d="M40 30v40l32-20z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}

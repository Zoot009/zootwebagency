"use client";

import { useRouter } from "next/navigation";

// "Get Report" bar (Services menu, homepage hero). Same behavior as WP's zootGoContact():
// remember the site for the quote form, then go to the contact page.
export default function GetReport({ placeholder, className = "" }: { placeholder: string; className?: string }) {
  const router = useRouter();
  return (
    <form
      noValidate
      className={`flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/6 p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-[10px] ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const site = String(new FormData(e.currentTarget).get("site") ?? "").trim();
        if (!site) return alert("Please enter your website");
        try {
          localStorage.setItem("zootReportSite", site);
        } catch {}
        router.push("/contact/");
      }}
    >
      <input
        name="site"
        type="url"
        aria-label="Website"
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-white/18 bg-white/92 p-3.5 text-base/[1.2] text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-blue focus:shadow-[0_0_0_4px_rgb(0_138_252/0.25),inset_0_1px_0_rgba(255,255,255,0.6)]"
      />
      <button className="btn px-6 py-3.5 whitespace-nowrap shadow-[0_10px_18px_rgba(0,0,0,0.28)] transition hover:-translate-y-px hover:brightness-107 hover:shadow-[0_14px_24px_rgba(0,0,0,0.32)] active:translate-y-px active:scale-99">
        Get Report
      </button>
    </form>
  );
}

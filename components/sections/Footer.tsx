import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "./icons";

// Site footer (WP Elementor footer template 30). Copy, links and odd markup (emoji in <font size=5>, href="#") match WP.

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-block rounded-xl bg-[radial-gradient(circle_at_center,transparent_14%,color-mix(in_srgb,var(--color-blue)_38%,transparent)_100%)] px-4 py-1.5">
      <p className="font-display text-[19px]/[1.3] font-bold tracking-[-0.5px] text-heading">{children}</p>
    </div>
  );
}

// Emoji list item: icon-list widget with linked text ("#" on WP).
function EmojiItem({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <li>
      <a href="#" className="text-[15px] tracking-[-0.1px] text-heading hover:text-blue-2 max-md:text-[13px]">
        <span className="text-2xl">{emoji}</span> &nbsp;&nbsp; {children}
      </a>
    </li>
  );
}

const social = [
  ["Youtube", "https://www.youtube.com/@ZootDigitalMarketing"],
  ["Twitter", "#"],
  ["Instagram", "https://www.instagram.com/zootdigitalmarketing/"],
  ["LinkedIn", "https://www.linkedin.com/company/zootdigital/"],
];

export default function Footer() {
  return (
    <footer className="mt-[30px] bg-[url(/uploads/2025/08/BG-013.jpg)] bg-cover bg-top bg-no-repeat pb-3.5 lg:pt-[98px] xl:mt-10">
      <div className="mx-auto flex max-w-footer flex-wrap justify-between">
        <div className="w-full p-2.5 lg:w-[45%]">
          <p className="text-white md:max-lg:text-center">HELLO! WE&#039;RE LISTENING</p>
          <p className="mt-2.5 font-sans text-[48px]/[1] font-semibold tracking-[-2.5px] text-white md:text-[70px]/[0.9] md:max-lg:text-center lg:text-[80px]/[0.9] lg:tracking-[-3px] xl:text-[100px]/[0.9]">
            Let&#039;s talk about{" "}
            <span className="block pb-[30px] bg-[linear-gradient(165deg,var(--color-blue-2)_0%,var(--color-cyan)_100%)] bg-clip-text text-transparent">
              your project
            </span>
          </p>
          <Link href="/contact-zoot-web-agency/" className="mt-5 inline-flex items-center gap-2 text-white hover:text-white">
            SOUND GOOD? LET&#039;S CONNECT!
            <ArrowRight className="size-6" />
          </Link>
        </div>

        <div className="flex w-full flex-wrap justify-between gap-y-10 p-2.5 lg:w-1/2">
          <div className="w-full p-2.5 md:w-[47%]">
            <Pill>Connect with us</Pill>
            <ul className="space-y-2">
              <EmojiItem emoji="📧">contact@zootdigitalseo.com</EmojiItem>
              <EmojiItem emoji="💬">+919082729185</EmojiItem>
            </ul>
          </div>
          <div className="w-full p-2.5 md:w-[52%]">
            <Pill>Address</Pill>
            <div className="flex gap-4 max-md:flex-col max-md:gap-2">
              <MapPin className="size-6 shrink-0 text-footer-icon" />
              <p className="text-footer-text">
                U Wing, 3069, 3rd Floor, Janta Market Rd, opposite APMC Fruits and Vegetable Market, Sector 25, Vashi, Navi
                Mumbai, Maharashtra 400703
              </p>
            </div>
            <ul className="mt-5">
              <EmojiItem emoji="🕒">Monday → Sunday 10am to 7pm</EmojiItem>
            </ul>
          </div>
          <div className="w-full p-2.5 md:w-[47%]">
            <Pill> Join our newsletter</Pill>
            {/* TODO(forms): WP posts this Elementor Pro form to admin-ajax. Pending the forms decision. */}
            <form method="post" name="New Form" aria-label="New Form" className="flex items-end">
              <input
                type="email"
                name="form_fields[email]"
                placeholder="Email Address"
                required
                aria-label="Email Address"
                className="min-w-0 flex-1 border-b border-white bg-transparent pt-3 pr-5 pb-[11px] pl-[30px] text-white placeholder:text-white/70 focus:outline-none"
              />
              <button type="submit" className="btn h-10 w-[60px] rounded-none p-0 text-white">
                <ArrowRight className="size-4" />
                <span className="sr-only">Submit</span>
              </button>
            </form>
          </div>
          <div className="w-full p-2.5 md:w-[47%]">
            <Pill>Follow us</Pill>
            <ul className="grid gap-x-0 md:grid-cols-2">
              {social.map(([label, href]) => (
                <li key={label} className="py-1.5 pl-1.5 max-md:py-3 max-md:pl-[30px]">
                  <a href={href} aria-label={label} className="text-heading hover:text-lime">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Per-page "footer links" block (e.g. Digital Marketing Cities) sits here on WP. Pending importer support. */}
        <div className="mt-[50px] w-full border-t border-line" />

        <div className="mt-[50px] flex w-full flex-wrap items-center justify-between border-t border-line px-2.5 pt-2.5 max-md:flex-col max-md:pt-5">
          <Link href="/">
            <Image
              src="/uploads/2025/08/Zoot-Digital-logo-white.png"
              alt="zoot web agency"
              width={400}
              height={200}
              sizes="(max-width: 400px) 100vw, 400px"
              className="w-[170px] md:w-[134px] lg:w-[147px] xl:w-[149px]"
            />
          </Link>
          <p className="text-[15px] text-white max-md:mt-5 max-md:w-full max-md:text-right">Copyright ©2026</p>
        </div>
      </div>
    </footer>
  );
}

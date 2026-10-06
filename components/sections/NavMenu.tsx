"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import GetReport from "./GetReport";
import { Building, CalendarAlt, CalendarFull, Caret, CartArrowDown, Contacts, DotCircle, Hamburger, Hashtag, Speaker } from "./icons";

// Main menu (WP "menu-1" + ElementsKit mega menus 2406, 2276, 12566). Copy and links match WordPress.
// Desktop (≥1025px): dropdowns open on hover/focus. Tablet/mobile: off-canvas panel, dropdowns open on the caret.

type Col = { title: string; Icon?: (p: { className?: string }) => React.ReactNode; links: [string, string][] };
const S = "/digital-marketing-services";
const serviceCols: Col[][] = [
  [
    {
      title: "Digital Marketing",
      Icon: Speaker,
      links: [
        ["GBP Optimization", `${S}/google-business-profile-optimization/`],
        ["Web Design Services", `${S}/website-design/`],
        ["Local Citation Building", `${S}/local-citation-building/`],
        ["Link Building", `${S}/link-building/`],
        ["Local SEO Keywords Research", `${S}/keyword-research-strategy/`],
        ["On-Page Optimization", `${S}/on-page-seo/`],
        ["Technical SEO Optimization", `${S}/technical-seo-optimization/`],
        ["Local SEO Content Writing", `${S}/seo-content-writing/`],
        ["Local Ads", `${S}/google-ads-management/`],
        ["Search Engine Marketing (SEM)", `${S}/search-engine-marketing-sem/`],
        ["Email Marketing Services", `${S}/email-marketing-services/`],
        ["AI SEO Services", `${S}/ai-seo-services/`],
        ["Franchise Digital Marketing", `${S}/franchise-digital-marketing/`],
      ],
    },
  ],
  [
    {
      title: "Pay Per Click (PPC) Marketing",
      links: [
        ["Google Ads Management", `${S}/google-ads-management/`],
        ["YouTube Ads Management", `${S}/youtube-ads-management/`],
      ],
    },
    {
      title: "eCommerce Marketing",
      Icon: CartArrowDown,
      links: [
        ["eCommerce SEO", `${S}/ecommerce-seo/`],
        ["eCommerce Optimization", `${S}/ecommerce-optimization/`],
        ["Shopify SEO", `${S}/shopify-seo/`],
        ["Shopify Web Design", `${S}/shopify-web-design-services/`],
      ],
    },
  ],
  [
    {
      title: "Social Media Marketing",
      Icon: Hashtag,
      links: [
        ["Social Media Brand Management", `${S}/social-media-brand-management/`],
        ["Franchise Social Media", `${S}/franchise-social-media/`],
        ["Enterprise Social Media", `${S}/enterprise-social-media/`],
        ["Social Media Management", `${S}/social-media-management/`],
      ],
    },
  ],
];

function ServicesPanel() {
  return (
    <div className="flex flex-col gap-8 bg-menu px-5 py-[30px] lg:flex-row lg:gap-0 lg:rounded-xl lg:border lg:border-white/10 lg:px-[35px]">
      <div className="flex flex-col gap-5 rounded-[19px] bg-menu-card px-5 pt-[30px] pb-10 shadow-[0_0_10px_rgba(0,0,0,0.5)] lg:w-[410px] lg:shrink-0 lg:self-start">
        <Link
          href="#"
          className="flex items-center gap-4 border-2 border-navy-2 bg-heading px-[30px] py-3.5 font-tight text-lg font-semibold tracking-[0.8px] text-navy-2 hover:bg-menu-hover hover:text-white"
        >
          <Building className="h-[38px] w-[33px] shrink-0" />
          Zoot For Enterprise Teams
        </Link>
        <Link
          href="/free-consultation-web-design/"
          className="flex items-center gap-4 border-2 border-white bg-navy px-2.5 py-3.5 font-tight text-lg font-semibold tracking-[0.8px] text-white hover:bg-menu-hover hover:text-navy"
        >
          <CalendarAlt className="h-[41px] w-[36px] shrink-0" />
          Schedule Free Consultation
        </Link>
        <GetReport placeholder="Enter your website" className="mt-2.5" />
      </div>
      {serviceCols.map((col, i) => (
        <div key={i} className="flex flex-col gap-6 lg:flex-1 lg:pl-5">
          {col.map(({ title, Icon, links }) => (
            <div key={title}>
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-menu-icon text-white ring-2 ring-white">
                  {Icon && <Icon className="size-3.5" />}
                </span>
                <p className="font-tight text-[17px] leading-[1.7] font-semibold tracking-[1.3px] text-menu-title">{title}</p>
              </div>
              <ul className="mt-2 w-[88%] pl-[35px]">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="block py-1 text-menu-link hover:text-blue-3">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CompanyPanel() {
  return (
    <div className="flex flex-col bg-menu md:flex-row">
      <div className="p-5 md:w-1/3 lg:px-[50px] lg:py-[45px]">
        <p className="font-tight text-[35px] leading-[51px] tracking-[-0.4px] text-menu-lede [word-spacing:5px]">
          Simplifying <br />SEO services<br /> for a better enhanced website.
        </p>
      </div>
      <ul className="flex flex-col justify-center border-l-3 border-menu-muted p-[30px] md:w-1/3 md:p-5 lg:pl-[60px]">
        {[
          ["About Us", "/digital-marketing-agency-about/"],
          ["Why Us", "/why-us/"],
          ["Careers", "/career-at-digital-marketing-agency/"],
        ].map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-base font-semibold text-menu-muted hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="bg-menu-partners p-[30px] md:w-1/3 lg:px-[60px] lg:py-[60px]">
        <p className="mb-4 font-tight text-xl font-bold text-black">Brand Partners</p>
        <ul>
          {["Similar Agency", "Zoot Digital SEO", "X Seo services", "Rank Business AI"].map((name) => (
            <li key={name} className="flex items-center gap-2 text-base font-semibold text-black">
              <DotCircle className="size-3.5 text-navy-2" />
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ContactPanel() {
  const items = [
    { title: "Contact Us", text: "Reach Out to Our team directly", href: "/contact-zoot-web-agency/", Icon: Contacts },
    { title: "Book a Free Consultation", text: "Schedule a strategy call with our experts", href: "/free-consultation-web-design/", Icon: CalendarFull },
  ];
  return (
    <div className="flex flex-col gap-[42px] rounded-[7px] bg-menu-contact pt-[37px] pr-0 pb-[25px] pl-5 lg:w-[372px]">
      {items.map(({ title, text, href, Icon }) => (
        <div key={href} className="flex gap-4">
          <Link href={href} tabIndex={-1} aria-label={title} className="mt-1 grid size-7 shrink-0 place-items-center rounded-sm bg-blue text-white">
            <Icon className="size-3.5" />
          </Link>
          <div>
            <p className="font-poppins text-base font-medium text-white">
              <Link href={href} className="text-white">
                {title}
              </Link>
            </p>
            <p className="text-body">{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const items = [
  { label: "Services", href: "/digital-marketing-services/", Panel: ServicesPanel, wide: true },
  { label: "Company", href: "#", Panel: CompanyPanel, wide: true },
  { label: "Results", href: "/seo-case-study/" },
  { label: "Contact Us", href: "/contact/", Panel: ContactPanel },
];

const trim = (p: string) => p.replace(/\/$/, "");

export default function NavMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // off-canvas panel (≤1024px)
  const [sub, setSub] = useState<string | null>(null); // open dropdown in the off-canvas panel
  const close = () => {
    setOpen(false);
    setSub(null);
    (document.activeElement as HTMLElement | null)?.blur(); // drop :focus-within so desktop dropdowns close
  };

  return (
    <nav aria-label="Main" className="lg:flex-1 lg:self-stretch">
      <button
        type="button"
        aria-label="hamburger-icon"
        aria-expanded={open}
        aria-controls="main-menu"
        onClick={() => setOpen(true)}
        className="btn h-[37px] w-[45px] rounded-[3px] p-2 text-navy-2 lg:hidden"
      >
        <Hamburger className="size-[15px]" />
      </button>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={close} />}
      <div
        id="main-menu"
        onClick={(e) => (e.target as Element).closest("a") && close()}
        className={`fixed inset-y-0 left-0 z-50 w-4/5 overflow-y-auto bg-navy transition-transform duration-300 md:w-full md:bg-white lg:static lg:flex lg:h-full lg:w-auto lg:translate-none lg:justify-center lg:pl-[190px] xl:justify-start xl:pl-[216px] lg:overflow-visible lg:bg-transparent lg:transition-none ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-end py-2.5 lg:hidden">
          <button type="button" onClick={close} className="btn m-3 w-[45px] rounded-[3px] p-2 text-navy">
            X
          </button>
        </div>
        <ul className="lg:flex lg:items-center">
          {items.map(({ label, href, Panel, wide }) => {
            const current = href !== "#" && trim(pathname) === trim(href);
            return (
              <li key={label} className={`group ${wide ? "" : "lg:relative"}`}>
                <div className="flex items-center">
                  <Link
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className={`flex flex-1 items-center px-[15px] py-2.5 font-tight text-sm font-medium tracking-[1.1px] text-heading hover:text-body md:text-xs md:text-black lg:h-20 lg:flex-none lg:px-3.5 lg:py-0 lg:text-xs lg:text-heading xl:text-base ${current ? "text-lime! md:text-lime! lg:text-menu-current!" : ""}`}
                  >
                    {label}
                    {Panel && <Caret className="ml-2 hidden h-[6px] w-[10px] lg:block" />}
                  </Link>
                  {Panel && (
                    <button
                      type="button"
                      aria-label={`${label} submenu`}
                      aria-expanded={sub === label}
                      onClick={() => setSub(sub === label ? null : label)}
                      className="px-[15px] py-2.5 text-heading md:text-black lg:hidden"
                    >
                      <Caret className={`h-[6px] w-[10px] transition-transform ${sub === label ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
                {Panel && (
                  <div
                    className={`${sub === label ? "block" : "hidden"} lg:absolute lg:z-50 lg:hidden lg:group-focus-within:block lg:group-hover:block ${wide ? "lg:inset-x-0 lg:top-[calc(50%+40px)]" : "lg:top-full lg:left-[5px] lg:pt-2.5"}`}
                  >
                    <Panel />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

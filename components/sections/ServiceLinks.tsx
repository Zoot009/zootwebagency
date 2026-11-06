import Image from "next/image";
import { notFound } from "next/navigation";
import { Svg } from "./ui";

// Services landing page: each card opens WhatsApp with a pre-typed message.
const stroke = (shapes: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shapes}</svg>`;

// Lucide icons (ISC licence), inlined because this repo takes no new dependencies.
const icons = {
  Globe: stroke(`<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>`),
  Search: stroke(`<path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle>`),
  MapPin: stroke(`<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle>`),
  Megaphone: stroke(`<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"></path><path d="M8 6v8"></path>`),
  MousePointerClick: stroke(`<path d="M14 4.1 12 6"></path><path d="m5.1 8-2.9-.8"></path><path d="m6 12-1.9 2"></path><path d="M7.2 2.2 8 5.1"></path><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"></path>`),
  Smartphone: stroke(`<rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path>`),
  Users: stroke(`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle>`),
  Workflow: stroke(`<rect width="8" height="8" x="3" y="3" rx="2"></rect><path d="M7 11v4a2 2 0 0 0 2 2h4"></path><rect width="8" height="8" x="13" y="13" rx="2"></rect>`),
  Share2: stroke(`<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>`),
  MessageCircle: stroke(`<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path>`),
};
const arrow = stroke(`<path d="M7 7h10v10"></path><path d="M7 17 17 7"></path>`);
const whatsapp = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;

// Each message is exactly what lands in the WhatsApp chat, so the bot can route on it.
// If you reword one after connecting the bot, update the bot's matching rule too.
const services = [
  {
    name: "Website Development & Optimization",
    icon: icons.Globe,
    blurb: "Professional websites that generate enquiries",
    price: "₹4,599",
    message: "Hey, I wanted to know about your Website Development & Optimization service",
  },
  {
    name: "Website SEO & Optimization",
    icon: icons.Search,
    blurb: "Improve your search visibility with ongoing SEO",
    price: "₹3,999",
    message: "Hey, I wanted to know about your Website SEO & Optimization service",
  },
  {
    name: "Local SEO & Google Business Profile",
    icon: icons.MapPin,
    blurb: "Get discovered across Google Search and Maps",
    price: "₹4,599",
    message: "Hey, I wanted to know about your Local SEO & Google Business Profile service",
  },
  {
    name: "Meta Ads Management",
    icon: icons.Megaphone,
    blurb: "Facebook and Instagram ad campaigns",
    price: "₹3,500",
    message: "Hey, I wanted to know about your Meta Ads Management (Facebook & Instagram) service",
  },
  {
    name: "Google Ads Management",
    icon: icons.MousePointerClick,
    blurb: "Reach people actively searching for you",
    price: "₹3,500",
    message: "Hey, I wanted to know about your Google Ads Management service",
  },
  {
    name: "Mobile Application Development",
    icon: icons.Smartphone,
    blurb: "Turn your idea into a practical mobile app",
    price: "₹17,999",
    message: "Hey, I wanted to know about your Mobile Application Development service",
  },
  {
    name: "CRM & Employee Management Systems",
    icon: icons.Users,
    blurb: "Leads, customers and team in one system",
    price: "₹19,999",
    message: "Hey, I wanted to know about your CRM & Employee Management Systems service",
  },
  {
    name: "Website & Business Process Automation",
    icon: icons.Workflow,
    blurb: "Connect your tools, reduce repetitive work",
    price: "₹9,999",
    message: "Hey, I wanted to know about your Website & Business Process Automation service",
  },
  {
    name: "Social Media Management",
    icon: icons.Share2,
    blurb: "A stronger brand presence on social",
    message: "Hey, I wanted to know about your Social Media Management service",
  },
  {
    name: "Other services",
    icon: icons.MessageCircle,
    blurb: "Tell us what your business needs",
    message: "Hey, I wanted to know about your other services",
  },
];

export default function ServiceLinks() {
  // Set on the host, e.g. 919876543210. Unset (teammates' machines): 404 here, rest of the site unaffected.
  const number = process.env.WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!number) notFound();

  return (
    // The first class hides the site header on this page only. Header lives in the root layout, which every page shares.
    <main className="[body:has(&)>header]:hidden min-h-dvh bg-night-9 bg-linear-to-b from-band/45 to-transparent bg-size-[100%_420px] bg-no-repeat tracking-normal">
      <div className="mx-auto w-full max-w-[480px] px-4 pt-5 pb-8">
        <div className="mb-7 text-center">
          <Image
            src="/uploads/2025/08/Zoot-Digital-logo-white.png"
            alt="zoot web agency"
            width={400}
            height={200}
            preload
            className="mx-auto mb-2 size-[130px] object-cover"
          />
          <h1 className="mb-2 text-[clamp(27px,7.4vw,32px)]/[1.15] font-bold tracking-[-0.02em] text-white">Zoot Digital Marketing</h1>
          <p className="text-[15px]/normal text-menu-title">Practical digital solutions built around your business goals.</p>
          <p className="mt-4 inline-flex items-center gap-[7px] rounded-full bg-tile px-3.5 py-[7px] text-[13px]/normal font-semibold text-white">
            <Svg svg={whatsapp} className="size-4 text-lime" />
            Tap a service to chat on WhatsApp
          </p>
        </div>
        <ul className="grid gap-2.5">
          {services.map(({ name, icon, blurb, price, message }, i) => {
            const other = i === services.length - 1; // "Other services" closes the list as the catch-all
            return (
              <li key={name}>
                <a
                  href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`}
                  target="_blank"
                  rel="noopener"
                  className={`group grid grid-cols-[44px_1fr_20px] items-center gap-3 rounded-2xl p-3 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white ${other ? "bg-band hover:bg-blue-3" : "bg-menu-title hover:bg-white"}`}
                >
                  <Svg svg={icon} className={`size-11 rounded-xl p-[11px] ${other ? "bg-white/15 text-white" : "bg-band/12 text-band"}`} />
                  <span>
                    <strong className={`block text-[15px]/[1.3] font-bold ${other ? "text-white" : "text-navy"}`}>{name}</strong>
                    <small className={`mt-0.5 block text-[13px]/[1.35] text-pretty ${other ? "text-white" : "text-navy/65"}`}>{blurb}</small>
                    {price && (
                      <span className="mt-[5px] block text-[12.5px]/normal font-semibold text-navy/65">
                        Starting from <b className="text-[15px] font-extrabold text-band">{price}</b>
                      </span>
                    )}
                  </span>
                  <Svg svg={arrow} className={`size-5 ${other ? "text-white" : "text-navy/65 group-hover:text-navy"}`} />
                </a>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-center text-[12.5px]/[1.45] text-menu-title">
          Final scope and pricing are confirmed in your proposal. Ad spend is paid separately.
        </p>
        <p className="mt-3.5 text-center text-[11px]/normal font-bold tracking-[0.12em] text-link uppercase">
          Strategy · Execution · Performance
        </p>
      </div>
    </main>
  );
}

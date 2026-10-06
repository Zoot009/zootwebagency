// Homepage extractor: Elementor HTML (already localized) -> structured sections for components/templates/Home.tsx.
// Each section is read by its Elementor container id. If WP changes a section so it can't be read, that
// section falls back to { kind: "raw", html } and still renders (unstyled) instead of breaking the import.
import { parse } from "node-html-parser";

const txt = (el) => el?.text.replace(/\s+/g, " ").trim() ?? "";
// Inner HTML of a widget's content, minus Elementor wrappers/attributes we never render.
const inner = (el) =>
  (el?.querySelector(".elementor-widget-container") ?? el)?.innerHTML
    .replace(/\s(data-[a-z-]+|class|style|id)="[^"]*"/g, "")
    .replace(/<main><\/main>/g, "") // stray empty tag in WP content
    .replace(/\s+/g, " ")
    .trim() ?? "";
// Elementor "hide on device" classes -> list of devices.
const hidden = (el) => ["desktop", "laptop", "tablet", "mobile"].filter((d) => el?.classList.contains(`elementor-hidden-${d}`));
const img = (el) => {
  const i = el?.tagName === "IMG" ? el : el?.querySelector("img");
  if (!i) return null;
  return {
    hidden: hidden(i.closest("[data-widget_type]")),
    src: i.getAttribute("data-src") ?? i.getAttribute("src"),
    alt: i.getAttribute("alt") ?? "",
    width: Number(i.getAttribute("width")) || undefined,
    height: Number(i.getAttribute("height")) || undefined,
  };
};
const svg = (el) => el?.querySelector("svg")?.toString() ?? null;
const w = (root, type) => root.querySelectorAll(`[data-widget_type="${type}.default"]`);

// Animated headline / heading -> { tag, before, highlight, after }. "highlight" is the Amita accent text.
function headline(el) {
  const h = el.querySelector("h1,h2,h3,h4,h5,h6,p,div.elementor-heading-title");
  const plain = el.querySelectorAll(".elementor-headline-plain-text").map(txt);
  const dyn = el.querySelector(".elementor-headline-dynamic-text");
  if (dyn) return { tag: h.tagName.toLowerCase(), before: plain[0] ?? "", highlight: txt(dyn), after: plain[1] ?? "", hidden: hidden(el) };
  return { tag: h.tagName.toLowerCase(), before: txt(h), highlight: "", after: "", hidden: hidden(el) };
}
// ElementsKit heading: <hN class="ekit-heading--title"> with an optional <span> accent.
function ekitHeading(el) {
  const h = el.querySelector(".ekit-heading--title");
  return { tag: h.tagName.toLowerCase(), html: inner(h) };
}
function iconBox(el) {
  return {
    icon: svg(el.querySelector(".elementor-icon-box-icon")),
    title: txt(el.querySelector(".elementor-icon-box-title")),
    titleTag: el.querySelector(".elementor-icon-box-title")?.tagName.toLowerCase() ?? "p",
    html: inner(el.querySelector(".elementor-icon-box-description")),
    href: el.querySelector("a")?.getAttribute("href") ?? null,
  };
}
// Widgets in document order, for columns that are just a stack of headings and rich text.
function flow(con) {
  return con.querySelectorAll("[data-widget_type]").map((el) => {
    const t = el.getAttribute("data-widget_type").replace(".default", "");
    if (t === "animated-headline" || t === "heading") return { kind: "headline", ...headline(el) };
    if (t === "text-editor") return { kind: "html", id: el.getAttribute("data-id"), html: inner(el), hidden: hidden(el) };
    if (t === "image") return { kind: "image", image: img(el), hidden: hidden(el) };
    if (t === "button") return { kind: "button", text: txt(el), href: el.querySelector("a").getAttribute("href") };
    throw new Error(`flow: unexpected widget ${t}`);
  });
}

let localize; // set by extractHome: WP URL -> local path (and queues the upload for download)

const sections = {
  // Hero: headline, subtitle, review badges, intro, website bar, globe image.
  a287d2b(s) {
    const left = s.querySelector('[data-id="7c5f57c"]');
    return {
      kind: "hero",
      title: headline(w(left, "animated-headline")[0]),
      subtitle: inner(w(left, "text-editor")[0]),
      banner: { ...img(w(left, "image")[0]), hidden: hidden(w(left, "image")[0]) },
      badges: w(s.querySelector('[data-id="fa8369a"]'), "image").map(img),
      badgesHidden: hidden(s.querySelector('[data-id="fa8369a"]')),
      intro: inner(w(left, "text-editor")[1]),
      placeholder: left.querySelector(".e-search-input").getAttribute("placeholder"),
      button: { text: txt(w(left, "button")[0]), href: w(left, "button")[0].querySelector("a").getAttribute("href") },
      image: { ...img(s.querySelector('[data-id="40c9138"]')), hidden: hidden(s.querySelector('[data-id="40c9138"]')) },
    };
  },
  // Four stats in a row.
  "1c13193"(s) {
    return { kind: "stats", items: w(s, "icon-box").map((el) => ({ value: txt(el.querySelector(".elementor-icon-box-title")), label: txt(el.querySelector(".elementor-icon-box-description")) })) };
  },
  // "What Are Digital Marketing Services?": circuit image + card | headline, text, card.
  "3363bd4"(s) {
    const [cardA, cardB] = w(s, "icon-box").map(iconBox);
    const right = s.querySelector('[data-id="2de2dab"]');
    return {
      kind: "whatAre",
      image: img(w(s, "image")[0]),
      cardA,
      title: headline(w(right, "animated-headline")[0]),
      body: inner(w(right, "text-editor")[0]),
      cardB,
    };
  },
  // "WHY CHOOSE US": kicker + text (with its h4 and list) | YouTube video with overlay image.
  d0ae128(s) {
    const v = w(s, "video")[0];
    const settings = JSON.parse(v.getAttribute("data-settings"));
    return {
      kind: "whyChoose",
      kicker: headline(w(s, "animated-headline")[0]),
      body: inner(w(s, "text-editor")[0]),
      video: { youtube: settings.youtube_url, overlay: settings.image_overlay?.url ? localize(settings.image_overlay.url) : null },
    };
  },
  // Team: headline, intro, lead cards (image-box), carousel of the rest.
  f67f928(s) {
    return {
      kind: "team",
      title: headline(w(s, "animated-headline")[0]),
      intro: inner(w(s, "text-editor")[0]),
      leads: w(s, "image-box").map((el) => ({
        image: img(el),
        name: txt(el.querySelector(".elementor-image-box-title")),
        nameTag: el.querySelector(".elementor-image-box-title").tagName.toLowerCase(),
        role: txt(el.querySelector(".elementor-image-box-description")),
        hidden: hidden(el.closest(".e-con")),
      })),
      members: w(s, "image-carousel")[0].querySelectorAll(".swiper-slide").map((sl) => ({
        image: img(sl),
        caption: txt(sl.querySelector("figcaption")),
      })),
    };
  },
  // "Your Trusted Partner": text column | 12 service tiles, stats card.
  aef2674(s) {
    const tiles = s.querySelector('[data-id="fffef1d"]');
    const card = s.querySelector('[data-id="1bfc3c4"]');
    return {
      kind: "trusted",
      left: flow(s.querySelector('[data-id="77ad75f"]')),
      tiles: w(tiles, "icon-box").map(iconBox),
      cardTitle: inner(w(card, "text-editor")[0]),
      cardStats: w(card, "icon-box").map(iconBox),
      cardBody: inner(w(card, "text-editor")[1]),
    };
  },
  // Image + "Speed Up Your Growth" | "Not just another vendor" box.
  "80c3180"(s) {
    const top = s.querySelector('[data-id="1b33523"]');
    const box = s.querySelector('[data-id="6c5f875"]');
    return {
      kind: "growth",
      image: img(w(s, "image")[0]),
      title: headline(w(top, "animated-headline")[0]),
      body: inner(w(top, "text-editor")[0]),
      boxTitle: headline(w(box, "animated-headline")[0]),
      boxBody: inner(w(box, "text-editor")[0]),
    };
  },
  // Portfolio grid.
  e619329(s) {
    return {
      kind: "projects",
      title: headline(w(s, "animated-headline")[0]),
      intro: inner(w(s, "text-editor")[0]),
      items: w(s, "image").map((el) => {
        const card = el.parentNode;
        const h = w(card, "heading")[0];
        return {
          image: img(el),
          href: el.querySelector("a")?.getAttribute("href") ?? null,
          title: txt(h),
          titleTag: h.querySelector(".elementor-heading-title").tagName.toLowerCase(),
          tags: w(card, "icon-list")[0].querySelectorAll(".elementor-icon-list-text").map(txt),
        };
      }),
    };
  },
  // AI visibility: counters + text | icon tabs.
  "8145648"(s) {
    return {
      kind: "ai",
      title: headline(w(s, "animated-headline")[0]),
      subtitle: inner(w(s, "text-editor")[0]),
      counters: w(s, "counter").map((el) => ({
        title: txt(el.querySelector(".elementor-counter-title")),
        prefix: txt(el.querySelector(".elementor-counter-number-prefix")),
        value: Number(el.querySelector(".elementor-counter-number").getAttribute("data-to-value")),
        separator: el.querySelector(".elementor-counter-number").getAttribute("data-delimiter") ?? ",",
        suffix: txt(el.querySelector(".elementor-counter-number-suffix")),
      })),
      body: inner(w(s.querySelector('[data-id="12d0d5b"]'), "text-editor")[0]),
      tabsHidden: hidden(s.querySelector('[data-id="38861d8"]')),
      tabs: s.querySelectorAll(".e-n-tabs-heading .e-n-tab-title").map((b, i) => {
        const panel = s.querySelectorAll(".e-n-tabs-content > .e-con")[i];
        const icon = b.querySelector(".e-n-tab-icon")?.childNodes.find((n) => n.nodeType === 1); // svg, or an icon-font <i> (class kept for the template)
        return { icon: icon?.tagName.toLowerCase() === "svg" ? icon.toString() : null, iconClass: icon?.getAttribute("class") ?? null, items: w(panel, "icon-box").map(iconBox) };
      }),
    };
  },
  // "Our PROCESS": badge, heading, text, four icon boxes.
  "70eb3cbf"(s) {
    const [emoji, label] = w(s, "heading").map(txt);
    return {
      kind: "process",
      badge: { emoji, label },
      title: ekitHeading(w(s, "elementskit-heading")[0]),
      body: inner(w(s, "text-editor")[0]),
      items: w(s, "elementskit-icon-box").map((el) => ({
        icon: svg(el.querySelector(".elementskit-info-box-icon")),
        title: txt(el.querySelector(".elementskit-info-box-title")),
        text: txt(el.querySelector(".box-body p:not(.elementskit-info-box-title)")),
        href: el.querySelector("a")?.getAttribute("href") ?? null,
      })),
    };
  },
  // Testimonials heading.
  "6e7982c1"(s) {
    const [emoji, label] = w(s, "heading").map(txt);
    return { kind: "testimonialsIntro", badge: { emoji, label }, title: headline(w(s, "animated-headline")[0]), body: inner(w(s, "text-editor")[0]) };
  },
  // Testimonial cards.
  "2522402d"(s) {
    return {
      kind: "testimonials",
      items: s.querySelectorAll(".swiper-slide").map((sl) => ({
        html: inner(sl.querySelector(".elementskit-commentor-content")),
        stars: img(sl.querySelector(".elementskit-commentor-image")),
        name: txt(sl.querySelector(".elementskit-author-name")),
        role: txt(sl.querySelector(".elementskit-author-des")),
      })),
    };
  },
  // FAQ: two accordion columns.
  "068a0e4"(s) {
    return {
      kind: "faq",
      title: headline(w(s, "animated-headline")[0]),
      intro: inner(w(s, "text-editor")[0]),
      columns: w(s, "elementskit-accordion").map((acc) =>
        acc.querySelectorAll(".elementskit-card").map((c) => ({
          q: txt(c.querySelector(".ekit-accordion-title")),
          a: inner(c.querySelector(".elementskit-card-body")),
          open: c.classList.contains("active"),
        })),
      ),
    };
  },
  // Closing call to action.
  "79c1b5d0"(s) {
    const b = w(s, "elementskit-button")[0];
    return {
      kind: "cta",
      title: ekitHeading(w(s, "elementskit-heading")[0]),
      body: inner(w(s, "text-editor")[0]),
      button: { text: txt(b), href: b.querySelector("a").getAttribute("href") },
    };
  },
};

export function extractHome(html, localizeUrl) {
  localize = localizeUrl;
  const root = parse(html);
  return root
    .querySelector(".elementor")
    .childNodes.filter((n) => n.nodeType === 1)
    .map((s) => {
      const id = s.getAttribute("data-id");
      if (!s.text.trim() && !s.querySelector("img")) return null; // empty spacer containers
      try {
        if (!sections[id]) throw new Error("no extractor");
        return { id, ...sections[id](s) };
      } catch (e) {
        console.warn(`  home section ${id}: ${e.message}; using raw HTML`);
        return { id, kind: "raw", html: s.toString() };
      }
    })
    .filter(Boolean);
}

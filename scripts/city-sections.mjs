// cityHub/cityService pages: Elementor HTML -> structured sections for the city templates.
// All city pages share one Elementor layout. Copy is kept verbatim (HTML sliced from the source);
// we only record structure. Unknown widgets become { t: "raw", html } so they still render.
import { decode } from "./wp-head.mjs";

const VOID = new Set(["img", "br", "hr", "input", "meta", "link", "source", "area", "col", "embed", "wbr", "track", "param"]);

function parse(html) {
  const root = { tag: "#root", attrs: {}, children: [], innerStart: 0, innerEnd: html.length };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
  for (let m; (m = re.exec(html)); ) {
    const [all, close, rawTag, rawAttrs, selfClose] = m;
    if (!rawTag) continue; // comment
    const tag = rawTag.toLowerCase();
    if (close) {
      const i = stack.findLastIndex((n) => n.tag === tag);
      if (i > 0) {
        for (const n of stack.splice(i)) { n.innerEnd = m.index; n.end = m.index + all.length; }
      }
      continue;
    }
    const attrs = {};
    for (const a of rawAttrs.matchAll(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))
      attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? "");
    const node = { tag, attrs, children: [], parent: stack.at(-1), start: m.index, innerStart: m.index + all.length };
    node.parent.children.push(node);
    if (selfClose || VOID.has(tag)) node.innerEnd = node.end = node.innerStart;
    else stack.push(node);
  }
  for (const n of stack.splice(1)) n.innerEnd = n.end = html.length; // unclosed at end of input
  return root;
}

const cls = (n) => ` ${n.attrs.class ?? ""} `;
const has = (n, c) => cls(n).includes(` ${c} `);
function* walk(n) {
  for (const c of n.children) { yield c; yield* walk(c); }
}
const find = (n, pred) => { for (const x of walk(n)) if (pred(x)) return x; };
const findAll = (n, pred) => [...walk(n)].filter(pred);
const isWidget = (n) => n.attrs["data-widget_type"] != null;
const isContainer = (n) => n.attrs["data-element_type"] != null && !isWidget(n);
// Top-most widgets under n, in document order.
const widgetsIn = (n) => n.children.flatMap((c) => (isWidget(c) ? [c] : widgetsIn(c)));

// css: the page's Elementor CSS; kitCss: the site kit CSS (global colors).
export function citySections(html, css = "", kitCss = "") {
  const src = html;
  const kitVars = Object.fromEntries([...kitCss.matchAll(/(--e-global-color-\w+):\s*([^;}]+)/g)].map((m) => [m[1], m[2].trim()]));
  const resolve = (v) => v.replace(/var\(\s*(--[\w-]+)\s*\)/g, (all, n) => kitVars[n] ?? all).trim();
  // Some WP copy contains pasted markup with Tailwind classes (e.g. from ChatGPT): inert on WordPress,
  // but they would style it here. WP classes do nothing without WP's CSS, so drop them all.
  const clean = (h) => h.replace(/\s+class=("[^"]*"|'[^']*')/g, "");
  const inner = (n) => (n ? clean(src.slice(n.innerStart, n.innerEnd).trim()) : "");
  const outer = (n) => clean(src.slice(n.start, n.end ?? n.innerEnd));
  const by = (n, c) => find(n, (x) => has(x, c));
  const strip = (s) => s.replace(/<[^>]*>/g, "").trim();

  function img(n) {
    const { src: s, alt = "", width, height, srcset } = n.attrs;
    // Largest srcset candidate (often the original); aspect ratio from the width/height attributes.
    const best = (srcset ?? "").split(",").map((c) => c.trim().split(/\s+/)).filter(([u, w]) => u && /w$/.test(w ?? ""))
      .map(([u, w]) => [u, parseInt(w)]).sort((a, b) => b[1] - a[1])[0];
    const w = best?.[1] ?? +width;
    return { t: "img", src: best?.[0] ?? s, alt, width: w, height: Math.round((w * +height) / +width) };
  }

  const parsers = {
    breadcrumbs: () => ({ t: "crumbs" }),
    heading: (w) => { const h = by(w, "elementor-heading-title"); return h && { t: "h", tag: h.tag, html: inner(h) }; },
    "text-editor": (w) => ({ t: "text", html: inner(w.children.length === 1 && has(w.children[0], "elementor-widget-container") ? w.children[0] : w) }),
    image: (w) => { const i = find(w, (x) => x.tag === "img"); return i && img(i); },
    button: (w) => {
      const a = by(w, "elementor-button");
      return a && { t: "btn", html: inner(by(w, "elementor-button-text")), href: a.attrs.href ?? null };
    },
    icon: (w) => {
      const s = find(w, (x) => x.tag === "svg"), i = find(w, (x) => x.tag === "i");
      return s ? { t: "icon", svg: outer(s) } : i && FONT_ICONS[i.attrs.class] && { t: "icon", svg: FONT_ICONS[i.attrs.class] };
    },
    "icon-box": (w) => {
      const s = find(w, (x) => x.tag === "svg"), title = by(w, "elementor-icon-box-title");
      const span = title?.children.length === 1 && title.children[0].tag === "span" ? title.children[0] : title;
      return s && title && { t: "iconbox", svg: outer(s), tag: title.tag, html: inner(span), desc: inner(by(w, "elementor-icon-box-description")) };
    },
    html: (w) => ({ t: "html", html: inner(w) }),
    "animated-headline": (w) => {
      const h = by(w, "elementor-headline"), dyn = by(w, "elementor-headline-dynamic-wrapper");
      if (!h || !dyn || !/"headline_style":"highlight"/.test(w.attrs["data-settings"] ?? "")) return null;
      const plain = (side) => h.children.filter((c) => has(c, "elementor-headline-plain-text") && (side < 0 ? c.start < dyn.start : c.start > dyn.start)).map(inner).join("");
      return { t: "headline", tag: h.tag, before: plain(-1), highlight: inner(by(dyn, "elementor-headline-dynamic-text")), after: plain(1) };
    },
    form: (w) => {
      const form = find(w, (x) => x.tag === "form"), submit = form && by(form, "elementor-field-type-submit");
      if (!submit) return null;
      const fields = [];
      for (const g of findAll(form, (x) => has(x, "elementor-field-group") && x !== submit)) {
        const input = find(g, (x) => x.tag === "input" || x.tag === "select" || x.tag === "textarea");
        // Fields we can't render faithfully (reCAPTCHA, honeypot, HTML/step…): keep the whole widget raw.
        if (!input || !["text", "email", "tel", "url", "number", "select", "textarea"].includes(input.attrs.type ?? input.tag)) return null;
        const label = by(g, "elementor-field-label");
        fields.push({
          tag: input.tag, type: input.attrs.type ?? null, name: input.attrs.name, id: input.attrs.id,
          placeholder: input.attrs.placeholder ?? null,
          label: label && !has(label, "elementor-screen-only") ? decode(strip(inner(label))) : null,
          width: +(cls(g).match(/elementor-col-(\d+)/)?.[1] ?? 100),
          options: input.tag === "select" ? findAll(input, (x) => x.tag === "option").map((o) => decode(strip(inner(o)))) : undefined,
        });
      }
      return { t: "form", name: form.attrs.name ?? "", fields, submit: inner(by(submit, "elementor-button-text")) };
    },
    "elementskit-testimonial": (w) => {
      // Card text min-height (150-340px) and card padding vary per page and set the card size.
      const rule = (sel, prop) =>
        css.match(new RegExp(`\\.elementor-element-${w.attrs["data-id"]}(?![\\w-])[^{}]*${sel}[^{}]*\\{(?:[^}]*;)?${prop}:([^;}]+)`))?.[1];
      return {
        t: "testimonials",
        minHeight: parseFloat(rule("commentor-content", "min-height") ?? "0"),
        pad: rule("single-testimonial-slider", "padding") ?? "30px", // ElementsKit's default
        items: findAll(w, (x) => has(x, "elementskit-single-testimonial-slider")).map((s) => ({
          stars: findAll(by(s, "elementskit-stars") ?? s, (x) => x.tag === "li").length,
          html: inner(by(s, "elementskit-commentor-content")),
          name: inner(by(s, "elementskit-author-name")),
        })),
      };
    },
    "elementskit-accordion": (w) => ({
      t: "faq",
      items: findAll(w, (x) => has(x, "elementskit-card")).map((c) => ({
        q: inner(by(c, "ekit-accordion-title")),
        a: inner(by(c, "elementskit-card-body")),
        open: has(find(c, (x) => x.attrs["aria-labelledby"] != null) ?? c, "show"),
      })),
    }),
  };

  // Link color set on a text widget in the page CSS (varies per page, even per card).
  const linkOf = (id) => css.match(new RegExp(`\\.elementor-element-${id}(?![\\w-]) a\\{(?:[^}]*;)?color:([^;}]+)`))?.[1];
  // Text alignment set on a heading/text widget (e.g. centered CTA copy on some pages).
  const alignOf = (id) => css.match(new RegExp(`\\.elementor-element-${id}(?![\\w-])\\{(?:[^}]*;)?text-align:([^;}]+)`))?.[1];
  const part = (w) => {
    const type = w.attrs["data-widget_type"].replace(/\.default$/, "");
    const p = parsers[type]?.(w) ?? { t: "raw", html: outer(w) };
    const link = (p.t === "text" || p.t === "iconbox") && linkOf(w.attrs["data-id"]);
    const align = (p.t === "text" || p.t === "h") && alignOf(w.attrs["data-id"]);
    return { ...p, ...(link && { link: resolve(link) }), ...(align && { align }) };
  };

  // Background image of a container, from the page's Elementor CSS (not present in the HTML).
  const bgOf = (id) =>
    css.match(new RegExp(`\\.elementor-element-${id}(?![\\w-])[^{}]*\\{[^}]*background-image:\\s*url\\(["']?([^"')]+)`))?.[1];

  // Padding the page CSS sets on a container (Elementor defaults to 10px; some pages use 0).
  const padOf = (n) => {
    const rule = n && css.match(new RegExp(`\\.elementor-element-${n.attrs["data-id"]}(?![\\w-])\\{([^}]*)\\}`))?.[1];
    if (!rule) return;
    const sides = ["top", "right", "bottom", "left"].map((s) => rule.match(new RegExp(`--padding-${s}:([^;]+)`))?.[1]);
    return sides.every(Boolean) ? sides.join(" ") : rule.match(/(?:^|;)padding:([^;]+)/)?.[1];
  };
  const kids = (n) => n.children.flatMap((c) => (c.attrs["data-id"] ? [c] : kids(c)));

  function kindOf(ps) {
    const n = (t) => ps.filter((p) => p.t === t).length;
    const heads = ps.filter((p) => p.t === "h");
    if (n("crumbs")) return "hero";
    if (n("form")) return "audit";
    if (n("testimonials")) return "testimonials";
    if (n("faq")) return "faq";
    if (n("iconbox") >= 3) return "why";
    if (n("icon") >= 3) return "services";
    if (ps.some((p) => p.t === "html" && /&#9733;|★/.test(p.html)) || (n("img") && ps.every((p) => p.t === "h" || p.t === "img") && heads.every((h) => !/^h\d$/.test(h.tag)))) return "stats";
    if (n("img") >= 2) return heads.some((h) => /^\+?[\d,.]+%$/.test(strip(h.html))) ? "cases" : "awards";
    if (n("btn")) return ps.length <= 3 ? "cta" : "intro";
    return "generic";
  }

  // A card is the largest container inside the section holding exactly one anchor widget
  // (stat star row, case/award image, service icon) or, for intro, the container with a background.
  const anchorOf = { stats: (t) => t === "html" || t === "img", cases: (t) => t === "img", awards: (t) => t === "img", services: (t) => t === "icon" };

  // Part types only their own section renders; anywhere else the template would drop them.
  const OWN = { crumbs: "hero", form: "audit", testimonials: "testimonials", faq: "faq" };

  return (find(parse(src), (x) => x.attrs["data-elementor-type"])?.children ?? []).map((s) => {
    const ws = widgetsIn(s);
    const parsed = new Map(ws.map((w) => [w, part(w)]));
    const kind = kindOf([...parsed.values()]);
    for (const p of parsed.values())
      if (OWN[p.t] && OWN[p.t] !== kind) console.warn(`  city-sections: a ${p.t} widget in a "${kind}" section is not rendered`);
    let cardNodes = [];
    if (anchorOf[kind]) {
      for (const a of ws.filter((w) => anchorOf[kind](parsed.get(w).t))) {
        let card;
        for (let n = a.parent; n && n !== s; n = n.parent)
          if (isContainer(n)) { if (widgetsIn(n).filter((w) => anchorOf[kind](parsed.get(w).t)).length === 1) card = n; else break; }
        if (card && !cardNodes.includes(card)) cardNodes.push(card);
      }
    } else if (kind === "intro") {
      // The photo card: a container with a background image (not one inside a nested widget).
      cardNodes = findAll(s, (x) => isContainer(x) && !ws.some((w) => x.start > w.start && x.start < w.end) && bgOf(x.attrs["data-id"]));
      cardNodes = cardNodes.filter((c) => !cardNodes.some((o) => o !== c && c.start > o.start && c.start < o.end));
    }
    const inCard = (w) => cardNodes.find((c) => w.start >= c.start && w.start < c.end);
    const parts = [];
    for (const w of ws) {
      const c = inCard(w);
      if (!c) parts.push(parsed.get(w));
      else if (c === cardNodes[0] && w === widgetsIn(c)[0]) parts.push({ t: "cards" }); // cards render here
    }
    const section = { kind, parts };
    if (cardNodes.length)
      section.cards = cardNodes.map((c) => {
        const bg = bgOf(c.attrs["data-id"]);
        return { ...(bg && { bg }), parts: widgetsIn(c).map((w) => parsed.get(w)) };
      });
    // Paddings that vary per page: the section, its first container ("box") and the container
    // holding the repeated items ("grid": cards, icon boxes, FAQ columns).
    const items = cardNodes.length > 1 ? cardNodes : ws.filter((w) => ["iconbox", "faq"].includes(parsed.get(w).t));
    let grid = items.length > 1 ? items[0].parent : undefined;
    while (grid && !items.every((n) => n.start >= grid.start && n.start < grid.end)) grid = grid.parent;
    const pad = Object.fromEntries(Object.entries({ sec: padOf(s), box: padOf(kids(s).find(isContainer)), grid: grid !== s && padOf(grid) }).filter(([, v]) => v));
    if (Object.keys(pad).length) section.pad = pad;
    // Content width: boxed old-style sections default to 1140px; containers only when the page sets one.
    const id = s.attrs["data-id"];
    const width = has(s, "elementor-section-boxed")
      ? (css.match(new RegExp(`\\.elementor-element-${id}(?![\\w-]) > \\.elementor-container\\{(?:[^}]*;)?max-width:([^;}]+)`))?.[1] ?? "1140px")
      : css.match(new RegExp(`\\.elementor-element-${id}(?![\\w-])\\{(?:[^}]*;)?--content-width:([^;}]+)`))?.[1];
    if (width) section.width = width;
    return section;
  });
}

// Icon-font glyphs used by some city pages (WP plugin "icon-element"), as inline SVG so we don't ship
// the plugin fonts. Material Icons (Apache-2.0), Metrize Icons, Phosphor Light (MIT): paths from each
// font's SVG version, flipped to SVG coordinates. Unknown icon fonts fall back to raw HTML.
const FONT_ICONS = {
  "material-icons md-web": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z\"/></svg>",
  "xlmetriz metriz-social-sharethis": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" fill=\"currentColor\"><path transform=\"matrix(1 0 0 -1 0 480)\" d=\"M 256.00,480.00C 114.609,480.00,0.00,365.391,0.00,224.00s 114.609-256.00, 256.00-256.00s 256.00,114.609, 256.00,256.00S 397.391,480.00, 256.00,480.00z M 256.00,8.00 c-119.297,0.00-216.00,96.703-216.00,216.00S 136.703,440.00, 256.00,440.00s 216.00-96.703, 216.00-216.00S 375.297,8.00, 256.00,8.00zM 342.906,269.75c 22.734,0.00, 41.172,18.438, 41.172,41.172c0.00,22.719-18.438,41.156-41.172,41.156s-41.172-18.438-41.172-41.156 c0.00-1.781, 0.312-3.438, 0.516-5.156l-104.328-52.438c-7.438,7.312-17.594,11.844-28.844,11.844 c-22.719,0.00-41.156-18.438-41.156-41.156c0.00-22.734, 18.438-41.188, 41.156-41.188c 11.484,0.00, 21.859,4.734, 29.328,12.328l 103.891-52.594 c-0.25-1.812-0.562-3.594-0.562-5.453c0.00-22.75, 18.438-41.188, 41.172-41.188s 41.172,18.438, 41.172,41.188 c0.00,22.703-18.438,41.172-41.172,41.172c-11.609,0.00-22.062-4.875-29.531-12.609l-103.719,52.50c 0.266,1.922, 0.594,3.828, 0.594,5.844 c0.00,2.219-0.328,4.391-0.656,6.547l 103.562,52.016C 320.656,274.719, 331.188,269.75, 342.906,269.75z\"/></svg>",
  "phl phlight-cursor-click": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1024 1024\" fill=\"currentColor\"><path transform=\"matrix(1 0 0 -1 0 960)\" d=\"M360 864v32c0 13.255 10.745 24 24 24s24-10.745 24-24v0-32c0-13.255-10.745-24-24-24s-24 10.745-24 24v0zM64 552h32c13.255 0 24 10.745 24 24s-10.745 24-24 24v0h-32c-13.255 0-24-10.745-24-24s10.745-24 24-24v0zM501.28 810.52c3.124-1.594 6.815-2.529 10.723-2.529 9.351 0 17.453 5.348 21.414 13.152l0.063 0.137 32 64c1.599 3.129 2.535 6.825 2.535 10.74 0 13.263-10.752 24.015-24.015 24.015-9.348 0-17.449-5.341-21.417-13.139l-0.063-0.136-32-64c-1.604-3.133-2.545-6.834-2.545-10.755 0-9.357 5.355-17.464 13.168-21.422l0.137-0.063zM117.28 469.48l-64-32c-7.94-4.026-13.286-12.129-13.286-21.48 0-13.258 10.748-24.006 24.006-24.006 3.907 0 7.596 0.933 10.857 2.589l-0.137-0.063 64 32c7.94 4.026 13.286 12.129 13.286 21.48 0 13.258-10.748 24.006-24.006 24.006-3.907 0-7.596-0.933-10.857-2.589l0.137 0.063zM871.6 218.36c10.135-10.134 16.404-24.135 16.404-39.6s-6.269-29.466-16.404-39.6l-50.76-50.76c-10.134-10.135-24.135-16.404-39.6-16.404s-29.466 6.269-39.6 16.404l-205.24 205.24c-1.447 1.443-3.444 2.335-5.649 2.335-3.143 0-5.862-1.812-7.17-4.448l-0.021-0.047-71-184.96c-0.125-0.25-0.26-0.567-0.378-0.892l-0.022-0.068c-8.696-19.903-28.21-33.56-50.914-33.56-0.073 0-0.145 0-0.218 0h0.011c-0.92 0-1.8 0-2.72 0-23.566 1.075-43.21 16.719-50.209 38.088l-0.111 0.392-209.2 640.32c-1.689 5.098-2.663 10.967-2.663 17.063 0 30.928 25.072 56 56 56 6.096 0 11.965-0.974 17.459-2.775l-0.396 0.112 640.32-209.2c22.205-7.774 37.845-28.548 37.845-52.975 0-22.566-13.347-42.014-32.577-50.881l-0.347-0.144-0.96-0.36-185-71.040c-2.668-1.334-4.468-4.046-4.468-7.178 0-2.212 0.897-4.214 2.348-5.662v0zM837.64 184.4l-205.24 205.24c-10.135 10.134-16.403 24.135-16.403 39.599 0 22.857 13.694 42.516 33.326 51.22l0.357 0.141 0.96 0.4 185 71c2.454 1.398 4.083 3.996 4.083 6.975 0 3.383-2.1 6.276-5.068 7.446l-0.054 0.019-640.28 209.12c-0.772 0.256-1.663 0.415-2.588 0.44h-0.012c-4.255-0.205-7.626-3.704-7.626-7.991 0-0.831 0.127-1.632 0.362-2.385l-0.015 0.057 209.080-640.28c0.887-3.134 3.719-5.393 7.079-5.4h0.001c0.211-0.022 0.455-0.034 0.703-0.034 2.97 0 5.523 1.789 6.639 4.348l0.018 0.047 71.040 185 0.4 0.96c8.845 19.989 28.504 33.683 51.361 33.683 15.464 0 29.465-6.268 39.599-16.403l205.24-205.24c1.448-1.45 3.449-2.346 5.66-2.346s4.212 0.897 5.66 2.346v0l50.72 50.72c1.45 1.448 2.346 3.449 2.346 5.66s-0.897 4.212-2.346 5.66v0z\"/></svg>",
};

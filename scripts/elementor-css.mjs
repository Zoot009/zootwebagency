// Elementor page CSS -> the layout/visual values GenericPage needs (team decision: import values, not
// Elementor's stylesheets). Keeps each rule's selector and declarations, drops motion/vendor noise,
// rewrites WP image URLs to /uploads and font names to our next/font tokens. The structural CSS that
// interprets these values (.e-con, widgets) is ours, in app/globals.css.

// Vendor prefixes are noise except -webkit-background-clip / -webkit-text-fill-color (gradient text).
const DROP = /^(transition|animation|-ms-|-moz-|-webkit-(?!background-clip|text-fill-color|text-stroke)|--[a-z-]*transition|--animation|--iteration-count|--page-title-display|will-change)/;
const FONTS = {
  "DM Sans": "var(--font-display)",
  Manrope: "var(--font-sans)",
  "Inter Tight": "var(--font-tight)",
  Inter: "var(--font-inter)",
  Archivo: "var(--font-archivo)",
  Amita: "var(--font-script)",
  Poppins: "var(--font-poppins)",
  Lato: "var(--font-lato)",
  "Nunito Sans": "var(--font-nunito)",
};
const font = (v) => v.replace(/"([^"]+)"/g, (m, name) => FONTS[name] ?? m);

// [{ media, rules: [[selector, declarations]] }] for top-level rules and one level of @media.
function parseBlocks(css) {
  const out = [{ media: "", body: "" }];
  let i = 0;
  while (i < css.length) {
    if (css.startsWith("@", i)) {
      const open = css.indexOf("{", i);
      const q = css.slice(i, open).trim();
      let depth = 1, j = open + 1;
      while (depth) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; j++; }
      if (q.startsWith("@media") && !q.includes("prefers-reduced-motion")) out.push({ media: q.replace(/\s+/g, " "), body: css.slice(open + 1, j - 1) });
      i = j;
    } else {
      const end = css.indexOf("}", i);
      if (end < 0) break;
      out[0].body += css.slice(i, end + 1);
      i = end + 1;
    }
  }
  return out.map(({ media, body }) => ({ media, rules: [...body.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => [m[1].trim(), m[2]]) }));
}

function filterDecls(decls, localizeUrl) {
  return decls
    .split(";")
    .map((d) => d.trim())
    .filter((d) => d.includes(":") && !DROP.test(d))
    .map((d) => {
      const k = d.slice(0, d.indexOf(":")).trim();
      let v = d.slice(d.indexOf(":") + 1).trim();
      v = v.replace(/url\(\s*["']?([^"')]+)["']?\s*\)/g, (_, u) => `url("${localizeUrl(u)}")`);
      if (k === "font-family" || k.endsWith("font-family")) v = font(v);
      return `${k}:${v}`;
    })
    .join(";");
}

function emit(blocks, mapSelector) {
  return blocks
    .map(({ media, rules }) => {
      const body = rules
        .map(([sel, d]) => [mapSelector(sel), d])
        .filter(([sel, d]) => sel && d)
        .map(([sel, d]) => `${sel}{${d}}`)
        .join("");
      return body && (media ? `${media}{${body}}` : body);
    })
    .filter(Boolean)
    .join("");
}

// A page's own post-<id>.css: keep its rules (already scoped by .elementor-<id>).
export function pageCss(css, localizeUrl) {
  const blocks = parseBlocks(css).map(({ media, rules }) => ({ media, rules: rules.map(([s, d]) => [s, filterDecls(d, localizeUrl)]) }));
  return emit(blocks, (s) => s);
}

// The kit (post-21.css): only its global color/typography variables and container width, under .wp-content.
export function kitVars(css, localizeUrl) {
  const blocks = parseBlocks(css).map(({ media, rules }) => ({
    media,
    rules: rules
      .filter(([s]) => /^\.elementor-kit-\d+$|^\.e-con$/.test(s))
      .map(([s, d]) => [s, filterDecls(d, localizeUrl).split(";").filter((x) => x.startsWith("--")).join(";")]),
  }));
  return emit(blocks, (s) => (s === ".e-con" ? ".wp-content .e-con" : ".wp-content"));
}

// Widgets whose final state WP only reaches with JS (count-up numbers, progress bars): bake it into the HTML.
export function staticWidgets(html) {
  const fmt = (n, sep) => Number(n).toLocaleString("en-US").replaceAll(",", sep);
  return html
    .replace(/(<span class="elementor-counter-number"[^>]*data-to-value="([\d.]+)"[^>]*?(?:data-delimiter="([^"]*)")?[^>]*>)[^<]*</g, (_, open, n, sep = ",") => `${open}${fmt(n, sep)}<`)
    .replace(/(<span class="number-percentage"[^>]*data-value="([\d.]+)"[^>]*>)[^<]*</g, (_, open, n) => `${open}${n}<`)
    .replace(/<div class="elementor-progress-bar" data-max="(\d+)"/g, '<div class="elementor-progress-bar" data-max="$1" style="width:$1%"');
}

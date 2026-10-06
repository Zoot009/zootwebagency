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

// [{ media, rules: [[selector, declarations]] }]. Nested @media (custom CSS has them) are flattened by
// joining the queries; other at-rules (@keyframes, @supports, ...) are dropped.
function parseBlocks(css, media = "", out = [{ media: "", rules: [] }]) {
  if (!media)
    css = css
      .replace(/\/\*[\s\S]*?\*\//g, "") // comments (custom CSS has them inside declarations)
      .replace(/\{\{[^{}]*\}\}/g, ""); // unfilled Elementor placeholders like {{VALUE}} (their braces break parsing)
  const block = media ? { media, rules: [] } : out[0];
  if (media) out.push(block);
  let i = 0;
  while (i < css.length) {
    while (/\s/.test(css[i] ?? "")) i++;
    if (i >= css.length) break;
    const open = css.indexOf("{", i);
    if (open < 0) break;
    const head = css.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (depth && j < css.length) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; j++; }
    const body = css.slice(open + 1, j - 1);
    if (head.startsWith("@media")) {
      if (!head.includes("prefers-reduced-motion")) {
        const q = head.replace(/\s+/g, " ");
        parseBlocks(body, media ? `${media} and ${q.replace(/^@media\s*/, "")}` : q, out);
      }
    } else if (!head.startsWith("@") && !body.includes("{")) block.rules.push([head, body]);
    i = j;
  }
  return out;
}

function filterDecls(decls, localizeUrl) {
  return decls
    .split(";")
    .map((d) => d.trim())
    .filter((d) => d.includes(":") && !DROP.test(d) && d.slice(d.indexOf(":") + 1).trim())
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

// Minimal parser for the Elementor HTML stored in content/pages/*.json (page.html).
// Elementor output is machine-generated and well-formed, so a tolerant tag scanner is enough.
// Nodes keep source offsets: copy is always sliced from the original HTML, never rebuilt.

export type El = {
  tag: string; // lowercase tag name
  attrs: Record<string, string>;
  children: El[];
  start: number; // "<" of the open tag
  innerStart: number; // after the open tag's ">"
  innerEnd: number; // "<" of the close tag (== innerStart for void/self-closing)
  end: number; // after the close tag's ">"
};

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
// Comments, doctype, raw-text elements (kept whole), close tags, open tags.
const TOKEN =
  /<!--[\s\S]*?-->|<!doctype[^>]*>|<(script|style|textarea|title)\b[^>]*>[\s\S]*?<\/\1\s*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

export function parse(html: string): El {
  const root: El = { tag: "#root", attrs: {}, children: [], start: 0, innerStart: 0, innerEnd: html.length, end: html.length };
  const stack = [root];
  for (const m of html.matchAll(TOKEN)) {
    const [raw, rawTag, closeTag, openTag, attrSrc] = m;
    const at = m.index;
    const top = stack[stack.length - 1];
    if (rawTag) {
      const open = raw.indexOf(">") + 1;
      const close = raw.lastIndexOf("</");
      top.children.push({ tag: rawTag.toLowerCase(), attrs: attrs(raw.slice(rawTag.length + 1, open - 1)), children: [], start: at, innerStart: at + open, innerEnd: at + close, end: at + raw.length });
    } else if (closeTag) {
      const i = stack.findLastIndex((n) => n.tag === closeTag.toLowerCase());
      if (i < 1) continue; // stray close tag: ignore
      const closed = stack.splice(i); // matched element + any unclosed descendants
      for (const n of closed) n.innerEnd = n.end = at;
      closed[0].end = at + raw.length;
    } else if (openTag) {
      const tag = openTag.toLowerCase();
      const el: El = { tag, attrs: attrs(attrSrc), children: [], start: at, innerStart: at + raw.length, innerEnd: at + raw.length, end: at + raw.length };
      top.children.push(el);
      if (!VOID.has(tag) && !attrSrc.trimEnd().endsWith("/")) stack.push(el);
    }
  }
  return root;
}

function attrs(src: string) {
  const out: Record<string, string> = {};
  for (const [, k, a, b, c] of src.matchAll(ATTR)) out[k.toLowerCase()] = decode(a ?? b ?? c ?? "");
  return out;
}

export const decode = (s: string) =>
  s.replace(/&(#x?[\da-f]+|amp|lt|gt|quot|apos|nbsp);/gi, (e, c: string) =>
    c[0] === "#" ? String.fromCodePoint(parseInt(c.slice(c[1] === "x" || c[1] === "X" ? 2 : 1), c[1] === "x" || c[1] === "X" ? 16 : 10))
    : ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " } as Record<string, string>)[c.toLowerCase()] ?? e);

export const hasClass = (el: El, c: string) => ` ${el.attrs.class ?? ""} `.includes(` ${c} `);
export const inner = (html: string, el: El) => html.slice(el.innerStart, el.innerEnd);
export const outer = (html: string, el: El) => html.slice(el.start, el.end);

/** Depth-first search; does not descend into matches. */
export function findAll(el: El, pred: (e: El) => boolean, out: El[] = []): El[] {
  for (const c of el.children) {
    if (pred(c)) out.push(c);
    else findAll(c, pred, out);
  }
  return out;
}
export const find = (el: El, pred: (e: El) => boolean) => findAll(el, pred)[0] as El | undefined;
export const byClass = (el: El, c: string) => find(el, (e) => hasClass(e, c));

const DROP = new Set(["script", "title", "meta", "link", "base"]); // document-level tags pasted into widgets
const UNWRAP = new Set(["html", "head", "body"]);
const isLeaf = (html: string, el: El) => VOID.has(el.tag) || html.slice(el.start, el.innerStart).endsWith("/>");

/**
 * el's inner HTML, safe to inject with dangerouslySetInnerHTML: unclosed tags are closed, stray close tags and
 * document-level tags (<title>, <meta>, <html>…) are dropped, and <style> rules aimed at html/body/:root are
 * scoped to the injecting wrapper, which must carry the "wp-raw" class.
 */
export function raw(html: string, el: El): string {
  let out = "";
  let pos = el.innerStart;
  for (const c of el.children) {
    out += gap(html.slice(pos, c.start));
    pos = c.end;
    if (DROP.has(c.tag)) continue;
    if (UNWRAP.has(c.tag)) out += raw(html, c);
    else if (c.tag === "style") out += html.slice(c.start, c.innerStart) + scope(inner(html, c)) + "</style>";
    else if (c.tag === "textarea" || isLeaf(html, c)) out += html.slice(c.start, c.end);
    else out += html.slice(c.start, c.innerStart) + raw(html, c) + `</${c.tag}>`;
  }
  return out + gap(html.slice(pos, el.innerEnd));
}
/** Like raw(), but includes el's own tags. */
export const rawOuter = (html: string, el: El) =>
  raw(html, { tag: "#", attrs: {}, children: [el], start: el.start, innerStart: el.start, innerEnd: el.end, end: el.end });
const gap = (s: string) => s.replace(/<\/[a-zA-Z][^>]*>|<!doctype[^>]*>/gi, ""); // text between elements
const scope = (css: string) => css.replace(/(^|[{};,]\s*)(html|body|:root)(?=\s*[{,])/g, "$1.wp-raw");

/** Plain text (entities decoded, whitespace collapsed). */
export const text = (html: string, el: El) =>
  decode(inner(html, el).replace(/<(script|style)[\s\S]*?<\/\1>/gi, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

// ---- Elementor structure -------------------------------------------------------------------
export const widgetType = (el: El) => el.attrs["data-widget_type"]?.replace(/\.default$/, "");
export const isWidget = (el: El) => !!el.attrs["data-widget_type"];
/** Flexbox container (e-con), legacy section/column, or their inner wrappers. */
export const isContainer = (el: El) =>
  el.attrs["data-element_type"] === "container" || el.attrs["data-element_type"] === "section" || el.attrs["data-element_type"] === "column";

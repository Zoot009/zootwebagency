// Elementor HTML -> container/widget tree. Widgets keep their inner HTML verbatim.
// Self-check over every article page: node components/sections/elementor-parse.check.mjs
export type Block =
  | { kind: "con"; id: string; cls: string; children: Block[] }
  | { kind: "widget"; id: string; cls: string; type: string; settings: string; start: number; html?: string };

const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/;

export function parse(html: string): Block[] {
  const root: Block[] = [];
  const stack: { tag: string; node?: Block }[] = [];
  for (const m of html.matchAll(/<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
    const [all, close, rawTag, attrs = ""] = m;
    if (!rawTag) continue; // comment
    const tag = rawTag.toLowerCase();
    if (close) {
      // Close back to the matching open tag, like a browser does with unclosed <p>/<li>.
      const i = stack.findLastIndex((s) => s.tag === tag);
      if (i < 0) continue; // stray close tag
      for (const s of stack.splice(i)) if (s.node?.kind === "widget") s.node.html = html.slice(s.node.start, m.index);
      continue;
    }
    if (VOID.test(tag) || attrs.trimEnd().endsWith("/")) continue;
    const parent = stack.findLast((s) => s.node)?.node;
    const id = attrs.match(/\bdata-id="([^"]+)"/)?.[1];
    const cls = attrs.match(/\bclass="([^"]*)"/)?.[1] ?? "";
    const type = attrs.match(/\bdata-widget_type="([^"]+)"/)?.[1];
    let node: Block | undefined;
    if (parent?.kind !== "widget" && id && /\be-con\b/.test(cls)) node = { kind: "con", id, cls, children: [] };
    else if (parent?.kind !== "widget" && id && type) {
      const settings = attrs.match(/\bdata-settings="([^"]*)"/)?.[1] ?? "";
      node = { kind: "widget", id, cls, type: type.replace(/\.default$/, ""), settings, start: m.index + all.length };
    }
    if (node) (parent?.kind === "con" ? parent.children : root).push(node);
    stack.push({ tag, node });
  }
  return root;
}

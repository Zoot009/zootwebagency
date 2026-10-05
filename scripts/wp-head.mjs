// Shared by import-wp.mjs and check-seo.mjs.
export const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, "\u00a0")
    .replace(/&amp;/g, "&");

// Rank Math head tags -> plain object. Keeps every meta (name/property) in source order.
// JSON-LD is read from the whole document (Next renders it in <body>, widgets may too on WP).
export function parseHead(html) {
  const head = html.split("</head>")[0];
  const attr = (tag, a) => tag.match(new RegExp(`\\s${a}=(["'])(.*?)\\1`, "s"))?.[2];
  const meta = [];
  for (const tag of head.match(/<meta\s[^>]*>/g) ?? []) {
    const key = attr(tag, "property") ?? attr(tag, "name");
    const content = attr(tag, "content");
    if (key && content != null && /^(description|robots|og:|article:|twitter:|keywords)/.test(key))
      meta.push([key, decode(content)]);
  }
  const title = head.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const canonical = head.match(/<link\s+rel="canonical"\s+href="([^"]*)"/)?.[1];
  const jsonLd = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]),
  );
  return { title: title && decode(title.trim()), canonical, meta, jsonLd };
}

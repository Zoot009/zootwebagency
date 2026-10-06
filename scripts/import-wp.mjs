// Pulls every WordPress page/post into content/pages/*.json and images into public/uploads/.
// Re-runnable: overwrites generated files. Usage: node scripts/import-wp.mjs
import { mkdir, writeFile, rm, access } from "node:fs/promises";
import { dirname } from "node:path";
import { decode, parseHead } from "./wp-head.mjs";

const WP = "https://powderblue-gaur-774652.hostingersite.com";
// Final production domain. Canonicals/OG URLs are rewritten from WP to this. Change at cutover.
const SITE = process.env.SITE_URL ?? WP;
const OUT = "content/pages";

// Hostinger 5xx's under load: retry with backoff.
async function get(url, tries = 4, redirect = "follow") {
  for (let i = 1; ; i++) {
    const res = await fetch(url, { redirect, signal: AbortSignal.timeout(90_000) }).catch((e) => ({ ok: false, status: e.name }));
    const retryable = !(res.status < 500); // 5xx or network error/timeout
    if (res.status < 400) return res; // 2xx, or 3xx when redirect: "manual"
    if (!retryable || i === tries) throw new Error(`${res.status} ${url}`);
    await new Promise((r) => setTimeout(r, 2000 * i));
  }
}

async function getAll(type) {
  const items = [];
  for (let page = 1; ; page++) {
    const res = await get(`${WP}/wp-json/wp/v2/${type}?per_page=20&page=${page}`);
    items.push(...(await res.json()));
    if (page >= +res.headers.get("x-wp-totalpages")) return items;
  }
}

// URL-pattern families; templates are chosen by this. Adjust here, not by hand in JSON.
function family(path, type, hasChildren) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "home";
  if (type === "post" || /^what-(is|are)-/.test(parts[0])) return "article";
  if (parts[0] === "digital-marketing-services") return "service";
  if (parts.length >= 2) return "cityService";
  if (hasChildren) return "cityHub";
  return "generic";
}

const uploads = new Set();
const UP_RE = new RegExp(`${WP.replace(/[.]/g, "\\.")}/wp-content/uploads/[^\\s"'<>),]+`, "g");

function localize(str) {
  for (const u of str.match(UP_RE) ?? []) uploads.add(u);
  return str.replace(UP_RE, (u) => u.replace(`${WP}/wp-content`, "")).replaceAll(WP, "");
}

// Absolute URLs (canonical, og:*, JSON-LD): WP -> SITE, uploads -> /uploads, keep absolute for crawlers.
function toSite(str) {
  for (const u of str.match(UP_RE) ?? []) uploads.add(u);
  return str.replaceAll(`${WP}/wp-content/uploads/`, `${WP}/uploads/`).replaceAll(WP, SITE);
}

// Elementor keeps layout (grid columns, widths, backgrounds, ...) in post-<id>.css, not in the HTML.
// Keep a whitelist per element as flat "part prop@breakpoint" keys; templates decide what to use.
const CSS_PARTS = { "": "", ".e-con": "", ".elementor-element": "", ":not(.elementor-motion-effects-element-type-background)": "", "::before": "::before",
  ".elementor-headline": "headline", ".elementor-headline-plain-text": "plain", ".elementor-headline-dynamic-text": "dynamic",
  ".elementor-heading-title": "title", ".elementor-icon-box-title": "boxtitle", ".elementor-headline-dynamic-wrapper path": "marker", img: "img", a: "a" };
const CSS_PROPS = /^(--display|--align-self|--(row-|column-)?gap|--e-con-grid-template-columns|--flex-direction|--flex-wrap|--width|--content-width|--padding-(top|bottom|left|right)|--margin-(top|left)|--min-height|--justify-content|--align-items|--overlay-opacity|--dynamic-text-color|border-(width|color)|background-(color|image|position|size)|color|font-(size|weight)|line-height|letter-spacing|stroke|text-align|margin|width)$/;
const CSS_MEDIA = { "": "", "(min-width:768px)": "@min768", "(max-width:1366px)": "@laptop", "(max-width:1024px)": "@tablet",
  "(max-width:767px)": "@mobile", "(max-width:1366px)and(min-width:768px)": "@laptop-tablet" };

async function elementorLayout(id) {
  const res = await get(`${WP}/wp-content/uploads/elementor/css/post-${id}.css`).catch(() => null);
  if (!res) return undefined;
  const layout = {};
  let media = "";
  // Tokens: "@media(...){", "selector{decls}", or the "}" closing a media block (Elementor never nests them).
  for (const [, open, sels, body] of (await res.text()).matchAll(/(@media[^{]*)\{|([^{}]+)\{([^{}]*)\}|\}/g)) {
    if (open || !sels) { media = open ? open.slice(6).replace(/\s+/g, "") : ""; continue; }
    for (const sel of sels.split(",")) {
      const [, el, part] = sel.trim().match(/\.elementor-element-([0-9a-f]+)\s*(.*)$/) ?? [];
      const bp = CSS_MEDIA[media];
      if (!el || !(part in CSS_PARTS) || bp === undefined) continue;
      for (const decl of body.split(";")) {
        const [prop, ...v] = decl.split(":");
        if (CSS_PROPS.test(prop.trim())) (layout[el] ??= {})[`${CSS_PARTS[part]} ${prop.trim()}${bp}`.trim()] = localize(v.join(":").trim());
      }
    }
  }
  return layout;
}

async function pool(items, n, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: n }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}

const pages = (await getAll("pages")).map((p) => ({ ...p, type: "page" }));
const posts = (await getAll("posts")).map((p) => ({ ...p, type: "post" }));
const redirects = [];
const parents = new Set(pages.map((p) => p.parent));
console.log(`${pages.length} pages, ${posts.length} posts`);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

await pool([...pages, ...posts], 4, async (item) => {
  const path = new URL(item.link).pathname;
  const res = await get(item.link, 4, "manual");
  if (res.status >= 300 && res.status < 400) {
    // WP (Rank Math) redirects this page elsewhere: keep the redirect, not the page.
    const to = new URL(res.headers.get("location"), WP);
    redirects.push({ source: path, destination: to.origin === WP ? to.pathname + to.search : to.href, permanent: res.status === 301 || res.status === 308 });
    return;
  }
  const head = parseHead(await res.text());
  const html = localize(item.content.rendered).replace(/<script[\s\S]*?<\/script>/g, "");
  const doc = {
    path,
    type: item.type,
    wpId: item.id,
    family: family(path, item.type, parents.has(item.id)),
    wpTemplate: item.template,
    title: decode(item.title.rendered),
    date: item.date_gmt,
    modified: item.modified_gmt,
    seo: {
      title: head.title,
      canonical: head.canonical && toSite(head.canonical),
      meta: head.meta.map(([k, v]) => [k, toSite(v)]),
    },
    jsonLd: JSON.parse(toSite(JSON.stringify(head.jsonLd))),
    html,
  };
  if (doc.family === "article") doc.layout = await elementorLayout(item.id);
  const file = path === "/" ? "index" : path.replace(/^\/|\/$/g, "").replaceAll("/", "__");
  await writeFile(`${OUT}/${file}.json`, JSON.stringify(doc, null, 2) + "\n");
});

redirects.sort((a, b) => a.source.localeCompare(b.source));
await writeFile("content/redirects.json", JSON.stringify(redirects, null, 2) + "\n");
console.log(`${redirects.length} pages redirect elsewhere -> content/redirects.json`);

console.log(`downloading ${uploads.size} images`);
let failed = 0;
await pool([...uploads], 8, async (u) => {
  const dest = "public" + decodeURIComponent(new URL(u).pathname).replace("/wp-content", "");
  try {
    await access(dest);
    return; // already downloaded
  } catch {}
  const res = await get(u).catch((e) => console.warn(`  ${e.message}`, failed++));
  if (!res) return;
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
});
console.log(`done${failed ? `, ${failed} images failed` : ""}`);

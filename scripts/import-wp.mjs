// Pulls every WordPress page/post into content/pages/*.json and images into public/uploads/.
// Re-runnable: overwrites generated files. Usage: node scripts/import-wp.mjs
import { mkdir, writeFile, rm, access } from "node:fs/promises";
import { dirname } from "node:path";
import { parse } from "node-html-parser";
import { decode, parseHead } from "./wp-head.mjs";
import { extractHome } from "./extract-home.mjs";
import { kitVars, pageCss, staticWidgets } from "./elementor-css.mjs";
import { iconCss, loadIconFonts } from "./icon-fonts.mjs";

const WP = "https://powderblue-gaur-774652.hostingersite.com";
// Final production domain. Canonicals/OG URLs are rewritten from WP to this. Change at cutover.
const SITE = process.env.SITE_URL ?? WP;
const OUT = "content/pages";

// Hostinger 5xx's under load and resets connections mid-body (ECONNRESET): retry with backoff.
// The body is buffered inside the retry so a reset during download is retried too.
async function get(url, tries = 4, redirect = "follow") {
  for (let i = 1; ; i++) {
    const res = await fetch(url, { redirect, signal: AbortSignal.timeout(90_000) })
      .then(async (r) => new Response(await r.arrayBuffer(), r))
      .catch((e) => ({ ok: false, status: e.name }));
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
  // Bare origin (href="https://wp-host") is a homepage link: "/" not "" (which would link to the page itself).
  return str.replace(UP_RE, (u) => u.replace(`${WP}/wp-content`, "")).replaceAll(`${WP}"`, '/"').replaceAll(WP, "");
}

// Absolute URLs (canonical, og:*, JSON-LD): WP -> SITE, uploads -> /uploads, keep absolute for crawlers.
function toSite(str) {
  for (const u of str.match(UP_RE) ?? []) uploads.add(u);
  return str.replaceAll(`${WP}/wp-content/uploads/`, `${WP}/uploads/`).replaceAll(WP, SITE);
}

// The rendered page's footer: null if WP shows none; otherwise its per-page link sections
// (Rank Math "Manual Footer Internal Links", e.g. "Digital Marketing Cities"), often empty.
function footer(page) {
  const dom = parse(page);
  if (!dom.querySelector('[data-elementor-type="footer"]')) return null;
  const sections = dom.querySelectorAll(".mfilm-footer-links__section").map((s) => ({
    heading: s.querySelector(".mfilm-footer-links__heading")?.text.trim() ?? "", // some sections have none
    links: s.querySelectorAll(".mfilm-footer-links__nav a").map((a) => [a.text.trim(), localize(a.getAttribute("href"))]),
  }));
  return { sections };
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

// WP (Rank Math) redirects this URL elsewhere: keep the redirect. Returns true if it redirected.
function addRedirect(path, res) {
  if (res.status < 300 || res.status >= 400) return false;
  const to = new URL(res.headers.get("location"), WP);
  redirects.push({ source: path, destination: to.origin === WP ? to.pathname + to.search : to.href, permanent: res.status === 301 || res.status === 308 });
  return true;
}

// Header/footer links that aren't WP pages but redirect on WP (e.g. menu "Contact Us" -> /contact/).
const CHROME_LINKS = ["/contact/"];
// Images used only as Elementor CSS backgrounds (footer, homepage sections), so they never show up in page content.
const CSS_UPLOADS = [
  "2025/08/BG-013.jpg", // footer
  "2026/01/ChatGPT-Image-Jan-13-2026-12_09_59-PM.png", // home: AI visibility, FAQ
  "2025/08/BG-014.jpg", // home: process card
  "2025/08/BG-011.jpg", // home: testimonials heading
  "2025/08/Asset-045.png", // home: closing CTA
];
for (const f of CSS_UPLOADS) uploads.add(`${WP}/wp-content/uploads/${f}`);
for (const path of CHROME_LINKS) addRedirect(path, await get(WP + path, 4, "manual"));

// Elementor CSS values for GenericPage (see scripts/elementor-css.mjs). Kit 21 = site-wide globals.
const CSS = `${WP}/wp-content/uploads/elementor/css`;
const kitCss = kitVars(await (await get(`${CSS}/post-21.css`)).text(), localize);
await loadIconFonts(WP, get);
const elementorCss = async (html) => {
  const ids = [...new Set([...html.matchAll(/data-elementor-id="(\d+)"/g)].map((m) => m[1]))];
  const parts = await Promise.all(ids.map((id) => get(`${CSS}/post-${id}.css`).then((r) => r.text()).catch(() => "")));
  return kitCss + iconCss(html) + parts.map((c) => pageCss(c, localize)).join("");
};

await pool([...pages, ...posts], 4, async (item) => {
  const path = new URL(item.link).pathname;
  const res = await get(item.link, 4, "manual");
  if (addRedirect(path, res)) return;
  const page = await res.text();
  const head = parseHead(page);
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
    footer: footer(page),
  };
  if (doc.family === "home") doc.home = extractHome(html, localize);
  if (doc.family === "generic") {
    doc.html = staticWidgets(html);
    doc.layoutCss = await elementorCss(html);
  }
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

// SEO parity gate: compares WP live <head> with the Next build for every page.
// Usage: npm run build && npm start   (other terminal)
//        node scripts/check-seo.mjs [--family service] [--base http://localhost:3000]
import { readdirSync, readFileSync } from "node:fs";
import { parseHead } from "./wp-head.mjs";

const WP = "https://powderblue-gaur-774652.hostingersite.com";
const arg = (n) => process.argv[process.argv.indexOf(`--${n}`) + 1];
const BASE = process.argv.includes("--base") ? arg("base") : "http://localhost:3000";
const FAMILY = process.argv.includes("--family") ? arg("family") : null;

const pages = readdirSync("content/pages")
  .map((f) => JSON.parse(readFileSync(`content/pages/${f}`, "utf8")))
  .filter((p) => !FAMILY || p.family === FAMILY);

// Bot UA so Next renders metadata in <head> instead of streaming it.
const UA = { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" };
const SITE = new URL(JSON.parse(readFileSync("content/pages/index.json", "utf8")).seo.canonical).origin;
// Origins differ by design (WP staging vs final domain vs localhost); uploads moved to /uploads.
const norm = (s) =>
  s?.replaceAll(`${WP}/wp-content/uploads/`, "/uploads/").replaceAll(WP, "").replaceAll(SITE, "").replaceAll(BASE, "");

async function head(url) {
  let res;
  for (let i = 0; i < 3 && !res?.ok; i++) // WP host is flaky under load
    res = await fetch(url, { headers: UA }).catch(() => null);
  if (!res) throw new Error(`fetch failed ${url}`);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const h = parseHead(await res.text());
  const meta = {};
  for (const [k, v] of h.meta) (meta[k] ??= []).push(norm(v));
  return { title: h.title, canonical: norm(h.canonical), meta, jsonLd: norm(JSON.stringify(h.jsonLd)) };
}

let bad = 0;
for (const p of pages) {
  const [wp, next] = await Promise.all([head(WP + p.path), head(BASE + p.path)]).catch((e) => [e]);
  if (wp instanceof Error) {
    console.log(`✗ ${p.path}\n    ${wp.message}`);
    bad++;
    continue;
  }
  const diffs = [];
  for (const k of ["title", "canonical", "jsonLd"])
    if (wp[k] !== next[k]) diffs.push(`${k}:\n      wp:   ${wp[k]?.slice(0, 200)}\n      next: ${next[k]?.slice(0, 200)}`);
  for (const k of new Set([...Object.keys(wp.meta), ...Object.keys(next.meta)]))
    if (JSON.stringify(wp.meta[k]) !== JSON.stringify(next.meta[k]))
      diffs.push(`${k}: wp=${JSON.stringify(wp.meta[k])} next=${JSON.stringify(next.meta[k])}`);
  if (diffs.length) {
    bad++;
    console.log(`✗ ${p.path}\n    ${diffs.join("\n    ")}`);
  }
}
console.log(`\n${pages.length - bad}/${pages.length} pages match`);
process.exitCode = bad ? 1 : 0;

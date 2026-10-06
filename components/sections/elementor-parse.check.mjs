// Parser self-check: every widget closes and the widgets hold all of the page's text (nothing dropped).
// Usage: node components/sections/elementor-parse.check.mjs [family]   (default: article)
import { readdirSync, readFileSync } from "node:fs";
import { parse } from "./elementor-parse.ts";

const family = process.argv[2] ?? "article";
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const widgets = (blocks) => blocks.flatMap((b) => (b.kind === "widget" ? [b] : widgets(b.children)));

let bad = 0, n = 0;
for (const f of readdirSync("content/pages")) {
  const page = JSON.parse(readFileSync(`content/pages/${f}`, "utf8"));
  if (page.family !== family) continue;
  n++;
  const ws = widgets(parse(page.html));
  const unclosed = ws.filter((w) => w.html === undefined).length;
  if (unclosed || text(ws.map((w) => w.html ?? "").join(" ")) !== text(page.html)) {
    bad++;
    console.log(`✗ ${page.path}${unclosed ? ` (${unclosed} unclosed widgets)` : " (text outside widgets)"}`);
  }
}
console.log(`${n - bad}/${n} ${family} pages parse completely`);
process.exitCode = bad ? 1 : 0;

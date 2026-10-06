// Icon fonts that WP loads from the "icon-element" plugin (Ionicons, Material Icons, Metrize, Phosphor Light,
// WPPageBuilder). For a page, returns CSS with @font-face (fonts self-hosted under /uploads/icon-fonts/) plus
// only the glyph rules for icon classes that page uses. Icon sets WP never loads (Elegant, Themify) stay blank, as on WP.
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "/wp-content/plugins/icon-element/assets/";
const SHEETS = ["ionicons/css/ionicons.css", "material-icons/css/material-icons.css", "metrize/metrize.css", "phosphor-light/phosphor-light.css", "wppagebuilder/wppagebuilder.css"];

let sheets; // [{ fontFace, base: [rule], glyphs: Map(class -> rule) }]
export async function loadIconFonts(WP, get) {
  sheets = await Promise.all(
    SHEETS.map(async (path) => {
      const url = WP + BASE + path;
      const css = (await (await get(url)).text()).replace(/\/\*[\s\S]*?\*\//g, "");
      const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => [m[1].trim(), m[2].trim()]);
      const [, ffBody] = rules.find(([s]) => s === "@font-face");
      // Prefer woff2, else woff; download it once.
      const font = [...ffBody.matchAll(/url\(["']?([^"')?#]+)[^)]*\)\s*format\(["']?(woff2?)["']?\)/g)].sort((a, b) => b[2].length - a[2].length)[0];
      const src = new URL(font[1], url).href;
      const local = `/uploads/icon-fonts/${src.split("/").pop()}`;
      await mkdir("public/uploads/icon-fonts", { recursive: true });
      await writeFile("public" + local, Buffer.from(await (await get(src)).arrayBuffer()));
      const family = ffBody.match(/font-family:\s*([^;]+)/)[1];
      const fontFace = `@font-face{font-family:${family};src:url("${local}") format("${font[2]}");font-display:block}`;
      const glyphs = new Map();
      const base = [];
      for (const [sel, body] of rules) {
        if (sel === "@font-face") continue;
        if (sel.includes(":before")) for (const m of sel.matchAll(/\.([\w-]+):before/g)) glyphs.set(m[1], `.wp-content .${m[1]}:before{${body}}`);
        else base.push(`${sel.split(",").map((s) => `.wp-content ${s.trim()}`).join(",")}{${body}}`);
      }
      return { fontFace, base, glyphs };
    }),
  );
}

export function iconCss(html) {
  const used = new Set([...html.matchAll(/<i\b[^>]*\sclass="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)));
  return sheets
    .map(({ fontFace, base, glyphs }) => {
      const rules = [...used].filter((c) => glyphs.has(c)).map((c) => glyphs.get(c));
      return rules.length ? fontFace + base.join("") + rules.join("") : "";
    })
    .join("");
}

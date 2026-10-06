// node scripts/elementor-css.test.mjs — checks the Elementor CSS filter against WP's real-world quirks.
import assert from "node:assert/strict";
import { pageCss, staticWidgets } from "./elementor-css.mjs";

const css = `.a{color:red;transition:all 1s} \n @media (max-width:767px){ .b{x:1} @media (min-width:300px){ .c{y:2} } }
/* comment */ .d{text-align:{{VALUE}};z:3} @keyframes k{from{a:1}to{a:2}} .e{background:url("https://wp/x.png");font-family:"DM Sans", Sans-serif}`;
const out = pageCss(css, (u) => u.replace("https://wp", "/uploads"));
assert.equal(
  out,
  '.a{color:red}.d{z:3}.e{background:url("/uploads/x.png");font-family:var(--font-display), Sans-serif}' +
    "@media (max-width:767px){.b{x:1}}@media (max-width:767px) and (min-width:300px){.c{y:2}}",
);
assert.equal((out.match(/\{/g) ?? []).length, (out.match(/\}/g) ?? []).length);

assert.equal(
  staticWidgets('<span class="elementor-counter-number" data-to-value="15000" data-delimiter=",">0</span>'),
  '<span class="elementor-counter-number" data-to-value="15000" data-delimiter=",">15,000</span>',
);
console.log("elementor-css: ok");

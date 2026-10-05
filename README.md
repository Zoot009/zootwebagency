# Zoot Web Agency

The WordPress site (https://powderblue-gaur-774652.hostingersite.com) rebuilt in Next.js 16.
Team rules are in [CLAUDE.md](CLAUDE.md). Claude Code loads that file automatically.

## Setup
```
npm install
npm run dev            # http://localhost:3000
```
Content (`content/`) and images (`public/uploads/`) are already in the repo. Run `npm run import` only to
pull fresh content from WordPress. It overwrites `content/pages/*.json` (about 5 minutes).

## Scripts
| Command | What it does |
|---|---|
| `npm run import` | WordPress → `content/pages/*.json`, `content/redirects.json`, `public/uploads/` |
| `npm run check-seo -- [--family X] [--base URL]` | Compares every page's SEO tags + JSON-LD with live WP (needs `npm start` running) |

## Starter prompt
Each developer pastes this into Claude Code as the first message, with their family filled in:

```
I own the <FAMILY> family in this WordPress → Next.js migration (see the Ownership table in CLAUDE.md).

1. Read CLAUDE.md, lib/content.ts, app/[[...slug]]/page.tsx and components/templates/<Template>.tsx.
2. List every page in my family (grep the "family" field in content/pages/*.json) and tell me how many.
3. Open 3 representative pages: fetch each live WP URL and read its content/pages JSON. Write down the
   section structure they share (hero, intro, features, FAQ, CTA, ...) and how the sections differ
   between pages.
4. Propose a plan: the template layout, which sections become components in components/sections/,
   and whether any content should be extracted into structured JSON fields by scripts/import-wp.mjs.
   Stop and wait for my approval before writing code.

After I approve: build the template in Tailwind to match the live design (mobile + desktop). Keep the
copy, headings, links, and alt text exactly as they are. Then run lint, build, and
`npm run check-seo -- --family <FAMILY>`, and list any pages in my family that still render
differently from WordPress.
```

| Person | `<FAMILY>` | `<Template>` |
|---|---|---|
| A | `home` and `generic`, plus header/footer in `app/layout.tsx` and design tokens in `app/globals.css`. **Start first**: the others reuse your header, footer, and tokens. | `Home.tsx`, `GenericPage.tsx` |
| B | `service` | `Service.tsx` |
| C | `cityHub` and `cityService` | `CityHub.tsx`, `CityService.tsx` |
| D | `article` | `Article.tsx` |

Next prompt, for each later session: *"Continue the <FAMILY> template. Check which pages in my family
still differ from the live site and fix the next one. Follow CLAUDE.md."*

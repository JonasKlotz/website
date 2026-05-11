# CLAUDE.md — jonasklotz.com

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
- Skill name: `frontend-design:frontend-design`

---

## Project Status (last updated 2026-05-11)

**Personal academic website for Jonas Klotz** — PhD student at BIFOLD / TU Berlin, Remote Sensing × XAI researcher.

### Stack
- **Astro 4** (static site) + **Tailwind CSS v3** + `@astrojs/tailwind`
- Fonts: Crimson Text (display serif) + Plus Jakarta Sans (body) + JetBrains Mono (labels/badges)
- Accent color: `#CA8A04` amber — matches thomasfel.fr palette
- Background: `#f9f9f7` (warm off-white)
- Dev: `npm run dev` → http://localhost:4321

### One-command workflow
```bash
./site.sh dev       # start dev server (hot reload)
./site.sh build     # compile to dist/
./site.sh preview   # build + local preview
./site.sh deploy    # git commit + push → Cloudflare Pages auto-deploys
```

### Deployment
- **Cloudflare Pages** (not yet set up — still local)
- **Domain**: jonasklotz.com at All-Inkl (DNS not yet delegated to Cloudflare)
- To go live: create GitHub repo → connect to Cloudflare Pages (build: `npm run build`, output: `dist`) → add custom domain → change nameservers in All-Inkl KAS panel to Cloudflare's two NS records

### Screenshot workflow (Linux)
- Dev server runs at **port 4321** (Astro default), NOT 3000
- `node screenshot.mjs http://localhost:4321` → saves to `temporary screenshots/screenshot-N.png`
- To trigger all scroll-reveal animations before screenshotting, scroll through the page in puppeteer first (see existing screenshot scripts in this session)
- Puppeteer is installed as a devDependency (`npm run dev` also installs it)

---

## File Map

```
src/
  layouts/Base.astro          ← <head>, fonts, ember canvas, scroll-reveal script
  styles/global.css           ← all CSS: variables, ember, pub-entry, project-card, link-btn etc.
  pages/index.astro           ← main page: Hero + Publications + Projects
  pages/404.astro
  components/
    Nav.astro                 ← fixed top nav, glassmorphism bg
    Hero.astro                ← portrait + bio + social links
    Section.astro             ← reusable section wrapper (heading + slot)
    PublicationCard.astro     ← 3-col grid: left(badge+figure) | divider | content
    ProjectCard.astro         ← card with image + body
  content/
    config.ts                 ← Zod schemas for publications + projects
    publications/             ← one .md per paper
    projects/                 ← one .md per project
public/
  images/
    portrait.jpg              ← 460×460 JPEG from old site
    landsealing.png           ← project image
    chessvision.gif           ← project image (3.8MB animated GIF)
  favicon.svg                 ← JK monogram, navy
```

---

## Design System

### Colors (CSS variables in global.css)
```css
--amber: 202, 138, 4          /* #CA8A04 — primary accent, badges, links, embers */
--primary: rgb(var(--amber))
--primary-bg: rgba(var(--amber), 0.12)
--ink: #111110               /* text */
--ink-muted: #52524e
--ink-faint: #8f8f8a
--surface: #f9f9f7            /* page background */
--line: #e8e8e4               /* borders/dividers */
```

### Key CSS classes
- `.conf-badge` — amber rounded-0 monospace badge (venue abbreviation)
- `.pub-entry` — 3-col publication card (`1fr 2.5rem 3fr` on lg)
- `.pub-conf-label` — vertical rotated venue text (desktop only)
- `.pub-figure-placeholder` — hatched stripe pattern for missing paper figures
- `.stripe-block` — repeating-linear-gradient 315° hatching, bg-fixed
- `.project-card` — white card with amber hover border + lift shadow
- `.link-btn` — amber outlined monospace pill button
- `.embers-shell` / `.embers-canvas` — fixed canvas panels (shown ≥1100px)
- `.reveal` — opacity:0 → visible on IntersectionObserver (threshold 0.08)

### Typography
- Headings: `font-display` = Crimson Text, `letter-spacing: -0.03em`
- Body: `font-sans` = Plus Jakarta Sans, `line-height: 1.78`
- Labels/badges: `font-mono` = JetBrains Mono, `letter-spacing: 0.08em; text-transform: uppercase`

---

## Content — Publications Schema
```ts
// src/content/config.ts
title, authors[], venue, year,
arxiv? (url), venueUrl? (url), code? (url),
bibtex?, abstract?, image?, featured?
```
- Authors: write "Jonas Klotz" in full — component bolds it automatically
- `venue` short name: last token used as badge (e.g. "IEEE JSTARS" → "JSTARS")
- Currently 4 real papers; NO arxiv/venue URLs yet — user needs to add them

## Content — Projects Schema
```ts
title, summary, image?, link (url, required), repo? (url), year
```
- Currently: Land Sealing Dataset + Chess Vision
- `link` and `repo` both point to generic github.com/JonasKlotz — update with real URLs

---

## What Still Needs Real Content

1. **Paper links** — edit `src/content/publications/*.md`, add `arxiv:` and/or `venueUrl:` for each paper
2. **Paper figure images** — add `image: "/images/fig-fedx.png"` etc. to pub `.md`; drop PNG/JPEG in `public/images/`
3. **Project-specific GitHub URLs** — update `link:` + `repo:` in `src/content/projects/chessvision.md` and `land-sealing.md`
4. **Go live** — create GitHub repo, connect to Cloudflare Pages, delegate DNS from All-Inkl

---

## Reference Design
- thomasfel.fr is the visual reference (same fonts, amber palette, pub card layout, firefly embers)
- His CSS lives at `https://thomasfel.fr/assets/index-DaM3EoIP.css` for reference

---

## Screenshot / Server Notes
- The CLAUDE.md originally mentioned Puppeteer at Windows paths — this is a Linux machine, ignore those paths
- `screenshot.mjs` uses standard npm puppeteer (installed as devDependency)
- `serve.mjs` serves `dist/` at port 3000 (for production-build previews)
- For design iteration: use `npm run dev` (port 4321) not serve.mjs

---

## Frontend Design Rules (preserved)

### Reference Images
- Match layout, spacing, typography, color exactly. No improvements.
- Screenshot → compare → fix → re-screenshot. Minimum 2 rounds.

### Anti-Generic Guardrails
- **Colors:** Never default Tailwind palette. Brand color: `#CA8A04` amber.
- **Shadows:** Layered, color-tinted. Never flat `shadow-md`.
- **Typography:** Display serif + clean sans + mono for labels. Tight heading tracking.
- **Animations:** Only `transform` and `opacity`. Never `transition-all`. Spring easing.
- **Interactive states:** hover + focus-visible + active on every clickable element.
- **Grain:** SVG noise filter overlay on body (`body::before`).
- **Depth:** embers z:0 → content z:1 (content wrapper must have `background-color` to block embers).

### Hard Rules
- No `transition-all`
- No default Tailwind blue/indigo as primary
- No sections not in the reference design

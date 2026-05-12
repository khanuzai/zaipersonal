# zai.personal — Project Brief

**Project:** zai.personal — Abdullah Khan's personal portfolio
**Stack:** Next.js 14, TypeScript, Tailwind, Framer Motion, Canvas API, pnpm
**Deploy target:** Custom personal domain (NOT Vercel-specific)

---

## THE VIBE — never forget this

Gotham city at 2am. Dark, cinematic, architectural. Batman/Toronto hybrid theme. The site should feel like an origin story — someone the world doesn't fully know yet but is about to. Never colourful. Never loud. Never generic. Every decision should feel intentional and cold.

---

## COLOURS

- Background: `#080808`
- Primary text: `#F0F0F0`
- Muted text: ~40% opacity white
- Accent: cold dark navy blue (`#0D1B2A` range) used sparingly
- **Never add new colours without being told to**

---

## FONTS

- Headings/architectural text: Geist Mono
- Body: Geist Sans
- **Never use Times New Roman or any serif**

---

## SITE STRUCTURE — multi-page routing

The site uses Next.js App Router with separate routes. No single-page scroll. Each nav item is its own page.

```
/           → Landing (Hero only — skyline, rain, spotlight, ZAI + name block)
/about      → About section
/experience → Experience timeline
/projects   → Projects (placeholder)
/resume     → Resume (placeholder)
/friends    → Friends (placeholder)
/gallery    → Gallery (placeholder)
/quotes     → Quotes (placeholder)
/media      → Media (placeholder)
/links      → Links (placeholder)
```

---

## GLOBAL LAYOUT — app/layout.tsx handles all of these

These appear on every page automatically. Never add them to individual pages:

- `Nav` — ZAI top left (links to `/`), page links top right with active state via `usePathname()`
- `GrainOverlay` — film grain, always on
- `RainCanvas` — rain on every page, always on
- `CustomCursor` — dot + ring cursor, always on
- `PixelCursorTrail` — pixel trail effect, always on
- `GlobalSpotlight` — spotlight cursor: `r:250, b:0.12` on `/`; `r:200, b:0.08` on all other pages. Color `#B8D4E8` always.
- `PageTransition` — Framer Motion `AnimatePresence mode="wait"`, 0.4s opacity fade on every route change
- `SmoothScroll` — always on

---

## LOADING SCREEN

- "A ZAI PRODUCTION" with faint bat signal SVG
- Plays on first visit to `/` only, once per session (sessionStorage gate: `zai_loaded`)
- Never plays on sub-pages
- Never plays again during same session

---

## LANDING PAGE — `/` — locked, do not touch unless told

- `Hero.tsx` — full viewport, Toronto skyline photo (`public/JTwYnws.png`) as background
- ZAI spread full width via flex justify-between at `clamp(72px, 15vw, 230px)`
- ABDULLAH KHAN beneath, thin and tracked
- CS / BBA @ Waterloo · Builder · Toronto subtitle
- Social links row: GitHub, LinkedIn, Twitter, Email
- Horizontal rule that draws in from left on load
- No scroll indicator (site is multi-page, not scroll-based)
- Bat signal beam removed — darkness only
- Rain, grain, spotlight inherited from layout

---

## PAGE TEMPLATE — for all sub-pages

Each sub-page has:
- `min-h-screen` with `bg-void` from body
- Ghost number watermark: `clamp(180px, 30vw, 420px)` Geist Mono, `rgba(240,240,240,0.034)`, absolutely centered
- Section label: 10px Geist Mono, `rgba(240,240,240,0.28)`, `tracking-[0.38em]`, uppercase

Numbers: About=01, Experience=02, Projects=03, Resume=04, Friends=05, Gallery=06, Quotes=07, Media=08, Links=09

---

## SECTION STATUS

- ✅ Landing (`/`) — DONE
- ✅ About (`/about`) — DONE — bio sentence, marquee, vertical line, ghost watermark, GSAP word reveal
- ✅ Experience (`/experience`) — DONE — timeline, 4 entries, GSAP scroll-driven animations
- ⬜ Projects — placeholder
- ⬜ Resume — placeholder
- ⬜ Friends — placeholder
- ⬜ Gallery — placeholder
- ⬜ Quotes — placeholder
- ⬜ Media — placeholder
- ⬜ Links — placeholder

---

## ANIMATION RULES

- Page transitions: 0.4s opacity fade via `PageTransition.tsx` (Framer Motion AnimatePresence)
- Section entry animations: Framer Motion or GSAP, staggered reveals, triggered on load (not scroll, since each section is its own page)
- Everything feels heavy and cinematic, not bouncy or playful
- Never animate everything at once — stagger reveals

---

## BATMAN RULES — subtle always

- Never literal. Never a Batman logo slapped on something.
- The theme lives in the darkness, the atmosphere, the weight
- Bat signal only in the loading screen (not the hero — beam was removed)
- Quotes section will carry Batman energy through actual quotes

---

## BUILD RULES

- One section at a time. Never build multiple sections at once.
- Perfect each section before moving to the next.
- Never change global layout components unless explicitly told.
- Always ask before making assumptions on content or layout.
- Keep token usage efficient — surgical fixes only, no full rebuilds unless necessary.

# zai.personal — Project Brief

**Project:** zai.personal — Abdullah Khan's personal portfolio
**Stack:** Next.js 14, TypeScript, Tailwind, Framer Motion, Canvas API, GSAP ScrollTrigger, WebGL, pnpm
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
- Resume page exception: pure white `#FFFFFF` background — full visual inversion
- **Never add new colours without being told to**

---

## FONTS

- Headings/architectural text: Geist Mono (`var(--font-geist-mono)`)
- Body: Geist Sans (`var(--font-geist-sans)`)
- Arabic/Urdu script: Noto Naskh Arabic (`var(--font-urdu)`) — loaded via `next/font/google` in layout.tsx
- **Never use Times New Roman or any serif**

---

## SITE STRUCTURE — multi-page routing

The site uses Next.js App Router with separate routes. No single-page scroll. Each nav item is its own page.

```
/           → Landing (Hero — skyline, rain, bat animations, spotlight, ZAI + name block)
/about      → About section
/experience → Experience timeline
/projects   → Projects grid
/resume     → Resume (white inversion — completely different page)
/gallery    → Gallery masonry grid
/friends    → Friends (placeholder)
/media      → Media (placeholder)
/quotes     → Quotes page
/links      → Links (placeholder)
```

---

## GLOBAL LAYOUT — app/layout.tsx handles all of these

These appear on every page automatically. Never add them to individual pages:

- `Nav` — ZAI top left (links to `/`), page links top right. On `/resume`: all text switches to dark navy (`#0D1B2A`) colors
- `GrainOverlay` — film grain, always on. Suppressed on `/resume` (check inside useEffect)
- `RainCanvas` — rain on every page. Suppressed on `/resume`. Opacity reduced to **15%** on `/gallery` only (compositing fix). Full opacity everywhere else
- `CustomCursor` — dot + ring cursor, always on. Suppressed on `/resume`
- `PixelCursorTrail` — pixel trail effect, always on. Suppressed on `/resume`
- `GlobalSpotlight` — spotlight cursor: `r:250, b:0.12` on `/`; `r:200, b:0.08` elsewhere. Color `#B8D4E8`. Suppressed on `/resume`
- `PageTransition` — Framer Motion `AnimatePresence mode="wait"`, 0.4s opacity fade on every route change
- `SmoothScroll` — always on

### Suppression pattern for global components on /resume
All global dark components check `usePathname()`. The suppression check (`if (pathname === "/resume") return;`) must go INSIDE the `useEffect` callback body. The DOM null return (`if (pathname === "/resume") return null;`) goes AFTER all hook declarations. Never put a conditional return before hooks.

---

## LOADING SCREEN

- "A ZAI PRODUCTION" with faint bat signal SVG
- Plays on first visit to `/` only, once per session (sessionStorage gate: `zai_loaded`)
- Never plays on sub-pages
- Never plays again during same session

---

## LANDING PAGE — `/`

- `Hero.tsx` — full viewport, Toronto skyline photo (`public/JTwYnws.png`) as full-height background (`absolute inset-0`, `object-cover`, `objectPosition: "center 109%"` — city anchored at bottom, nudged slightly down)
- Photo brightness: `brightness(0.83) contrast(1.1)`
- Top-fade gradient overlay: `#080808 → transparent` (eliminates hard line at top of photo)
- Left/right edge gradient overlays for lateral vignette
- ZAI spread full width via flex justify-between at `clamp(72px, 15vw, 230px)`
- "abdullah khan" beneath, thin and tracked, color `#B0B0B0`
- "cs @ uwaterloo · bba @ laurier" — 65% opacity
- Rotating scramble-board word (builder/engineer/hacker/etc.) — 65% opacity
- Social links row: GitHub, LinkedIn, **x** (not twitter), Email
- Horizontal rule draws in from left on load
- Urdu signature "عبداللہ خان" — `position: fixed`, bottom-right corner (32px each), Noto Naskh Arabic 21px, 65% off-white opacity. Fades in at 0.8s delay. Like a painter's mark.
- **HeroBatAnimations** — two canvas layers (see Batman section below)
- Rain, grain, spotlight inherited from layout

---

## PAGE TEMPLATE — for all sub-pages (except /resume)

Each sub-page has:
- `min-h-screen` with `bg-void` from body
- Ghost number watermark: `clamp(180px, 30vw, 420px)` Geist Mono, `rgba(240,240,240,0.034)`, centered
- Section label: 10px Geist Mono, `rgba(240,240,240,0.28)`, `tracking-[0.38em]`, lowercase, `position: absolute` top-left

Page numbers (based on nav order):
About=01, Experience=02, Projects=03, Resume=04, Gallery=06, Quotes=08

---

## SECTION STATUS

- ✅ Landing (`/`) — DONE — skyline hero, bat animations, Urdu signature, ZAI, scramble words
- ✅ About (`/about`) — DONE — bio sentence, marquee, vertical line, ghost watermark, GSAP word reveal
- ✅ Experience (`/experience`) — DONE — timeline, entries, GSAP scroll-driven animations
- ✅ Projects (`/projects`) — DONE — 3 cinematic cards, GSAP ScrollTrigger slide-up, hover glow, bold metrics
- ✅ Resume (`/resume`) — DONE — white inversion, WebGL fluid sim, animated download buttons
- ✅ Gallery (`/gallery`) — DONE — CSS masonry columns, 20 placeholder photos (swap-ready array), scroll fade-in, hover captions
- ✅ Quotes (`/quotes`) — DONE — 15 quotes in actual Urdu script + English, GSAP blur-to-focus, radial glow
- ⬜ Friends — placeholder
- ⬜ Media — placeholder
- ⬜ Links — placeholder

---

## RESUME PAGE — `/resume` — special rules

This page is a **full contrast inversion** from the rest of the site. Treat it as its own design system:

- Background: pure white `#FFFFFF` (set via `document.body.style.backgroundColor` in useEffect)
- All global dark overlays suppressed: no rain, no grain, no custom cursor, no pixel trail, no spotlight
- Nav text switches to dark navy (`#0D1B2A`) via `isResume` flag in Nav.tsx
- System cursor restored via `document.body.classList.add("resume-cursor")` + CSS override in globals.css: `body.resume-cursor * { cursor: auto !important; }`
- **WebGL fluid simulation** (`components/ui/fluid-simulation.tsx`) — Navier-Stokes fluid sim, full-page fixed canvas at z:0. Color randomization: new random HSL hue per mousemove, throttled to every 175ms, lerped smoothly between hues (frame-rate independent)
- **AnimatedButton** (`components/ui/animated-button.tsx`) — navy fill hover sweep, Geist Mono font, lowercase labels ("cs resume", "business resume")
- Ghost watermark "04" in `#E0E0E0`
- Section label in dark `rgba(13,27,42,0.40)`

---

## PROJECTS PAGE — `/projects`

- 3 project cards: cinematic dark cards with left border accent on hover
- `boldImpact()` function bolds key metrics/phrases in bullet points
- GSAP ScrollTrigger slide-up entrance per card
- GitHub + live links styled as minimal monospace links
- Description 78% opacity, bullets 70%, tech 60%

---

## GALLERY PAGE — `/gallery`

- CSS `columns: 3 280px` with `columnGap: 12px` — collapses to 2 on tablet, 1 on mobile
- Single `PHOTOS` array at top of `Gallery.tsx` — each entry: `{ src, alt, caption }`. Swap `src` values for real photos
- 20 Unsplash placeholder images, mix of portrait/landscape
- Hover: `brightness(1.1)` + gradient caption overlay fades in (0.3s ease)
- GSAP: each card fades up from `blur(4px), y:32, opacity:0` on scroll, staggered `(i % 3) * 0.08s`
- Ghost watermark "06" at only **1% opacity** — barely there, doesn't compete with photos
- Rain at **15% opacity** on this route only
- "moments worth keeping" header, "and more to come" footer

---

## QUOTES PAGE — `/quotes`

- 15 quotes in exact order — actual Urdu Arabic script (NOT Roman Urdu), 2 in English (Geist Mono)
- Urdu quotes: Noto Naskh Arabic 26px, `direction: rtl`, right-aligned, lineHeight 2.1
- English quotes: Geist Mono 19px, centered
- No quotation marks, no attribution labels — raw words only
- Radial glow (`rgba(240,240,240,0.045)`) behind each quote as it enters
- GSAP: `blur(8px) → blur(0px)` + `opacity 0→1` + `y 50→0`, `power4.out`, triggers at 88% scroll
- 160px gap between quotes (80px above + below the divider)
- Divider: 40px wide, 1px, 8% opacity
- No watermark on this page
- Footer: "— words that stayed" at 30% opacity

---

## BATMAN RULES — updated

- Never literal. Never a Batman logo slapped on something.
- The theme lives in the darkness, the atmosphere, the weight
- **Hero now has live bat animations** (`components/ui/hero-bat-animations.tsx`):
  - **Bat signal sweep** — cold blue-white (`#B8D4E8`) searchlight from bottom-left, sweeps upward across the sky over 9s loop. 5 layered cone passes at 0.04–0.06 opacity each. Clipped to top 56% of hero (sky only). Circular glow at cloud level with an extremely faint bat silhouette (5% opacity) projected onto the clouds. Reduced-motion: static angle
  - **Bat swarm** — 70 bats (25 mobile) emerge from CN Tower area ~850ms after load. Each bat: bezier cubic flight path, sine-wave wing flap, randomized size/speed/direction/delay. Fade in/out + edge attenuation. Repeat every 45–60s with 8–12 bats. Reduced-motion: skipped
  - Layering inside hero: photo (z:1) → bat signal (z:3) → rain (z:5) → bats (z:7) → vignette (z:50) → text (z:60)
- Quotes page carries weight through the actual words

---

## ANIMATION RULES

- Page transitions: 0.4s opacity fade via `PageTransition.tsx`
- Section entry animations: GSAP ScrollTrigger (blur + fade + translate), `power3.out` or `power4.out`
- Everything feels heavy and cinematic, not bouncy or playful
- Never animate everything at once — stagger reveals
- Blur-to-focus reveals are the signature effect for content pages

---

## KEY FILES & COMPONENTS

```
app/layout.tsx              — global layout, font loading (Geist + Noto Naskh Arabic)
app/globals.css             — cursor:none, resume-cursor override, grain keyframes
components/Hero.tsx         — landing page hero
components/Nav.tsx          — navigation, isResume flag
components/Resume.tsx       — white inversion resume page
components/Projects.tsx     — projects grid
components/Gallery.tsx      — masonry photo gallery (PHOTOS array here)
components/Quotes.tsx       — quotes with actual Urdu script
components/GrainOverlay.tsx — suppressed on /resume
components/RainCanvas.tsx   — suppressed on /resume, 15% opacity on /gallery
components/CustomCursor.tsx — suppressed on /resume
components/GlobalSpotlight.tsx — suppressed on /resume
components/ui/fluid-simulation.tsx   — WebGL Navier-Stokes fluid sim (resume page)
components/ui/animated-button.tsx    — hover-fill button (resume page)
components/ui/hero-bat-animations.tsx — bat signal + bat swarm (hero only)
components/ui/pixel-trail.tsx        — suppressed on /resume
lib/utils.ts                — cn() utility (clsx + tailwind-merge)
```

---

## BUILD RULES

- One section at a time. Never build multiple sections at once.
- Perfect each section before moving to the next.
- Never change global layout components unless explicitly told.
- Always ask before making assumptions on content or layout.
- Keep token usage efficient — surgical fixes only, no full rebuilds unless necessary.

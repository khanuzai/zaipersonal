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

## GLOBAL ELEMENTS — never touch unless told

- Film grain overlay (`GrainOverlay.tsx`) — always on
- Custom cursor dot + ring (`CustomCursor.tsx`) — always on
- Smooth scroll — always on
- Loading screen "A ZAI PRODUCTION" with faint bat signal — always on

---

## HERO — locked, do not touch unless told

- ZAI spread full width via flex justify-between at `clamp(72px, 15vw, 230px)`
- ABDULLAH KHAN beneath, thin and tracked
- Real Toronto skyline photo (`public/JTwYnws.png`) as background
- Atmospheric bat signal beam centered above CN Tower, static
- Rain canvas layer, 500+ particles, full coverage
- Nav: Geist Mono, 11px, all caps, all items equally visible, no fading

---

## SECTIONS TO BUILD (in order)

- ✅ Hero — DONE
- About — in progress
- Experience
- Projects
- Resume
- Friends
- Gallery
- Quotes
- Media
- Contact
- Links

---

## ANIMATION RULES

- All sections animate in on scroll using Framer Motion
- Never animate everything at once — stagger reveals
- Scroll-driven timeline line for Experience
- Everything feels heavy and cinematic, not bouncy or playful

---

## BATMAN RULES — subtle always

- Never literal. Never a Batman logo slapped on something.
- The theme lives in the darkness, the atmosphere, the weight
- Bat signal is only in the hero and loading screen
- Quotes section carries Batman energy through actual quotes

---

## BUILD RULES

- One section at a time. Never build multiple sections at once.
- Perfect each section before moving to the next.
- Never change global styles or locked components unless explicitly told.
- Always ask before making assumptions on content or layout.
- Keep token usage efficient — surgical fixes only, no full rebuilds unless necessary.

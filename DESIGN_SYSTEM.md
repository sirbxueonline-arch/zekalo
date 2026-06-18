# Zirva Design System — "Playful & Delightful" (v2)

> **The contract.** Every redesign agent reads this file before touching code. It is the single source of truth for the Zirva visual language. When in doubt, follow this doc over anything you infer from old code.

Zirva is a school-management platform for **students, teachers, parents, and administrators**. The redesign direction is **playful & delightful** (Duolingo / ClassDojo energy), **light theme only**.

---

## 0. The one principle that governs everything

**Playfulness lives in the CHROME. Clarity lives in the DATA.**

- **Chrome** = navigation, empty states, toasts, onboarding, buttons, the student/parent home, hero sections, badges, celebrations. → Warm, rounded, colorful, characterful, animated.
- **Data** = tables, gradebooks, attendance registers, charts, forms, dense lists. → Calm, neutral, dense, fast, legible. **Never decorate inside a gradebook cell.**

This is how a kid-friendly brand stays credible to the principal signing the cheque. ClassDojo proves it: kids see monsters; the teacher's workspace is a clean white app.

### The role dial (memorize this)

| Lever | Student / Parent — HIGH | Teacher — MEDIUM | Admin / Superadmin — LOW |
|---|---|---|---|
| Mascot | Everywhere — greets, reacts, celebrates | Empty states & onboarding only | Logo only; absent from data views |
| Color saturation | Full bright fills, colored panels | Accents + tints on white | Mostly neutral; one brand accent |
| Confetti / celebration | Full burst on wins | Gentle, occasional (class milestone) | None — quiet success toast |
| Corner radius | 20–24px chunky | 16–20px | 12–16px |
| Display type (Baloo 2) | Generous | Headers only | Sparingly |
| Gamification | Streak/XP/badges/leaderboard front & center | Class analytics, not their own score | Aggregated KPIs + charts, exportable |
| Density | Airy, one-thing-per-screen | Comfortable | Compact tables, filters, bulk actions |

**Gamification reframes by role, it never disappears.** A student's XP becomes the teacher's *class engagement chart* and the admin's *school completion KPI*. Same data, grown-up framing up the chain.

---

## 1. Hard rules (do not break)

1. **Preserve all logic.** Do NOT change: Supabase calls, data fetching, `useState`/`useEffect`/hooks, event handlers, routes, props/component APIs, or business logic. This is a **visual & structural** redesign only.
2. **Preserve i18n.** Keep every `t(...)` / `useLang` call and translation key exactly. Never hardcode user-facing strings, and never change the language of existing strings. Public pages are locked to Azerbaijani.
3. **Keep shared class names & component APIs stable.** `liquid-card`, `pastel-input`, `pastel-table`, `pill-*`, `icon-chip`, `btn-pastel`, `<Button>`, `<Card>`, `<StatCard>`, `<Badge>`, `<Modal>`, `<Input>`, `<Table>`, `<EmptyState>`, `<Avatar>` — same names, same props. Their *implementation* is what changes.
4. **Light theme only.** Do not add dark-mode variants.
5. **Respect `prefers-reduced-motion`.** All decorative motion must collapse to opacity/instant.
6. **Don't break the build.** Run `npm run build` after structural changes.

---

## 2. Color tokens

All defined as Tailwind theme colors AND CSS variables (`src/index.css` `:root`). Use Tailwind classes (`text-brand-500`, `bg-mint`) or `var(--brand-500)` in inline styles / CSS.

### Brand (indigo-violet — the evolution of Zirva's periwinkle)
```
--brand-50  #F4F2FF   --brand-100 #ECE9FE   --brand-200 #D9D3FD
--brand-300 #BEB4FA   --brand-400 #9B8CF4   --brand-500 #6C5CE7  (PRIMARY)
--brand-600 #574BD6  (hover / 3D edge)      --brand-700 #4A3FB8   --brand-900 #2A2370
```
Legacy alias `purple.*` is remapped to these (so old `text-purple` still looks right).

### Playful accents — each "owns" a meaning. Use consistently.
```
--grape  #8B5CF6   achievements, badges
--sky    #38BDF8   info, time/speed metrics
--mint   #22C55E   success, accuracy, "good"
--sun    #FACC15   XP, points, coins (gold)
--coral  #FB7185   streak warmth, energy, parent-facing
--flame-from #FF9A3C  --flame-to #FF5A1F   streak fire (gradient)
```

### Semantic
```
success #16A34A  on-tint #15803D  bg #DCFCE7
warning #F59E0B  on-tint #B45309  bg #FEF3C7
danger  #EF4444  on-tint #B91C1C  bg #FEE2E2
info    #3B82F6  on-tint #1D4ED8  bg #DBEAFE
```

### Neutrals (warm off-white canvas — never pure gray/black)
```
--canvas    #F6F6FB   page background
--surface   #FFFFFF   cards / tables sit here (the contrast lifts them)
--surface-2 #FBFBFE   subtle sidebar / zebra / hover wash base
--ink-900   #1E2233   headings (near-black)
--ink-700   #3A3F52
--ink-600   #5A6072   body
--ink-400   #9AA0B0   muted / labels / placeholders
--hairline        #ECEDF3   internal lines / dividers
--hairline-strong #E2E4EC   container edges
```

**Color usage law:** solid saturated fill on **one primary CTA per screen**; everything else white or tinted. In dense data views, color only ever encodes meaning (status pills, threshold text), never decoration.

---

## 3. Typography

Fonts loaded in `index.html` from Google Fonts.
- **Display / headings / big numbers:** `"Baloo 2"` (Tailwind `font-display`). Rounded, friendly. Weights 600–800.
- **Body / UI / tables:** `"Plus Jakarta Sans"` (Tailwind `font-sans`, the default). Weights 400–700. Always `tabular-nums` for numbers in tables/KPIs.

Use Baloo 2 for: hero headlines, page titles, stat-card numbers, streak/XP numbers, celebration text. Use Plus Jakarta everywhere else. Don't set Baloo 2 on body text or table cells — it hurts density.

### Type scale
```
display-xl  40px /1.1  /800   celebration headline
display-lg  30px /1.15 /800   page hero "Welcome, Aysel!"
h1          24px /1.2  /700
h2          20px /1.25 /700
h3          17px /1.3  /600
body        15px /1.55 /400–500
label       13px /1.3  /600   uppercase, letter-spacing .04em  ("TOTAL XP")
caption     12px /1.3  /500   muted (--ink-400)
stat-number 28–44px /1 /800   display font; count-up targets
```
Two-weight discipline in body UI: 400 regular + 600 semibold. Headings 700–800. Sentence case everywhere (no ALL CAPS except the small tracked labels).

---

## 4. Shape & depth

### Radius (Tailwind: `rounded-pill|card-lg|card|tile|input`)
```
pill    9999px   primary buttons, chips, capsules, segmented toggles, avatars
card-lg 24px     hero cards, modals, celebration panels   (student tier)
card    20px     standard cards, stat cards               (default)
tile    16px     icon tiles, list rows, data containers   (teacher tier)
input   12px     text inputs, selects                     (admin tier ~12px)
```
Dial radius DOWN for admin/teacher data surfaces (12–16px), UP for student/parent (20–24px).

### Shadows (Tailwind: `shadow-soft|soft-lg|pop|modal|edge`) — soft & TINTED, never harsh gray
```
soft     0 8px 24px -8px rgba(108,92,231,0.12), 0 2px 6px rgba(31,35,48,0.04)   resting cards
soft-lg  0 16px 40px -12px rgba(108,92,231,0.18), 0 4px 12px rgba(31,35,48,0.05) hover/raised
pop      0 12px 32px -8px rgba(108,92,231,0.22)
modal    0 24px 60px -12px rgba(20,20,50,0.28)
edge     0 4px 0 0 #574BD6     the chunky 3D-button bottom edge (solid, no blur)
```
For a colored card, tint its shadow toward its own hue (gold card → gold-tinted shadow). Data tables/charts get the faintest shadow or just a `1px hairline` border.

### Borders
Mostly borderless + shadow does the lifting. Where used: `1px solid var(--hairline)` for inputs/dividers; **2px brand border** for selected state (with a `brand-100` tint fill). Avoid 1px gray boxes everywhere — that's the spreadsheet tell.

---

## 5. Signature components (recipes)

### The 3D press button — `.btn-3d` (the tactile signature; highest-ROI delight)
Solid darker bottom edge that collapses on press. Already in `index.css`. Use for primary CTAs in chrome/student surfaces. Admin primary buttons may use the flatter `<Button variant="primary">`.

### `<Button>` (`src/components/ui/Button.jsx`)
Keep variants `primary | secondary | ghost | teal | danger` and sizes `sm | md | lg`. Primary = brand fill, pill, bold, subtle press (`active:translate-y-px`/scale .98) + soft shadow. Secondary = white + hairline border. Ghost = transparent + hover tint. Add an optional 3D-edge feel on primary.

### `<Card>` / `.liquid-card`
White surface, `rounded-card` (20px), `shadow-soft`, hover lift `translateY(-4px) + shadow-soft-lg` (gate behind `hover` prop). No more heavy glass blur — clean white with soft tinted shadow. `flat` prop = static, no hover.

### `<StatCard>` (KPI)
White `rounded-card`, padding 20px. Label (13px ink-400 semibold, optional uppercase) + optional tinted icon tile (28–44px, `rounded-tile`, accent-tinted bg + accent glyph). Big number in **Baloo 2**, 28–34px/800, tabular-nums. Optional delta line (mint ↑ / danger ↓ + "vs last term" muted). Each KPI may own a hue (XP gold, time sky, accuracy mint).

### `.pill-*` status pills
Full-radius, `padding 2px 10px`, 12px/600, soft-tint bg + saturated same-hue text + a **6px leading dot**. Variants: mint(success/present), blue/info(excused), peach/warning(late/pending), rose/danger(absent/failed), peri/brand(neutral-brand), muted(draft). This leading-dot pill is the #1 friendly-yet-pro component.

### `.pastel-table` data table
Wrap in white `rounded-tile` (16px) container, `overflow: hidden` so corners clip rows. **No vertical gridlines.** Row height ~52px comfortable / 40px compact. Header: 12px uppercase-optional ink-400 semibold, sticky, bottom hairline. Body rows: hover wash `brand-50` (not zebra). Avatars 28px with hashed-pastel initials fallback. Right-align numbers, tabular-nums. Trailing `⋯` kebab fades in on row hover.

### `.pastel-input` form fields
White bg, `1px hairline` border, `rounded-input` (12px), 40px tall, 14px text. **Label above** (13px ink-700 semibold). Focus → brand border + `0 0 0 3px rgba(108,92,231,0.15)` ring. Error → danger border + ring + message below.

### `.pastel-tabs` / underline tabs
Two patterns: (a) segmented pill group (`bg surface-2`, active = white pill + soft shadow) for view modes; (b) underline tabs (active = ink-900/700 + 2px brand underline) for in-page section switching.

### `.icon-chip`
44px `rounded-tile`, accent-tinted gradient bg + accent glyph. Variants periwinkle/mint/peach/blue (+ add grape/sun/coral). The workhorse "category" element.

### Modals — `.liquid-backdrop`
Overlay `rgba(20,20,50,0.45)` + light blur, modal white `rounded-card-lg` (24px) / `rounded-tile` for admin, `shadow-modal`, header (18px/600 + × close), footer with top hairline + right-aligned Cancel(ghost)+Primary. Multi-step: left numbered stepper (long admin flows) or top 4px progress bar (short wizards). Side-sheet variant (slides from right ~440px) for create/edit-in-context.

### Empty states — `<EmptyState>` (biggest delight lever)
Centered: mascot/illustration (120–160px) → headline (16–18px/600) → one-line muted subcopy → single CTA. **Warm, human copy in Azerbaijani.** Build ~10 reusable variants (no students, no grades, no messages, no events, no-results, filtered-empty, error, offline). Filtered-empty shows one-click "remove filter" chips.

### Skeletons — `.pastel-skeleton`
Skeletons (not spinners) for content regions: gray `#ECEDF3` blocks + shimmer sweep, matching real layout. Radius matches the real element.

### Toasts — `.toast-*`
Bottom-center/left, `rounded-tile`, leading status icon, 14px, optional Undo, auto-dismiss ~4s, slide-up+fade. **Keep success toasts quiet** (no confetti for "grade saved").

---

## 6. Gamification catalog (new primitives in `src/components/ui/`)

Build these as reusable components. Use them on student/parent surfaces (HIGH), reframe as analytics for teacher/admin.

- **`<StreakBadge>`** — flame silhouette (gradient `--flame-from`→`--flame-to`) with day count inside + a 7-dot week strip (done = flame fill + check, today = ring, future = gray). Idle pulse; punch + sparks on increment.
- **`<XPBar>`** — rounded-pill track (`hairline` bg) + gold fill (`linear-gradient(90deg,#FFD43B,#FACC15)`), "120 / 200 XP" label, gold ⚡ cap. Width animates 600ms `ease-out-quint`. Pair with count-up.
- **`<LevelRing>`** — SVG dual-circle progress ring (`hairline` track + `brand-500` arc, round caps, `rotate(-90deg)`), center holds level/number. Animate `stroke-dashoffset` ~800ms.
- **`<AchievementCard>` / `<Badge variant="achievement">`** — colored shield/hexagon + white glyph + "LEVEL n" ribbon; locked = `grayscale(1) opacity(.5)`; in-progress shows "11/20" bar. Earned entrance = pop + slight rotate.
- **`<Leaderboard>` / `<LeaderboardRow>`** — rank (color-coded), avatar, name (+role subtitle), right points; current user row tinted + outlined; optional top-3 podium + "↑ Promotion zone ↑" divider.
- **`<Confetti>`** — celebration overlay (use a normal-flow container, not `position:fixed`). Two intensities: burst (achievement) / gentle drift (goal). Respect reduced-motion.
- **`<Mascot>`** — one friendly SVG character (rounded owl/star/book creature or a Speak-style gradient blob) with poses: waving (welcome), reading (loading), cheering (celebration), thinking (empty), sleeping (no-data), pointing (guidance bubble). Idle bob. Speech-bubble variant for guidance.
- **`<CountUp>`** — animates a number from→to over ~700ms (rAF lerp, ease-out); pair with bars/rings.
- **Avatar fallback** — initials on a pastel bg hashed from the name (fixed palette: pink/indigo/green/amber/sky). Optionally a procedurally-generated "monster" (shape+color+eyes) for students.

---

## 7. Motion

```
--ease-spring     cubic-bezier(.34,1.56,.64,1)   overshoot — pop-in, badges
--ease-out-quint  cubic-bezier(.22,1,.36,1)       fills, lifts, slides
```
- Button press: `translateY(4px)` edge-collapse (80ms) or `scale(.98)`.
- Hover lift (cards): `translateY(-4px) scale(1.01)` + deeper shadow, 150–180ms.
- Pop-in (badges/cards/modals): `pop` keyframe ~360ms spring; stagger children 60–80ms.
- Count-up numbers ~700ms paired with meter fill.
- Progress fill/ring 600–800ms `ease-out-quint` (ring may overshoot +2%).
- Streak flame idle pulse 1.8s; punch on increment.
- Mascot idle bob ±4px, 2.5s.
- Section entrance: fade + rise 8–16px, 300–500ms, staggered, on scroll-into-view (once).
- Confetti 1.5–3s then clear.
- **Budget: 2–3 motion types per section.** Heavy/celebratory motion only on real milestones — never on routine data entry. Always gate behind `prefers-reduced-motion`.

---

## 8. Marketing site (Landing, Features, Solutions, FeaturePage, ZekaAI, InfoPage, Demo)

- **Hero:** split (copy left / joyful character cluster right) OR centered hero floating in a playful scene with floating school-supply objects. Headline 56–72px/800 Baloo 2, tight leading, ≤7 words/line; subhead 18–20px muted; CTA pair (filled pill + ghost/arrow). 2–3 gently-floating decorative shapes at edges.
- **Section rhythm:** alternate white → pale tint → white. Section padding 96–128px desktop / 64px mobile. Container max ~1200px; text columns ~640–720px.
- **Stat band:** flat pastel band (mint/lilac), huge numbers (48–64px/800) + muted labels, count-up on scroll.
- **Audience switcher (Solutions / landing):** tabbed switcher (4 audiences) swapping a content panel, each audience owns an accent color; or a row of 3D-icon audience cards.
- **Feature grid:** bordered pastel cards (rotate accent colors, no two adjacent match) OR bento (one large + several small). Hover lift.
- **How-it-works:** 3 big numbered circles (brand fill) + short steps, connected by a dashed/curved "journey" line + a character.
- **Social proof:** tinted logo-wall band + one large quote card with avatar; or colorful photo-tile mosaic of real educators. Prefer real faces for education.
- **Pricing:** 3 tiers, pastel header band per tier, center tier elevated + "Most popular" pill, monthly/annual toggle with "save" badge, brand check icons. Currency AZN.
- **Big CTA band:** large `rounded-card-lg` brand/gradient panel, centered headline + CTA, floating corner shapes.
- **Footer:** oversized "Zirva" wordmark + multi-column sitemap (group some links by audience) + newsletter + socials + a small waving mascot.
- **Decoration vocabulary (pick ~4, reuse site-wide):** floating dots, sparkle/star bursts, dashed connectors, hand-drawn underlines/squiggles, recurring mascots. Pair playful color with bold dark type/borders to stay credible.

---

## 9. App shell (`components/layout/`)

- **Sidebar** (`248px` expanded, collapsible to `64px` rail): near-white (`surface`/`surface-2`) + right hairline. **Grouped** with tiny uppercase group labels (e.g. `MƏKTƏB`, `AKADEMİK`, `İNSANLAR`, `PARAMETRLƏR`). Item: 36px, `rounded-md`, 14px/500 label + 18–20px rounded icon (ink-600 at rest). Active: `brand-50` wash + brand text/icon + 600 weight (optional 3px left bar). Count badges right-aligned. Footer: role/avatar + a streak/onboarding chip (sanctioned warmth).
- **Topbar** (56–60px, white, bottom hairline): breadcrumbs left (`Sinif 9-A › Jurnal › Riyaziyyat`); global `⌘K` search pill center; right cluster = role-switch pill, notifications bell (accent dot → tabbed popover), 32px avatar menu. Single row, quiet.
- **AppLayout:** fixed sidebar + fixed topbar + scrollable content on `--canvas` with 24–32px padding. Forms/settings max ~880px; tables/dashboards full-bleed within padding.

---

## 10. Charts (Recharts)

- Categorical palette (moderate saturation): brand `#6C5CE7`, mint `#22C55E`, amber `#F59E0B`, sky `#0EA5E9`, pink `#EC4899`, grape `#8B5CF6`. Brand = default single series.
- Bars: `radius={[6,6,0,0]}` (rounded tops), `barSize 28–36`, solid fill.
- Lines: `strokeWidth 2.5`, `dot={false}`, `activeDot r:5`; area = vertical gradient accent 0.18→0 opacity.
- Axes: `axisLine={false} tickLine={false}`, ticks 12px ink-400; only horizontal `CartesianGrid stroke="#F1F2F4" vertical={false}`.
- Tooltip: **always custom** — white, `rounded-lg`, padding 10–12px, `shadow-soft-lg`, no border, bold value + muted label + colored dot. Never the default tooltip.
- Donut: `innerRadius 70%`, `paddingAngle 2`, centered total; legend = vertical dot+label+value list.
- Empty/loading: faint placeholder grid + centered "No data yet", never an empty axis box.

---

## 11. Checklist before finishing any page

- [ ] No logic/data/i18n/route changes; only presentation.
- [ ] Uses tokens & shared classes/components (no stray hardcoded `#534AB7`, no harsh grays).
- [ ] Correct role dial (student HIGH … admin LOW).
- [ ] Playful chrome, calm data — no decoration inside dense tables.
- [ ] Baloo 2 only on headings/numbers; Plus Jakarta for body/tables; tabular-nums on numbers.
- [ ] Friendly empty/loading/error states.
- [ ] Motion respects `prefers-reduced-motion`; budget ≤3 types/section.
- [ ] `npm run build` passes.

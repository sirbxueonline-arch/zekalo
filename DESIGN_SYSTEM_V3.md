# Zirva Design System V3 — The Refined Masterpiece (BINDING)

> **This file supersedes `DESIGN_SYSTEM.md`.** Every redesign agent reads V3 before touching code. When V3 and the old doc disagree, **V3 wins**. The old doc's *philosophy* survives; its *tokens* are being corrected here.

---

## 0. The thesis (read this twice)

Zirva should look like **ClassDojo's management system rebuilt with Brilliant/Duolingo-grade restraint** — friendly and delightful, but **sophisticated, professional, and explicitly NOT childish**. The model is precise:

> **A calm grey-white SaaS skeleton with one confident accent, where ALL the warmth is quarantined into a contained avatar system, illustration, micro-copy, and a handful of earned celebrations — never smeared across the chrome.**

The single insight that separates "premium" from "toy": *childishness is the **stacking** of bubble font + rainbow saturation + huge radii + puffy 3D shadows + glowy blobs + mascots-everywhere — all at once.* Premium-playful products keep the play but **spend it in exactly one place** and keep everything structural sober. ClassDojo proves it (kids see monsters; the principal sees a clean white app). Brilliant proves it (Duolingo's mechanics rendered black-on-white + one accent).

**The governing principle is unchanged:** playful/warm chrome, calm/clean data. **Role dial unchanged:** student/parent = HIGH warmth → teacher = MEDIUM → admin = LOW (calmest, most rigorous). What changes in V3 is the *execution discipline* — we stop letting the tokens betray the principle.

**The verdict in one line:** keep the role dial and the warm-neutral ramp; **kill Baloo 2, kill perpetual motion, kill purple-glow shadows, tighten every radius, flatten the gradient game-buttons (except student gamification), deepen the brand, and contain the mascot.** Do those and Zirva crosses from "cute edtech template" to "the product a principal signs the cheque for."

---

## 1. Hard rules (unchanged from v2 — still binding)

1. **Preserve all logic.** No changes to Supabase calls, hooks, handlers, routes, props/component APIs, business logic. Visual & structural only.
2. **Preserve i18n.** Keep every `t(...)`/`useLang` key. Public pages locked to Azerbaijani. (V3 removal of emoji is the *only* copy edit allowed — strip the emoji **glyph** from a string, never the words.)
3. **Keep shared class names & component APIs stable.** `liquid-card`, `pastel-input`, `pastel-table`, `pill-*`, `icon-chip`, `btn-pastel`, `<Button>`, `<Card>`, `<StatCard>`, `<Badge>`, `<Modal>`, `<Input>`, `<Table>`, `<EmptyState>`, `<Avatar>` — same names/props. Only the *implementation* changes.
4. **Light theme only.**
5. **Respect `prefers-reduced-motion`.**
6. **Don't break the build.** `npm run build` after structural changes.

---

## 2. The refined tokens — OLD → NEW (this is the heart of V3)

### 2.1 Typography — THE VERDICT: replace Baloo 2

**Decision: Baloo 2 is removed as a display/heading font.** It is the single biggest "kids' app" tell in the current build (it is force-applied to *every* `h1/h2/h3` site-wide via the CSS base layer, including admin tables and login titles). Bubble-terminal fonts read toddler. A refined Duolingo/ClassDojo product uses a **friendly grotesque with personality but flat-cut terminals**.

**The two-family system (both free Google Fonts, self-hostable):**

| Role | OLD | NEW | Where used |
|---|---|---|---|
| **Display / headings / hero / celebration / big numbers** | `"Baloo 2"` 600–800 | **`"Bricolage Grotesque"`** 600/700/800 | Hero headlines, page titles (`h1/h2`), celebration text, KPI/stat numbers, streak/XP numbers, the wordmark. Tight tracking `-0.02em` at large sizes. Contemporary grotesque — warm and characterful, *zero* bubble rounding. |
| **Body / UI / tables / labels / forms** | `"Plus Jakarta Sans"` 400–700 | **`"Plus Jakarta Sans"`** 400/500/600/700 (KEEP) | Everything else. It is genuinely premium, has subtle humanist warmth, and you already load it. Keep two-weight discipline (400 + 600). Always `tabular-nums` in tables/KPIs. |

> **Why Bricolage Grotesque over the alternatives.** It carries the most "friendly-but-grown-up" personality of the safe choices — it reads like Cal.com / modern-grotesque energy, which is exactly the "delightful yet sophisticated" target. **Fallbacks in priority order if you want to swap:** `General Sans` (slightly more neutral/humanist), then `Plus Jakarta Sans 800` itself (the zero-risk option — drop the separate display face entirely and just go heavier). **Do NOT use** Fredoka, Baloo, Quicksand, Comfortaa, Nunito-heavy, Poppins-bold-everywhere — all rounded-terminal = childish.

**`@import` / `<link>` change (index.css line 1):**
```
OLD: family=Baloo+2:wght@500;600;700;800&family=Plus+Jakarta+Sans:...
NEW: family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap
```

**CSS base-layer fix (index.css line 12) — the most important single change:**
```
OLD: h1, h2, h3, .font-display { font-family: '"Baloo 2"', 'Plus Jakarta Sans', system-ui, sans-serif; }
NEW: .font-display { font-family: 'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif; }
     /* h1/h2/h3 now INHERIT font-sans (Plus Jakarta). Apply display ONLY via explicit .font-display
        on heroes, page titles, celebration, and big numbers. Tables/forms/login NEVER get display. */
```
Also strip every hardcoded `font-family:'Baloo 2'` (`auth-title`, `auth-brand-title`, `auth-wordmark`, `auth-otp`, dashboard-mockup inline styles).

**`tailwind.config.js` fontFamily:**
```
OLD: display: ['"Baloo 2"', '"Plus Jakarta Sans"', ...]
     serif:   ['"Baloo 2"', ...]
NEW: display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif']
     /* DELETE the `serif` alias entirely (it only existed to smuggle Baloo into <serif> spots). */
     sans:    keep as-is.
```

**Type scale (refined — slightly tighter for data density):**
```
                       OLD            NEW
display-xl  celebration 40/1.1/800    40/1.1/800   Bricolage   (keep)
display-lg  page hero    30/1.15/800   32/1.12/800  Bricolage   (keep)
h1                       24/1.2/700    24/1.2/700   Bricolage   (page title)
h2                       20/1.25/700   20/1.25/700  Bricolage
h3                       17/1.3/600    16/1.3/600   Plus Jakarta 600  ← demote to body family
card title          —    16/600        15/600       Plus Jakarta
body                     15/1.55/400   15/1.55/400  Plus Jakarta (marketing/app chrome)
data / table body        14            13/1.4       Plus Jakarta  ← 13px is THE "tool not toy" number
label / eyebrow          13/600 caps   12/600 caps  Plus Jakarta, letter-spacing +.04em, ink-400
caption                  12/500        12/500       Plus Jakarta
KPI / stat number        28–44/800     26–32/700    Bricolage, tabular-nums, tracking -0.01em
button                   14.5/700      14/600       Plus Jakarta
```
**Rule:** display type is *rare and large*. On any screen, ≤~10% of visible text is display weight. Hierarchy comes from **weight + size in two families**, never from a third decorative face.

---

### 2.2 Color — deepen the brand, mute the candy, quarantine saturation

The neutrals are already premium — **keep the entire warm-neutral ramp verbatim.** The problem is (a) the brand is a touch candy, (b) the playful accents are nursery-bright and leak into the chrome, (c) screens run 5 saturated hues at once. V3 fixes saturation discipline: **one confident accent does ~95% of the work; saturated color survives only in avatars and meaning-bearing status.**

#### Brand (deepen + desaturate — scholarly, confident, not sweet)
```
            OLD        NEW        note
--brand-50  #F4F2FF    #F3F2FD    (keep ~same; selected-row / chip tint)
--brand-100 #ECE9FE    #E8E6FB
--brand-200 #D9D3FD    #D4CFF7
--brand-300 #BEB4FA    #B3A9F0
--brand-400 #9B8CF4    #8A7CE8
--brand-500 #6C5CE7    #574FCF   ← PRIMARY. Deeper, calmer, "infrastructure" not "toy".
--brand-600 #574BD6    #4A41C0   ← hover / 3D edge (student only)
--brand-700 #4A3FB8    #3E37A6
--brand-900 #2A2370    #211C63
```
Keep the `purple.*` legacy alias pointing at the new values.

#### Neutrals — KEEP EXACTLY (these are correct and premium)
```
--canvas #F6F6FB   --surface #FFFFFF   --surface-2 #FBFBFE
--ink-900 #1E2233  --ink-700 #3A3F52   --ink-600 #5A6072  --ink-400 #9AA0B0
--hairline #ECEDF3 --hairline-strong #E2E4EC
```
> Note vs ClassDojo: ClassDojo's canvas is a cool `#F7F8FA`; ours is a warm `#F6F6FB`. **Keep ours** — the warm off-white is a deliberate, more premium choice (Monarch/Headspace warmth). The point both share is: **the canvas is near-white, never colored.**

#### Playful accents — mute, and restrict to MEANING + avatars only
```
            OLD        NEW        owns / allowed use
--grape     #8B5CF6    #7C5CE0    achievements, badges (gamification surfaces)
--sky       #38BDF8    #3BA8E6    info, time/speed metrics (status only)
--mint      #22C55E    #1FA855    success, accuracy, "good" (status only)
--sun       #FACC15    #EAB308    XP, points, gold (gamification only) — deeper, less school-bus
--coral     #FB7185    #F4677E    RETIRE from chrome. Streak warmth ONLY. Never on buttons/cards.
--flame     #FF9A3C→#FF5A1F  KEEP  streak fire gradient — student gamification ONLY
```
**Color usage law (V3, stricter):**
1. **Cap any single screen at 2 accent hues in chrome** (brand + at most one supporting tint). The dashboard's 5-color `SUBJ_PALETTE` (brand/mint/sun/sky/grape rotating per subject) **violates this — collapse it** to brand + one neutral-grey chip; reserve color for status.
2. **Saturated color at scale lives ONLY in avatars.** (See §5.)
3. **Status colors are functional, not brand** — green/amber/red/blue mean done/warning/error/info, nothing decorative.
4. **Tints, not new hues, for backgrounds** — selected = `brand-50` (8% accent), never a second bright fill.

#### Semantic — KEEP (well structured)
```
success #16A34A tint #DCFCE7 text #15803D
warning #F59E0B tint #FEF3C7 text #B45309
danger  #EF4444 tint #FEE2E2 text #B91C1C
info    #3B82F6 tint #DBEAFE text #1D4ED8
```

---

### 2.3 Corner radii — tighten everything one notch

Oversized radii are the second-biggest childish tell. 20px on a *standard* card is gummy; 24px modals feel like a toy. Tier them and dial DOWN.

```
Tailwind key   OLD     NEW    used for
input          12px    10px   text inputs, selects, small controls
tile           16px    12px   icon tiles, list rows, data containers, table wrapper
card           20px    14px   standard cards, stat cards (DEFAULT)
card-lg        24px    18px   hero cards, modals, celebration panels (student tier ceiling)
pill           9999px  9999px KEEP — primary CTAs, chips, segmented toggles, avatars, status pills
(new) chip      —      8px    categorical tag pills that are NOT status (Notion-style role tags)
(new) ctl       —      6px    dense data-table inline controls, command-palette rows
```
**Role dial on radius:** student/parent may use `card-lg 18`; teacher uses `card 14`; admin data surfaces use `tile 12` / `input 10`. Auth card: 24 → **16**. Modal: 24 → **16** (admin variant 14).

---

### 2.4 Shadows — neutralize the purple glow, go vertical & subtle, prefer borders

Every current shadow is tinted `rgba(108,92,231,…)` up to 0.45 alpha — a purple halo under everything. Premium = soft, vertical, low-opacity, **neutral ink**, and on *static* cards often replaced entirely by a 1px hairline.

```
Tailwind key  OLD                                                      NEW
soft          0 8px 24px -8px rgba(108,92,231,.12),                    0 1px 2px rgba(20,22,40,.05),
              0 2px 6px rgba(31,35,48,.04)                             0 6px 16px -6px rgba(20,22,40,.10)
soft-lg       0 16px 40px -12px rgba(108,92,231,.18),                  0 4px 12px -4px rgba(20,22,40,.08),
              0 4px 12px rgba(31,35,48,.05)                            0 12px 28px -10px rgba(20,22,40,.14)
pop           0 12px 32px -8px rgba(108,92,231,.22)                    0 8px 24px -8px rgba(20,22,40,.14)
modal         0 24px 60px -12px rgba(20,20,50,.28)                     0 16px 48px -12px rgba(20,22,40,.22)
edge          0 4px 0 0 #574BD6  (3D button ledge)                     0 3px 0 0 #4A41C0  (student gamification ONLY; was applied everywhere)
```
**Tier discipline (Linear/Attio law):**
- **Static cards default to NO shadow — a 1px `hairline` border instead.** Use `soft` only when a card must visibly lift off the canvas. Use `soft-lg` only on hover.
- **`pop`/`modal` are for floating layers only** (modals, dropdowns, command palette, slide-in panels, toasts). That's where you spend the shadow budget.
- Data tables/charts: faint `soft` or just a hairline. Never a colored shadow.
- The old mockup glow `rgba(108,92,231,0.45)` → `rgba(20,22,40,0.18)`.

---

### 2.5 Spacing — adopt a strict 4px scale (mostly already implied)

```
scale: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64
card padding        16–20 (admin 16, student 20–24)
section gap         32–48
page gutter         24 mobile / 32–64 desktop
KPI grid gutter     24
content column cap   forms/settings ~560–640px (DO NOT stretch full-width — the #1 "serious tool" signal)
table row height    40 comfortable / 36 compact   (was 52/40 — tighten for density)
nav row height      30–34
```
Premium feel = consistency + generosity, not cleverness. **Density lives in tables; forms and settings breathe.**

---

### 2.6 Motion — kill perpetual motion; celebrate sparingly

Stillness reads expensive. The current build has *infinite* loops everywhere (gradient text, blobs, glow-pulse) — the #1 perpetual-motion childish tell.

```
Durations:  120ms hover/press · 180–220ms enter/exit/expand · 280–350ms route
Easing:     enters cubic-bezier(.2,.8,.2,1) · exits ease-out · KEEP --ease-out-quint for fills
            DROP --ease-spring overshoot from chrome (keep ONLY for student badge pop)
Press:      scale .98 (80ms) or translateY 1px — NOT the 4px Duolingo depress (except student btn-3d)
Hover lift: translateY(-2px) + soft-lg, 120–150ms  (was -4px scale 1.01 — too bouncy)
```
**Celebration recipe (Brilliant model, replaces confetti cannon for non-milestones):** one radial glow behind a single icon + ring fills once + ~6 sparkles fade, <1s, then a quiet "Continue." Full confetti burst is reserved for **genuine student milestones only** (level-up, streak record) — never "grade saved."

**Budget: ≤3 motion types per section.** Heavy motion only on real milestones. Everything gated behind `prefers-reduced-motion`.

---

## 3. REMOVE / TONE-DOWN vs KEEP

### 3.1 DELETE outright (these are the childish tells)
- **`.gradient-text`** (animated 4-stop rainbow heading) — delete the class and its keyframe usage.
- **`.pastel-text` animation** — keep the class name (used on Dashboard) but **remove the `animation`**; make it a *static* single fixed gradient or just `color: var(--brand-600)`. (Dashboard.jsx:342 `<span className="pastel-text">{firstName}</span>` → static brand color.)
- **`.hb2 .hb3 .hb4 .hb5 .hb6`** and their `bd2–bd6` keyframes — reduce the hero from **6 blobs to 1**, single hue (`brand-100` wash, `blur(80px)`, opacity .45, static or 30s+ imperceptible drift). The dashboard hero (Dashboard.jsx:319) → flat tint `background: var(--brand-50)`, delete its two inner blob divs.
- **`.animate-blob`** + `blob` keyframe (amoeba border-radius morph) — delete.
- **`.animate-glow-pulse`** + `glow-pulse` keyframe (infinite purple glow) — delete.
- **`.glow-border`** + its `::before` rainbow gradient — delete.
- **`.perspective-tilt`** (3D card tilt) — delete.
- **`.glass` / `.glass-light`** blur helpers — delete if unused (grep first).
- **Emoji in product chrome** — strip the glyph from product copy (e.g. `…hazır ol. 🚀` → drop rocket; `Hamısı bitib! 🎉` → `Hamısı bitib` + optional small `<Check>` lucide glyph). Keep all words/keys. User-generated content keeps its emoji.

### 3.2 TONE DOWN
- **`.btn-pastel` / `.btn-3d`** — demote to **student gamification surfaces only**. Auth, admin, teacher, and marketing primary CTAs become **flat solid pills** (no gradient, no 4px ledge). For the kept student version: gradient → **solid `brand-500` fill**, ledge `0 4px 0` → `0 3px 0`. Login primary switches from `btn-3d` to flat `<Button variant="primary">`.
- **Mascot** — one per screen, max. **Remove from the login/auth flow** entirely (replace with wordmark + clean abstract pattern). On the dashboard, keep the hero mascot **or** the empty-state mascots, not both at full size; shrink empty-state mascots to ~72–80px and flatten the illustration (geometric, fewer gradients, faceless-leaning per Headspace). Mascot never appears in data views.
- **Radii / shadows / brand** — per §2.3–§2.4 and §2.2.
- **`SUBJ_PALETTE`** 5-color rotation → brand + one neutral-grey; color = status only.

### 3.3 KEEP (already premium — do not touch)
- **The governing philosophy + role dial.** Correct; V3 just enforces it in tokens.
- **Warm neutral ramp** (`canvas / surface / ink-* / hairline`). Verbatim.
- **`.pill-*` leading-dot status pills** — the single best friendly-yet-pro component. Keep exactly.
- **`.pastel-table`** recipe — no vertical gridlines, sticky quiet header, hover wash (not zebra), tabular-nums, right-aligned numbers. Keep; just adopt 13px body + 40/36px rows + neutral hover wash.
- **Plus Jakarta Sans** for body/UI, two-weight discipline, `tabular-nums`.
- **Semantic color tokens**, **reduced-motion handling**, **token architecture** (Tailwind + `:root` mirror + legacy aliases), **`.pastel-skeleton`** (skeletons over spinners), custom chart tooltip rules, focus-visible ring.

---

## 4. Per-page-type ClassDojo-grade management patterns (concrete recipes)

> Universal shell: canvas `#F6F6FB`, white cards, 1px hairline default (shadow only when lifting), one brand accent, Bricolage on titles/numbers, Plus Jakarta 13px on data.

### 4.1 Roster (people grid + list — ship BOTH)
- **Grid (engagement mode):** wrapping grid of white tiles, **96×112**, `tile` radius (12), hairline (shadow on hover only). Avatar 56 centered, name 14/600 below, small green points pill top-right. First tile always **"Whole Class"** (overlapping mini-avatar stack). Last tile = **dashed-border "+ Add students"**, brand icon+label. Hover: `soft-lg` lift + quick "+1" affordance.
- **List (management mode, admin-trust):** `pastel-table`, 40px rows, columns `☐ | Avatar(28)+Name | Class | Family status | ⋯`. Family status = **6px dot + label** (`Connected / Invite sent / Not connected`), never a chunky badge. Toolbar above: `[Students][Groups]` segmented left; `[Filter][Export CSV]` text-buttons right.
- **Multi-select:** checkbox appears on hover/select; selected row = `brand-50` wash; **dark rounded-pill bulk-action bar floats bottom-center** ("5 selected · Message · Move class · More") — steal from Attio.
- Toggle grid↔list top-right.

### 4.2 Add-person flow (one modal, three role variants)
- Centered modal, radius **16**, `modal` shadow. Single type-ahead field "Find or add by full name." Checks directory first → **"Add 'Name'"** fallback. For students: **"Or, paste your student list"** bulk escape hatch. **Role segmented control** (Student/Teacher/Parent) at the bottom (steal Remind). Primary pill disabled until ≥1. Parents are invited *attached to a student*, never created standalone. Destructive ("Remove from class") lives only in the *edit* view.

### 4.3 Profile (drawer/modal with inner rail)
- Right-side slide-in panel (~400px) over a still-visible (dimmed) table, OR centered modal. Header = avatar + name + **two count chips** ("CLASS · SCHOOL" points) + ×. Inner left rail tabs: **Behavior · Reports · Family · Profile.** Right pane swaps. Fields = quiet label-left / value-right pairs; activity = timeline below. Keep the two-points-chip header — great institutional trust signal.

### 4.4 Dashboard (admin LOW / teacher MEDIUM)
- **KPI row:** 3–4 cards, `card` radius (14), 16–20 pad, **hairline border, NO shadow**. Eyebrow label 12/600 caps ink-400 → big number 26–28/700 Bricolage tabular → optional delta (green/red **text+arrow**, no filled pill) → optional 1.5px single-accent sparkline footer. *Default to the simplest card; add sparkline only when trend matters* (Zoho restraint lesson). E.g. "Students · Families connected % · Attendance today · Points this week."
- **Body:** classes table (`Class · Teacher · #Students · Connection % · Last activity`), row-click → detail; `[Filter][Export CSV]` toolbar; thin per-row progress bars. **This density is where Zirva exceeds ClassDojo** — keep the friendly donut for behavior sentiment but back it with a filterable, exportable, date-ranged table so a buyer trusts the rigor.
- **Family-connection progress ring** is the signature KPI — "0 of N families connected" as a completion goal.

### 4.5 Table (the most important surface)
- `pastel-table` in white `tile`-radius wrapper, `overflow:hidden`. **Horizontal hairlines only, no vertical gridlines.** Row 40/36px. **Header is QUIETER than data** (12px ink-400, not bold). Body **13px/1.4**. Hover = neutral wash `rgba(20,22,40,.025)` (not zebra). First column = identity (avatar 20–28 + name, slightly heavier). Numbers right-aligned tabular. Status = 6px dot + label. Optional **column-footer aggregations** ("96 count · 86% filled") for gradebooks. Kebab `⋯` fades in on row hover.

### 4.6 Form / settings (Linear model)
- **Two-pane settings:** left nav ~200–220px, grouped with 11–12px UPPERCASE tertiary labels, active item = **neutral grey fill** (never colored pill) + bolder text. Right content column capped **~560–640px**, left-aligned, big right whitespace.
- **Prefer a settings *list* over a *form*:** each row = left title (13–14/600) + description (13 grey) / right control (toggle/dropdown), 1px hairline between, 16–20 vertical pad. Quiet section headers (13 grey, +32 top margin).
- **Real inputs when needed:** height 32–36, radius **10**, 1px border, 13–14px text, label above (12–13), focus = brand border + 3px brand ring (no glow). Required = subtle `*`. Inline validation in 12px green/red below.
- Save: auto-save + green check toast, or primary bottom-right / sticky footer.

### 4.7 Calendar (Amie model)
- Time gutter left (11px grey), day columns, 1px hairline grid, **low-saturation pastel event blocks** (~12–15% tint fill + 2–3px solid accent left-bar + dark-tint text), radius 6, red "now" line. Mini-month bottom-left of sidebar. **Muted = premium; bright saturated event blocks are the childish tell here too.**

### 4.8 Messaging (two-pane)
- Left = searchable list (pinned class group chat + per-parent DMs), right = thread + composer (`📎 🖼 | Message… | Send`). Group header shows **privacy promise** ("limited to classroom families"). Bubbles neutral: sent = brand fill, received = light grey. **Surface Quiet hours + Read receipts prominently in settings** — these admin-trust controls are why a school feels the tool is safe.

### 4.9 Empty states (tier them)
- **Tier 1 — dense data screens (roster/gradebook empty):** restraint. Small monochrome **line-art glyph** (~80–120px), one-line heading (15/600), one grey line (13), one button (the only color). Keep surrounding chrome (sidebar, header, column headers) present — empty state lives only in the data region. **No mascot, no cartoon.**
- **Tier 2 — first-run / onboarding-ish (student/parent home):** a faintly-colored flat illustration (or the contained mascot at ~72–80px) + heading + one line + single primary button. Warm Azerbaijani copy. Max-width ~360px.
- Build ~10 reusable variants. Filtered-empty shows one-click "remove filter" chips.

### 4.10 Command palette (the keyboard-first signal)
- Centered modal ~560–640px, top ~18% of viewport, dim backdrop, radius **12**, prominent `modal` shadow. Borderless search input ~44–48px with leading magnifier. **Results grouped** with quiet section labels (Classes / Students / Documents). Highlighted row = `brand-50` + 2px accent left-bar. **Bottom keyboard-legend footer** (`↑↓ Select · ↵ Open · esc Close`) + right-aligned result count. This footer is the single biggest "real keyboard-first tool" signal.

---

## 5. Avatars / mascot — characterful but tasteful (where ALL the warmth goes)

**The hard rule:** avatars are the ONLY place full-saturation color lives at scale. The chrome stays grey + brand.

### 5.1 Student avatars — contained generative system (don't copy ClassDojo monsters)
- **3-layer generative avatar:** `base shape/blob → palette → 1 accent feature (eyes/pattern)`, **deterministically seeded from student ID** (stable across sessions).
- **Two states:**
  1. **"Gem" default** = a tasteful marbled gradient orb (the egg-equivalent — looks polished even on an empty roster, never blank).
  2. **"Character" customized** = student picks shape + color + one feature (the "hatch" delight without baby monsters).
- **Containment:** always in a consistent circle (lists) or square `tile` (grid). Personality is modular, never freeform.
- **Palette** (~8–10 mid-saturation hues, delightful but calm on white): coral `#FF8A6B`, teal `#39C5BB`, violet `#7C6BFF`, amber `#FFC24B`, sky `#5BB8FF`, rose `#FF7BAC`, lime `#9BD64B`, grape `#8B5CF6`.

### 5.2 Adults = monogram circle
- Teachers/parents/admins get a **colored-initial circle** (initials on a pastel bg hashed from the name, same palette). This visually separates grown-up accounts from playful student characters → reinforces "professional."

### 5.3 Mascot — contained, never over-used
- **One friendly SVG** (rounded star/book creature or gradient blob), flatter and more geometric than the current cartoon owl, faceless-leaning (Headspace style). Poses: waving / reading / cheering / thinking / sleeping / pointing.
- **Appears at most once per screen.** Allowed: student/parent home hero, Tier-2 empty states, celebration. **Forbidden:** the auth/login flow, any data view (roster/gradebook/table/reports), and repeated multiple times on one scroll. Idle bob ≤±3px, gate behind reduced-motion.

---

## 6. Implementation checklist (ordered — refinement cascades from tokens)

Do these in order; each later step assumes the earlier tokens exist.

**Phase A — fonts (highest impact):**
1. `index.css` line 1: swap the Google Fonts `@import` to Bricolage Grotesque + Plus Jakarta (§2.1).
2. `index.css` line 12: change the base rule so `h1/h2/h3` inherit `font-sans`; `.font-display` → Bricolage (§2.1).
3. `tailwind.config.js`: `fontFamily.display` → Bricolage; **delete `fontFamily.serif`** (§2.1).
4. Grep & remove every hardcoded `font-family:'Baloo 2'` (`auth-*`, dashboard mockup). Add explicit `.font-display` to hero/page-title/KPI-number elements that should keep the display face.

**Phase B — color tokens:**
5. `tailwind.config.js` `colors.brand.*` → deepened values; keep `purple.*` alias remapped (§2.2).
6. `index.css` `:root` brand vars → same deepened values (mirror).
7. Mute accents (`sun #EAB308`, `mint #1FA855`, `grape #7C5CE0`, `sky #3BA8E6`); mark `coral` streak-only.
8. Update any `rgba(108,92,231,…)` literals in `index.css` (scrollbar, focus ring, icon-chips, table hover, drop-target) toward the new brand `#574FCF` or neutral ink where appropriate.

**Phase C — radii:**
9. `tailwind.config.js` `borderRadius`: input 12→10, tile 16→12, card 20→14, card-lg 24→18; add `chip 8`, `ctl 6`. Mirror in any CSS literals (`.liquid-card` 20→14, `.liquid-modal` 24→16, `.pastel-input` 12→10).

**Phase D — shadows:**
10. `tailwind.config.js` `boxShadow`: replace soft/soft-lg/pop/modal with neutral-ink values; edge 4px→3px (§2.4). Mirror the inline shadows in `.liquid-card`, `.liquid-modal`, toasts.
11. Default static cards to **hairline border, no shadow**; reserve `soft`/`soft-lg` for lift/hover and `pop`/`modal` for floating layers.

**Phase E — motion / decoration purge:**
12. Delete from `index.css`: `.gradient-text`, blob keyframes `bd2–bd6` + `.hb2–.hb6`, `blob`/`.animate-blob`, `glow-pulse`/`.animate-glow-pulse`, `.glow-border`(+`::before`), `.perspective-tilt`, unused `.glass*`.
13. Make `.pastel-text` static (remove `animation`); reduce hero to one static blob; flatten dashboard hero tint.
14. Tighten transitions: hover lift -4px→-2px, drop spring overshoot from chrome (keep for student badge pop only).

**Phase F — buttons:**
15. `.btn-pastel` gradient→solid `brand-500`, ledge 4px→3px; keep `.btn-3d` for student gamification only.
16. `<Button variant="primary">` = flat solid brand pill, `0 1px 2px rgba(20,22,40,.08)`, `active:translate-y-[1px]`. Switch Login/auth/admin/marketing primaries to it.

**Phase G — primitives & components:**
17. `<Card>`/`.liquid-card`: radius 14, hairline default, hover `soft-lg`.
18. `<StatCard>`: Bricolage number 26–28, hairline no-shadow default, optional sparkline, simplest-by-default.
19. `pastel-table`: 13px body, 40/36 rows, quiet header, neutral hover wash; add optional column-footer aggregation.
20. Avatar component: gem-default + monogram-adult + generative seed (§5).
21. Mascot: remove from auth, cap one-per-screen, shrink empty-state instances to ~72–80, flatten.
22. Strip emoji glyphs from product copy (keep words/keys).

**Phase H — verify:**
23. Grep for stray `#6C5CE7` / Baloo / `rgba(108,92,231,0.22|0.45)` and clean.
24. `npm run build` passes. Spot-check login (no owl, flat button, Bricolage title), admin table (13px, quiet, neutral), student dashboard (one blob, static name, contained mascot).

---

## 7. Pre-finish checklist (every page)
- [ ] No logic/data/i18n/route changes; presentation only.
- [ ] Tokens & shared classes only — no stray `#6C5CE7`, no Baloo, no purple-glow shadow, no animated gradient text/blobs.
- [ ] Correct role dial (student HIGH … admin LOW/calmest).
- [ ] Playful contained avatars; calm data — zero decoration inside tables.
- [ ] Bricolage only on hero/titles/numbers; Plus Jakarta 13px on data; tabular-nums on numbers.
- [ ] One accent in chrome (≤2 hues/screen); saturated color only in avatars + meaning-bearing status dots.
- [ ] Radii tightened (card 14 / tile 12 / input 10 / modal 16); shadows neutral & subtle; static cards prefer hairline.
- [ ] Motion ≤3 types/section, no perpetual loops, celebration only on real milestones, reduced-motion respected.
- [ ] `npm run build` passes.

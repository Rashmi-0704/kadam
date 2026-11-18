# Kadam design system

Visual direction for Kadam's frontend. It takes **inspiration** from the interaction style of brilliant.org (clean, approachable, tactile buttons, friendly cards). No text, images, logos, icons, illustrations, brand assets or font files are copied. Kadam keeps its own identity: indigo as the primary colour, coral for highlights, a cool off-white background, a rounded Google Font for headings. (Round 2, 17 Nov: the saffron and warm-paper palette was replaced by indigo + coral, and the theme is light only.)

## Part 1 — What was observed on brilliant.org

**Source:** homepage HTML and the four linked CSS bundles were downloaded with curl (browser user-agent, HTTP 200, ~1.2 MB of CSS). Tokens below marked **[CSS]** were read from those files. Items marked **[est.]** are estimated from the page structure or typical values because the CSS expresses them indirectly (utility classes, component props).

### Colour **[CSS]**
| Role | Values |
|---|---|
| Page / card surface | `#ffffff` (bg-primary); secondary surface `#f8f8f8` (gray-50); "oat" soft neutral `#f5f3f1` |
| Borders | `#e4e4e4` (oat border), `#e5e5e5` (gray-200); hover = black at ~40 % alpha |
| Text | black / `#141414` primary, `#4c4c4c` / `#666` secondary, `#999` placeholder |
| Primary action | green `#29cc57` (500), pressed edge `#15b441` (600) |
| Accents (used sparingly) | blue `#456dff`, purple `#9d62ff`, pink `#ff6bd5`, orange `#ff8d23`, yellow `#f7c325`, mint `#5cf0b6`, teal `#2cb0a1`, red `#ff5d5d` |
| Tints | each accent has 50–950 steps; 100/200 used as soft card backgrounds |
| Focus | 3 px outline ring in a "select" border colour; white inner ring + 3 px outer ring |

### Custom properties **[CSS]**
Built with Panda CSS: `--panda-colors-*`, `--panda-radii-*`, `--panda-spacing-*`, `--panda-shadows-*`, `--panda-fonts-*`, and a component-level pair for the tactile button: `--button3d-shadow-color` (the darker edge) and `--button3d-hover-tint`. Light/dark handled by "autoflip" colour tokens.

### Fonts **[CSS]**
Proprietary geometric sans ("CoFo Brilliant", "CoFo Robert"), Source Code Pro for code. Fallback stack `ui-sans-serif, system-ui, …`. These are licensed — **not used**; Kadam uses free Google Fonts instead.

### Radii **[CSS]**
`xs .375rem · md .5rem · lg .75rem · xl 1rem · 2xl 1.25rem · 3xl 2rem · full 9999px`. Cards sit at 1–1.25 rem, buttons at md–xl, pills full.

### Spacing **[CSS]**
4 px scale: `.25 · .5 · .75 · 1 · 1.25 · 1.5 · 2 · 2.5 · 3 · 4 rem`.

### Shadows **[CSS]**
Soft ambient glow instead of hard drop shadows: `0 0 15px` (base), `0 0 25px` (md), `0 0 40px` (lg), `0 1px 3px #0000000a` (subtle). Chunky card edge: `0 -6px 0 #00000026 inset`.

### Tactile "pressable" button **[CSS + est.]**
The button reads `--button3d-shadow-color` for a **solid darker edge under the button** (a `box-shadow` / bottom border in the darker shade of the fill: green 500 → green 600, blue → blue 600, secondary → light grey `#dcdad8`). On `:active` the button moves down by the edge's height and the edge collapses to 0, so it looks pressed. Edge height ≈ 4 px **[est.]**. Hover adds a faint tint.

### Type scale **[est.]**
The CSS exposes sizes through utility classes, not named tokens. Observed feel: hero ~48–56 px bold, section titles 32–40 px, card titles 20–24 px, body 16–18 px, captions 12–14 px; weights 500 (body emphasis) / 700 (headings).

### Layout patterns **[est., from HTML structure]**
- **Hero:** centred or two-column; one big friendly headline, one sentence of support, a single chunky CTA, a playful illustration beside/below. Lots of whitespace.
- **Interactive feature cards:** grid of equal rounded cards, thin border, pastel tint per card, illustration on top, title + one line, whole card is the tap target and lifts slightly on hover.
- **Tabbed topic explorers:** a row of pill tabs (scrollable on phones); selecting one swaps a panel of cards underneath. Selected pill has the filled colour + solid edge.
- **Testimonial cards:** horizontally scrolling or 3-up grid of white cards, quote first, small avatar/name below, same border and radius as other cards.

## Part 2 — The Kadam design system

Same feel (bright, rounded, tactile, calm hierarchy), Kadam's own identity.

### Principles
1. **Phone first.** Single column at 360 px, touch targets ≥ 48 px (44 px minimum for compact controls), 16 px minimum body text.
2. **Tactile, not noisy.** Primary actions are chunky and press down; everything else is flat with a thin border.
3. **Light only.** Cards are white on a cool off-white canvas (`#F7F8FC`). No black or dark backgrounds anywhere, including sections.
4. **One loud colour.** Indigo is the main action colour; coral is reserved for highlights ("New", the eyebrow, sparkles, shimmer). Green, amber and red are status colours.
5. **Indic-script safe.** Fonts fall back to Nirmala UI / Noto Sans so Hindi, Kannada, Tamil, Odia, Bengali and Gujarati keep comfortable line height (≥ 1.5) and never clip.
6. **Motion is optional.** The press effect is a 120 ms transform; `prefers-reduced-motion` removes it.

### Colour tokens
| Token | Hex | Use |
|---|---|---|
| `canvas` | `#f7f8fc` | page background |
| `card` | `#ffffff` | card / input surface |
| `mist` | `#eef1f8` | soft neutral fill, chips, hover |
| `line` | `#e3e7f2` | 2 px card/input border |
| `line-deep` | `#c8cee2` | bottom edge of secondary buttons and cards |
| `ink` | `#151a30` | primary text (16.2:1 on canvas) |
| `ink-2` | `#3e4560` | secondary text (8.9:1) |
| `ink-3` | `#5d6483` | tertiary text, placeholders (5.5:1 on canvas, 5.1:1 on mist) |
| `primary` | `#4338ca` | indigo: primary buttons (white text 7.9:1), links, focus ring, active states |
| `primary-edge` | `#2e2690` | pressable button bottom edge |
| `primary-deep` | `#3730a3` | indigo text on light (8.8:1 on primary-soft) |
| `primary-soft` | `#eef0ff` | tint backgrounds |
| `highlight` | `#ff6b4a` | coral: "New" badges, shimmer, sparkles, accent borders and dots (never small text) |
| `highlight-deep` | `#b4321a` | coral text, the eyebrow accent (5.4:1 on highlight-soft) |
| `highlight-soft` | `#ffede8` | coral tint |
| `glow` | `#818cf8` | soft periwinkle glows and gradients |
| `success` / `success-ink` / `success-soft` | `#16a34a` / `#15803d` / `#dcfce7` | dots and borders / text and solid fills (5.0:1 with white) / tint |
| `amber` | `#f59e0b` | 1–2 takers dot |
| `alert` / `alert-soft` | `#dc2626` / `#fef2f2` | error, destructive, 3+ takers dot (4.8:1 on white) |
| `info` / `info-soft` | `#4f46e5` / `#e0e7ff` | info, in-progress, Pivot chip (5.1:1) |

Tokens are semantic: nothing is named after a hue that might change again.

All text/background pairs above meet WCAG AA (4.5:1 body, 3:1 large text and UI borders).

### Type
- **Headings:** *Nunito* 800 (rounded, friendly, free on Google Fonts), tracking −0.01 em.
- **Body / UI:** *Hanken Grotesk* 400/500/600/700.
- Scale: display 36–44 · h1 28→34 · h2 22→26 · h3 18–20 · body 16 · small 14 · caption 12.
- Fallbacks: `"Nirmala UI", "Noto Sans", system-ui, sans-serif`.

### Shape and depth
- Radii: inputs 14 px, buttons 16 px (pills for chips and tabs), cards 20 px.
- Cards: 2 px `line` border + 4 px `line-deep` bottom edge; interactive cards lift 2 px on hover and press 2 px on active.
- Spacing: 4 px base; card padding 20 px (16 px on phones); section gaps 24–32 px.
- Shadows: none by default; focus ring is a 3 px indigo outline with 2 px offset.

### Buttons
All buttons: min-height 48 px, 16 px radius, 700 weight, 2 px border, 4 px solid bottom edge.

| Variant | Fill | Edge | Text |
|---|---|---|---|
| `btn-primary` / `btn-accent` (main action) | `primary` | `primary-edge` | white |
| `btn-secondary` | `card` | `line-deep` | `ink` |
| `btn-ghost` | transparent | none | `ink-2` |
| `btn-danger` | `card` | `clay` @ 35 % | `clay` |

Pressed: `translateY(3px)` and the edge shrinks to 1 px. Disabled: 50 % opacity, no press.

### Components
- **Card** (`.card`) white, 20 px radius, 2 px border, bottom edge. `.card-tap` adds hover lift and press.
- **Input** (`.input`) 52 px high, 2 px border, 14 px radius; focus = ink border + indigo ring.
- **Chip** (`.chip`) pill, mist fill, 1.5 px border.
- **Status badge** soft tint + matching strong text; "in use" is solid leaf.
- **Notice** soft tint, 2 px border, 16 px radius.
- **Tabs / pills** (filters, language toggle, roadmap sections) pill shape; selected = indigo fill with white text, unselected = card with border.
- **Empty state** centred card with small coloured bar-chart mark.

### Layout patterns (Kadam's own)
- **Welcome:** two large role cards (student / business), student first, each a full-width tactile tap target on phones, side by side from 768 px.
- **Dashboards (round 3):** top, full width: a welcome banner (soft gradient + slow glow; student indigo → periwinkle with steps and flag, business coral → periwinkle with a shop), one **"Your next step"** card that is always present with a single big button, then the four count-up insight tiles. Below, two columns from `lg` (main ≈ 2/3, side ≈ 1/3) and one column on phones in source order. Student main: Suggested for you (cached matches only), Your problems with a progress line, impact reports with the headline number; side: Your paths (Now / Pivot / Stretch), roadmap progress rings, a daily tip. Business main: Needs your action (initials avatar + one big button each), Your problems with a Draft → Live → Students working → Work submitted → In use line; side: Recent activity, Impact so far, a voice help card. The hero word rows and role trail also sit behind both dashboards as a fixed background (`<DashBackdrop>`), with boxes only over empty canvas. Every section has an illustrated empty state (`<EmptyCard>`: small SVG in brand colours, title, one line, optional button). Shared parts: `src/components/dashboard/`.
- **Lists (problems, engagements):** full-width tap cards with title, chips and a status badge.
- **Forms:** single column, label above input, sticky bottom action bar on phones for long forms.

### Brand lock-up and highlights (round 2)
- **Lock-up:** logo + "Kadam." + the tagline "Take your first step." in `<Highlight>` (`<LockUp>` in `src/components/Logo.tsx`). Used on the welcome screen, both homepages and footers.
- **`<Highlight>`:** indigo → violet → dark-coral gradient text, a shimmer sweep every ~5 s, a soft periwinkle glow, sparkles on hover. **`<HighlightPill>`** is the pill version (role names in fit reasons). One or two per screen.
- **Fit reasons:** path chip (Now green, Pivot indigo, Stretch coral) + role as a highlighted pill with a step-path icon.
- **"New" badge:** coral-soft pill with a coral border and a pulsing coral dot, for problems live within 7 days.
- **Taker dot:** green pulsing (0, "Be the first"), amber (1–2), red (3+); the label always states the count.

### Motion (round 2)
- Animate only `transform` and `opacity` (or canvas). Gentle and fast; smooth on a mid-range phone.
- Off-screen animations pause (`<MotionPauser>` adds `.anim-off`; the GSAP scene pauses its loops); hidden tabs pause on their own.
- `prefers-reduced-motion`: still versions everywhere (no role trail, still word rows, no shimmer, glow, pulse, reveals or count-ups).
- **Hero word rows** (`<HeroWords>`, round 3): a faint, moving watermark behind the hero on `/`, `/students` and `/businesses`. Five rows (four on phones) spread over the hero's full height, phrases "Real problems ✦ Real solutions ✦ Real impact ✦ Take your first step ✦" with a different starting phrase per row, directions left/right/left/right/left, 60/75/65/80/70 s per loop, CSS keyframes only. Nunito 800, `clamp(44px, 7vw, 112px)`. Solid rows indigo 7 %, outlined rows 1.5 px indigo stroke at 14 %, ✦ coral 18 %. Never stronger: hero text must keep AA contrast on top. Layers: canvas → scene → gradient fade → word rows → trail → content. `pointer-events: none`, `aria-hidden`, paused off-screen, still under reduced motion.
- **Hero role trail** (`<RoleTrail>`, round 3): rounded boxes (8 px radius, 7×12 px padding, Nunito 13/700, white, 1.5 px `#e3e7f2` border, indigo text, a 6 px periwinkle square, every 4th box coral) follow the pointer **only over empty background**. Anything marked `data-trail-block` (header, text, buttons, links, cards, and the scene's drawn shapes) blocks it, with 16 px of padding. ≥ 60 px / ≥ 50 ms between boxes; 120 ms in, 900 ms hold, 300 ms out; at most 10, oldest first; a dashed periwinkle polyline joins the visible boxes. Roles: `src/db/trail-roles.ts` (50, English everywhere). No trail under reduced motion. When adding hero content, mark it `data-trail-block`.
- **Scroll reveal** (`<Reveal>` + `[data-reveal]` items, round 3): sections fade up 24 px over 600 ms when their top is 15 % inside the screen, once; items stagger 80 ms (first 8). `<CountUp>` counts numbers over 1.2 s the first time they are visible, keeping ₹, % and Indian grouping. Visible without JS, never hidden for long (6 s safety), skipped under reduced motion. Not used in heroes.
- **Card glow** (`.glow-card`): a slow blurred indigo / periwinkle / coral wash inside main cards, offset per card, stronger on hover.
- **Chat:** typing dots, slide-in messages, word-by-word newest AI reply, friendly retry bubble with a gentle shake.

### Do not
Copy Brilliant's or TimBuckDo's copy, illustrations, icons, logos, fonts or brand colours; use more than one main indigo button per screen; use dark backgrounds; hide content behind animation.

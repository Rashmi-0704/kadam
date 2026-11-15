# Kadam design system

Visual direction for Kadam's frontend. It takes **inspiration** from the interaction style of brilliant.org (clean, approachable, tactile buttons, friendly cards). No text, images, logos, icons, illustrations, brand assets or font files are copied. Kadam keeps its own identity: warm saffron as the primary colour, a warm paper background, a rounded Google Font for headings.

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
3. **Warm paper, not clinical white.** Cards are white on a warm paper background, so they read as cards.
4. **One loud colour.** Saffron is for the single main action per screen; blue/green/clay are status colours only.
5. **Indic-script safe.** Fonts fall back to Nirmala UI / Noto Sans so Hindi, Kannada, Tamil, Odia, Bengali and Gujarati keep comfortable line height (≥ 1.5) and never clip.
6. **Motion is optional.** The press effect is a 120 ms transform; `prefers-reduced-motion` removes it.

### Colour tokens
| Token | Hex | Use |
|---|---|---|
| `paper` | `#fbf7f0` | page background |
| `card` | `#ffffff` | card / input surface |
| `sand` | `#f3ece0` | soft neutral fill, chips, hover |
| `line` | `#e6dccb` | 2 px card/input border |
| `line-deep` | `#d4c7b0` | bottom edge of secondary buttons and cards |
| `ink` | `#1c1a27` | primary text, dark buttons (15.9:1 on paper) |
| `ink-2` | `#4b4759` | secondary text (8.2:1) |
| `ink-3` | `#6b6678` | tertiary text, placeholders (5.3:1 on paper) |
| `saffron` | `#f5a025` | primary fill (ink text on it: 8.9:1) |
| `saffron-edge` | `#c2740b` | primary button bottom edge |
| `saffron-deep` | `#9a5300` | saffron text on light (5.6:1) |
| `saffron-soft` | `#fdecd0` | tint backgrounds |
| `leaf` / `leaf-soft` | `#1f7a52` / `#dcefe4` | success, "in use", verified (5.4:1 on white) |
| `indigo` / `indigo-soft` | `#3c418f` / `#e6e7f6` | info, in-progress |
| `clay` / `clay-soft` | `#b4432c` / `#f8e1da` | error, destructive |

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
- Shadows: none by default; focus ring is a 3 px saffron outline with 2 px offset.

### Buttons
All buttons: min-height 48 px, 16 px radius, 700 weight, 2 px border, 4 px solid bottom edge.

| Variant | Fill | Edge | Text |
|---|---|---|---|
| `btn-accent` (main action) | `saffron` | `saffron-edge` | `ink` |
| `btn-primary` (dark) | `ink` | `#000` | `paper` |
| `btn-secondary` | `card` | `line-deep` | `ink` |
| `btn-ghost` | transparent | none | `ink-2` |
| `btn-danger` | `card` | `clay` @ 35 % | `clay` |

Pressed: `translateY(3px)` and the edge shrinks to 1 px. Disabled: 50 % opacity, no press.

### Components
- **Card** (`.card`) white, 20 px radius, 2 px border, bottom edge. `.card-tap` adds hover lift and press.
- **Input** (`.input`) 52 px high, 2 px border, 14 px radius; focus = ink border + saffron ring.
- **Chip** (`.chip`) pill, sand fill, 1.5 px border.
- **Status badge** soft tint + matching strong text; "in use" is solid leaf.
- **Notice** soft tint, 2 px border, 16 px radius.
- **Tabs / pills** (filters, language toggle, roadmap sections) pill shape; selected = ink fill, unselected = card with border.
- **Empty state** centred card with small coloured bar-chart mark.

### Layout patterns (Kadam's own)
- **Welcome:** two large role cards (student / business), student first, each a full-width tactile tap target on phones, side by side from 768 px.
- **Dashboards:** stacked cards on phones, 2–3 column grid from 1024 px; one `btn-accent` per screen.
- **Lists (problems, engagements):** full-width tap cards with title, chips and a status badge.
- **Forms:** single column, label above input, sticky bottom action bar on phones for long forms.

### Do not
Copy Brilliant's copy, illustrations, icons, logo, fonts or exact brand green; use more than one saffron button per screen; hide content behind animation.

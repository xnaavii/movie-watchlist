# Design system

Watchlist is dark only and strictly monochrome. The posters, backdrops and
trailers supply all the colour; the interface is black, greys and one
off-white, so it never competes with the art. The only hue in the UI is red,
and it is reserved for destructive actions.

The tokens live in `src/styles.css` as shadcn CSS variables on `:root` and are
exposed to Tailwind through `@theme inline`. Use the token classes
(`bg-primary`, `text-muted-foreground`, `ring-primary/30`...), never raw colour
classes like `bg-zinc-800` or `text-amber-200`, and never hex values in
components. Third-party brand marks (the Google button) are the one exception.

## Colour tokens

| Token | Value | Hex (approx.) | Use |
| --- | --- | --- | --- |
| `background` | `oklch(0.145 0 0)` | `#0A0A0A` | Page |
| `foreground` | `oklch(0.985 0 0)` | `#FAFAFA` | Body text, main CTAs (`contrast` button) |
| `card` / `popover` / `sidebar` | `oklch(0.205 0 0)` | `#171717` | Raised surfaces |
| `muted` / `secondary` / `accent` | `oklch(0.269 0 0)` | `#262626` | Quiet fills, hover, "To watch" |
| `muted-foreground` | `oklch(0.708 0 0)` | `#A1A1A1` | Secondary text |
| `primary` / `sidebar-primary` | `oklch(0.97 0 0)` | `#F5F5F5` | The accent: active nav, Watched, brand mark, progress |
| `primary-foreground` | `oklch(0.145 0 0)` | `#0A0A0A` | Text and icons on `primary` |
| `success` | `oklch(0.97 0 0)` | `#F5F5F5` | Done, synced, saved (same as primary) |
| `warning` | `oklch(0.72 0 0)` | `#A3A3A3` | Offline, stale, needs attention |
| `destructive` | `oklch(0.704 0.191 22.216)` | `#FF6467` | Delete, sign out everywhere, errors |
| `border` / `input` | white at 10% / 15% | | Hairlines |
| `chart-1`...`chart-5` | `0.97` → `0.38` lightness | | Grey ramp, lightest first |

Contrast on `background` (WCAG 2): `primary` 18:1, `primary-foreground` on
`primary` 18:1, `muted-foreground` 7.6:1, `warning` 7.8:1, `destructive` 6.6:1.
Everything clears AA for body text.

## How hierarchy works without colour

Because the accent is white, emphasis comes from **fill, weight and opacity**:

- **Filled white** (`bg-primary text-primary-foreground`) means selected or
  primary: the active tab or rail item, the Watched badge, the main action.
- **Outlined or muted** (`variant="outline"`, `bg-secondary`) means secondary:
  "To watch", filters that are off, less important actions.
- **Tinted surfaces** (`bg-primary/10 ring-1 ring-primary/30`) mark a card that
  carries meaning, such as the guest sync callout or the next-episode card.
  This is the card "accent". Use it on cards that matter, not on every card.
- Rank numbers, chart series and legends step down in lightness, not hue.

The `default` and `contrast` button variants are both white now. Keep using
`contrast` for main CTAs (it follows `foreground`), and `default` where the
button means "this is the selected state" (it follows `primary`).

## Things we don't do

These read as generic or auto-generated and are out of the system:

- Purple, indigo or blue accents, and gradients between them.
- Radial glows or blurred colour blobs behind content. A dark scrim to keep a
  logo legible over a backdrop is fine; decorative glow is not.
- Coloured shadows (`shadow-primary/...`).
- Every section in an identical card. Vary layouts: rows that bleed to the
  edge, plain lists, full-bleed heroes, and the occasional tinted card.
- Gold/silver/bronze or other decorative hues. If something needs to stand
  out, make it white and bold.

## Shape and type

- Font: Inter Variable. Headings are medium or semibold with tight tracking.
- Radius base `0.625rem`. Buttons and pills are fully round (`rounded-4xl`),
  feature cards `rounded-3xl`, posters `rounded-xl` to `rounded-2xl`.
- Focus: a 2px `foreground` outline with a 2px offset on anything that doesn't
  draw its own ring.

## Brand

- Mark: a bookmark with a play triangle cut out (save it, then watch it),
  rendered by `src/components/BrandMark.tsx` in `currentColor`
  (`text-sidebar-primary` by default).
- App icon: the off-white mark (`#F5F5F5`) on a black (`#0A0A0A`) rounded
  square with a 12% white hairline. The maskable and Apple icons are full-bleed
  squares; the OS rounds them.
- Wordmark: Inter SemiBold, -3% tracking, white on dark.
- `theme_color` and `background_color` are `#0a0a0a` (`SITE_CONFIG.themeColor`
  in `src/config/site.ts`, mirrored in `public/manifest.json`).
- Logo files for the README are in `docs/brand/`.

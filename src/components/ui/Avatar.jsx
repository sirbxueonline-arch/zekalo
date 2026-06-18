// Monogram palette (adult default) — soft same-hue bg + darker text, deterministically
// hashed from the name. Calm on white. Each entry: [background, text].
const PASTEL_PALETTE = [
  ['#FCE7F3', '#9D174D'], // pink
  ['#E8E6FB', '#3E37A6'], // brand (deepened V3)
  ['#DCFCE7', '#15803D'], // green
  ['#FEF3C7', '#B45309'], // amber
  ['#E0F2FE', '#0369A1'], // sky
  ['#F1ECFE', '#6D28D9'], // grape
]

// Student "gem" palette (§5.1) — mid-saturation, delightful but calm on white.
// Each entry: [light highlight stop, deep core stop] same-hue for a marbled orb.
const GEM_PALETTE = [
  ['#FFB59E', '#FF8A6B'], // coral
  ['#7FE0DA', '#39C5BB'], // teal
  ['#A99BFF', '#7C6BFF'], // violet
  ['#FFD98A', '#FFC24B'], // amber
  ['#9AD2FF', '#5BB8FF'], // sky
  ['#FFA9CB', '#FF7BAC'], // rose
  ['#C2E88A', '#9BD64B'], // lime
  ['#B79BF5', '#8B5CF6'], // grape
]

// Stable string hash → unsigned 32-bit int.
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

// Map legacy stored hex colors (avatar_color) onto a stable palette index so
// existing data keeps a consistent, friendly look.
function pickPalette(name) {
  if (!name) return PASTEL_PALETTE[0]
  return PASTEL_PALETTE[hashString(name) % PASTEL_PALETTE.length]
}

function paletteFromColor(color, name) {
  if (!color) return pickPalette(name)
  // If a stored color is one of our backgrounds, use its pair; otherwise hash
  // the color string itself so a given stored color is always stable.
  const exact = PASTEL_PALETTE.find(([bg]) => bg.toLowerCase() === color.toLowerCase())
  if (exact) return exact
  return PASTEL_PALETTE[hashString(color) % PASTEL_PALETTE.length]
}

// Deterministic gem gradient seeded from a stable key (color > name).
// Returns the two same-hue stops plus an off-center highlight origin so each
// orb reads as a softly marbled, individually-lit gem.
function gemFromSeed(color, name) {
  const seed = String(color || name || '?')
  const h = hashString(seed)
  const [light, core] = GEM_PALETTE[h % GEM_PALETTE.length]
  // Highlight origin jittered into the upper-left quadrant for a natural sheen.
  const cx = 26 + ((h >>> 3) % 18) // 26–43%
  const cy = 24 + ((h >>> 7) % 16) // 24–39%
  return { light, core, cx, cy }
}

// Named size presets (px). Also accepts a raw number for arbitrary sizes.
const SIZE_PX = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }

export default function Avatar({
  src,
  name,
  color,
  size = 'md',
  variant = 'monogram',
  ring = true,
  className = '',
  ...rest
}) {
  const px = typeof size === 'number' ? size : (SIZE_PX[size] ?? SIZE_PX.md)
  const fontSize = Math.max(11, Math.round(px * 0.4))

  const initials = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const ringStyle = ring
    ? { boxShadow: '0 0 0 2px var(--surface, #fff), 0 1px 3px rgba(20,22,40,0.10)' }
    : undefined

  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: px, height: px, ...ringStyle }}
        {...rest}
      />
    )
  }

  // Student "gem" — deterministic marbled-gradient orb seeded from name/id.
  if (variant === 'gem') {
    const { light, core, cx, cy } = gemFromSeed(color, name)
    return (
      <div
        className={`rounded-full shrink-0 select-none ${className}`}
        style={{
          width: px,
          height: px,
          // Two-stop radial gradient (light → core) for the marbled orb body,
          // with a soft off-center specular highlight layered on top.
          backgroundImage: [
            `radial-gradient(120% 120% at ${cx}% ${cy}%, ${light} 0%, ${core} 62%, ${core} 100%)`,
            `radial-gradient(38% 32% at ${cx}% ${cy}%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)`,
          ].join(', '),
          ...ringStyle,
        }}
        aria-label={name || undefined}
        {...rest}
      />
    )
  }

  // Adult default — monogram circle (initials on a name-hashed pastel).
  const [bg, fg] = paletteFromColor(color, name)

  return (
    <div
      className={`rounded-full flex items-center justify-center font-display font-bold shrink-0 select-none ${className}`}
      style={{
        width: px,
        height: px,
        fontSize,
        lineHeight: 1,
        backgroundColor: bg,
        color: fg,
        ...ringStyle,
      }}
      aria-label={name || undefined}
      {...rest}
    >
      {initials || '?'}
    </div>
  )
}

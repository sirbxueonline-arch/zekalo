import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

// <Confetti> — a celebration overlay made of normal-flow, absolutely-positioned
// .confetti-piece divs (the keyframe + class live in index.css). It fills its
// nearest positioned ancestor, so wrap the celebrating region in a `relative`
// container — it never uses position:fixed and never disturbs layout.
//
// Intensities:
//   burst   → denser + faster (achievement / real milestone)
//   gentle  → sparse + slower (goal reached / teacher class milestone)
//
// Auto-clears ~2.4s after `active` flips true. Respects prefers-reduced-motion:
// renders a single static sparkle glyph instead of falling pieces.
//
// Props:
//   active      mount + play when true                        [boolean]
//   intensity   'burst' | 'gentle' (default 'burst')          [string]
//   className   passed through to the overlay wrapper          [string]

// Category colors from the design-system accent palette.
const COLORS = [
  'var(--brand-500)',
  'var(--mint)',
  'var(--sun)',
  'var(--coral)',
  'var(--grape)',
  'var(--sky)',
]

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// Deterministic pseudo-random in [0,1) from an integer seed — keeps pieces
// varied without seeding Math.random at module scope.
function rand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export default function Confetti({
  active = false,
  intensity = 'burst',
  className = '',
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) return
    setVisible(true)
    // Static sparkle (reduced motion) clears slightly faster; pieces match the
    // 2.4s confetti-fall keyframe.
    const ms = prefersReducedMotion() ? 1400 : 2400
    const timer = setTimeout(() => setVisible(false), ms)
    return () => clearTimeout(timer)
  }, [active])

  if (!visible) return null

  // Reduced motion → one calm static sparkle, no falling pieces.
  if (prefersReducedMotion()) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 flex items-start justify-center pt-4 z-20 ${className}`}
        aria-hidden="true"
      >
        <Sparkles className="w-8 h-8" style={{ color: 'var(--sun)' }} />
      </div>
    )
  }

  const count = intensity === 'gentle' ? 26 : 60
  const baseDuration = intensity === 'gentle' ? 2.8 : 1.9

  const pieces = Array.from({ length: count }, (_, i) => {
    const left = rand(i + 1) * 100
    const delay = rand(i + 2) * (intensity === 'gentle' ? 0.9 : 0.5)
    const duration = baseDuration + rand(i + 3) * 0.9
    const color = COLORS[i % COLORS.length]
    const size = 6 + Math.round(rand(i + 4) * 6) // 6–12px wide
    const round = rand(i + 5) > 0.6 // mix rectangles and dots
    const drift = (rand(i + 6) - 0.5) * 60 // horizontal sway, px
    return (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          width: size,
          height: round ? size : size * 1.6,
          borderRadius: round ? '999px' : '2px',
          background: color,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          // Horizontal offset gives each piece a slightly different launch x.
          marginLeft: `${drift}px`,
        }}
      />
    )
  })

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden z-20 ${className}`}
      aria-hidden="true"
    >
      {pieces}
    </div>
  )
}

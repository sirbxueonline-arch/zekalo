import { useId } from 'react'
import { Award } from 'lucide-react'

// <AchievementCard> — a colored shield/hexagon badge with a white lucide glyph,
// a small "LEVEL n" pill, and three states:
//   • earned       → full color + a spring pop entrance (animate-pop)
//   • in-progress  → full color + an "11/20" mini progress bar at the bottom
//   • locked       → grayscale(1) opacity-50, no pill, no entrance
//
// This is a chrome/gamification primitive (student/parent HIGH on the role
// dial). It is grid-friendly: drop several into a `grid` and they fill cells.
//
// Props:
//   title     achievement name (under the shield)             [string]
//   level     number rendered in the "LEVEL n" pill           [number]
//   icon      a lucide-react component (default Award)         [Component]
//   color     accent hue: one of the keys in COLORS           [string]
//   locked    grayscale + dimmed, hides pill                  [boolean]
//   progress  { current, total } → shows an n/total mini bar  [object]
//   className passed through to the wrapper                    [string]

// Accent hues → [fill gradient stops, tinted shadow rgba]. Each maps to a
// design-system accent. The shield itself is filled solid for punch; the
// surrounding card stays calm white.
const COLORS = {
  brand: { from: '#8A7CE8', to: '#574FCF', shadow: 'rgba(87,79,207,0.35)' },
  grape: { from: '#A78BFA', to: '#8B5CF6', shadow: 'rgba(139,92,246,0.35)' },
  mint:  { from: '#4ADE80', to: '#22C55E', shadow: 'rgba(34,197,94,0.35)' },
  sun:   { from: '#FDE047', to: '#FACC15', shadow: 'rgba(250,204,21,0.40)' },
  coral: { from: '#FDA4AF', to: '#FB7185', shadow: 'rgba(251,113,133,0.35)' },
  sky:   { from: '#7DD3FC', to: '#38BDF8', shadow: 'rgba(56,189,248,0.35)' },
}

// A rounded hexagon shield path (in a 0 0 100 100 viewBox).
const SHIELD_PATH =
  'M50 4 L86 22 Q92 25 92 32 L92 60 Q92 74 80 83 L56 96 Q50 99 44 96 L20 83 Q8 74 8 60 L8 32 Q8 25 14 22 Z'

export default function AchievementCard({
  title,
  level,
  icon: Icon = Award,
  color = 'brand',
  locked = false,
  progress,
  className = '',
}) {
  const c = COLORS[color] || COLORS.brand
  const gradId = useId()

  const hasProgress =
    !locked &&
    progress &&
    typeof progress.current === 'number' &&
    typeof progress.total === 'number' &&
    progress.total > 0

  const pct = hasProgress
    ? Math.max(0, Math.min(100, (progress.current / progress.total) * 100))
    : 0

  return (
    <div
      className={`liquid-card hover:!transform-none hover:!shadow-soft hover:!border-hairline flex flex-col items-center text-center p-5 ${
        locked ? '' : 'animate-pop'
      } ${className}`}
      style={
        locked
          ? { filter: 'grayscale(1)', opacity: 0.5, boxShadow: 'none' }
          : undefined
      }
    >
      {/* Shield */}
      <div className="relative" style={{ width: 84, height: 84 }}>
        <svg
          viewBox="0 0 100 100"
          width="84"
          height="84"
          aria-hidden="true"
          style={
            locked
              ? undefined
              : { filter: `drop-shadow(0 6px 14px ${c.shadow})` }
          }
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.from} />
              <stop offset="100%" stopColor={c.to} />
            </linearGradient>
          </defs>
          <path d={SHIELD_PATH} fill={`url(#${gradId})`} />
          {/* soft top sheen */}
          <path
            d={SHIELD_PATH}
            fill="#fff"
            opacity="0.14"
            transform="translate(0 -2) scale(1 0.5)"
            style={{ transformOrigin: '50% 0' }}
          />
        </svg>
        {/* White glyph centered over the shield */}
        <span className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-8 h-8 text-white" strokeWidth={2.25} aria-hidden="true" />
        </span>
      </div>

      {/* LEVEL n pill */}
      {!locked && level != null && (
        <span
          className="mt-3 inline-flex items-center rounded-pill font-display font-extrabold uppercase tracking-[0.06em] tabular-nums"
          style={{
            fontSize: 10.5,
            padding: '3px 10px',
            color: c.to,
            background: `${c.to}1A`,
          }}
        >
          LEVEL {level}
        </span>
      )}

      {/* Title */}
      <p className="mt-2 text-[13.5px] font-semibold text-ink-900 leading-snug">
        {title}
      </p>

      {/* In-progress mini bar */}
      {hasProgress && (
        <div className="mt-2.5 w-full">
          <div className="xp-track" style={{ height: 7 }}>
            <div
              className="h-full rounded-pill transition-[width] duration-700"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${c.from}, ${c.to})`,
              }}
            />
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-ink-400 tabular-nums">
            {progress.current}/{progress.total}
          </p>
        </div>
      )}
    </div>
  )
}

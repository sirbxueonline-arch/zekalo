import { useId } from 'react'
import { Check } from 'lucide-react'

// <StreakBadge> — a flame silhouette (inline SVG, gradient --flame-from →
// --flame-to) with the day count centered inside, plus a 7-dot week strip
// below using the .streak-dot done/today/future recipe. The flame has an idle
// pulse (.animate-flame, 1.8s) that the global prefers-reduced-motion rule
// collapses. Streak warmth = coral/flame per the design system.
//
// Props:
//   days   the streak count shown inside the flame (default 0).
//   week   array of 7 booleans — which days this week are completed. The first
//          incomplete day is treated as "today" (ring); the rest are "future".
//   size   flame width in px (default 88).
//   showWeek  render the week strip (default true).
//   className / style passed through to the wrapper.

const DAYS = 7

export default function StreakBadge({
  days = 0,
  week,
  size = 88,
  showWeek = true,
  className = '',
  style,
  ...props
}) {
  const gradId = useId()
  // Normalize week to exactly 7 booleans.
  const strip = Array.from({ length: DAYS }, (_, i) =>
    Array.isArray(week) ? Boolean(week[i]) : false
  )
  // "Today" = first not-yet-done day (the ring marker).
  const todayIdx = strip.findIndex((d) => !d)

  const height = Math.round(size * 1.18)

  return (
    <div
      className={`inline-flex flex-col items-center ${className}`}
      style={style}
      {...props}
    >
      <div
        className="relative animate-flame"
        style={{ width: size, height }}
        aria-label={`${days}`}
      >
        <svg
          width={size}
          height={height}
          viewBox="0 0 100 118"
          fill="none"
          aria-hidden="true"
          style={{ filter: 'drop-shadow(0 6px 14px rgba(255,90,31,0.35))' }}
        >
          <defs>
            <linearGradient id={gradId} x1="50" y1="2" x2="50" y2="116" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="var(--flame-from)" />
              <stop offset="1" stopColor="var(--flame-to)" />
            </linearGradient>
          </defs>
          <path
            d="M52 2c4 16-6 24-15 33C26 46 16 58 16 74c0 23 17 42 38 42s38-17 38-40c0-14-7-25-15-33 1 9-3 15-9 17 5-15-6-30-16-37 2 12-4 19-11 24-6 5-11 9-11 17 0 6 3 11 8 14-12-3-20-13-20-26 0-19 18-30 24-48 4 6 7 9 12 12-2-7-1-13-2-20z"
            fill={`url(#${gradId})`}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-white tabular-nums"
          style={{
            fontSize: Math.round(size * 0.38),
            paddingTop: Math.round(size * 0.18),
            textShadow: '0 1px 2px rgba(180,60,10,0.45)',
          }}
        >
          {days}
        </span>
      </div>

      {showWeek && (
        <div className="flex items-center gap-1.5 mt-2">
          {strip.map((done, i) => {
            const isToday = !done && i === todayIdx
            const cls = done ? 'done' : isToday ? 'today' : 'future'
            return (
              <span key={i} className={`streak-dot ${cls}`} aria-hidden="true">
                {done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

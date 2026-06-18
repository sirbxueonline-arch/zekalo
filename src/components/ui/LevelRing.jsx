import { useEffect, useRef, useState } from 'react'

// <LevelRing> — SVG dual-circle progress ring. A hairline track sits under a
// brand-500 arc with round caps, rotated -90deg so it fills from the top. The
// arc animates its stroke-dashoffset on mount (~800ms ease-out-quint, with a
// gentle overshoot per the motion spec). The center holds the level/number with
// an optional small label beneath.
//
// Props:
//   value     progress value (default 0).
//   max       value at a full ring (default 100).
//   size      diameter in px (default 96).
//   stroke    arc thickness in px (default 8).
//   label     small caption under the center number (e.g. "Səviyyə").
//   center    custom center content; overrides the default number.
//   color     arc color (default var(--brand-500)).
//   trackColor track color (default var(--hairline)).
//   className / style passed through to the wrapper.

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export default function LevelRing({
  value = 0,
  max = 100,
  size = 96,
  stroke = 8,
  label,
  center,
  color = 'var(--brand-500)',
  trackColor = 'var(--hairline)',
  className = '',
  style,
  ...props
}) {
  const safeMax = max > 0 ? max : 1
  const pct = Math.max(0, Math.min(value / safeMax, 1))

  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  // Drive the dashoffset: start empty, animate to the target on mount.
  const reduced = prefersReducedMotion()
  const [progress, setProgress] = useState(() => (reduced ? pct : 0))
  const firstMount = useRef(true)

  useEffect(() => {
    if (reduced) {
      setProgress(pct)
      return
    }
    // On first mount sweep from 0; afterwards transition between values.
    if (firstMount.current) {
      firstMount.current = false
      const id = requestAnimationFrame(() => setProgress(pct))
      return () => cancelAnimationFrame(id)
    }
    setProgress(pct)
  }, [pct, reduced])

  const offset = circumference * (1 - progress)
  const cx = size / 2
  const cy = size / 2

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, ...style }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(safeMax)}
      aria-label={label || 'Səviyyə'}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: reduced
              ? 'none'
              : 'stroke-dashoffset .8s var(--ease-out-quint)',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {center != null ? (
          center
        ) : (
          <>
            <span
              className="font-display font-extrabold text-ink-900 tabular-nums"
              style={{ fontSize: Math.round(size * 0.3) }}
            >
              {value}
            </span>
            {label && (
              <span className="text-[11px] font-semibold text-ink-400 mt-0.5">
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

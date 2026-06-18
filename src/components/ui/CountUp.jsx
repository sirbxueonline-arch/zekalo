import { useEffect, useRef, useState } from 'react'

// <CountUp> — animates a number from→to over ~700ms via requestAnimationFrame
// with an ease-out curve. Pair with bars/rings (XPBar, LevelRing) and stat
// numbers. Respects prefers-reduced-motion: the final value renders instantly.
//
// Props:
//   to        target value (required)
//   from      starting value (default 0)
//   duration  ms (default 700)
//   decimals  fixed decimal places (default 0)
//   prefix / suffix   strings wrapped around the number
//   separator thousands separator (default '' = none)
//   className / style passed through to the wrapper <span>

// Quintic ease-out — fast start, gentle settle. Matches --ease-out-quint vibe.
const easeOut = (t) => 1 - Math.pow(1 - t, 5)

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function format(value, decimals, separator) {
  const fixed = Number(value).toFixed(decimals)
  if (!separator) return fixed
  const [intPart, decPart] = fixed.split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return decPart != null ? `${grouped}.${decPart}` : grouped
}

export default function CountUp({
  to = 0,
  from = 0,
  duration = 700,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = '',
  className = '',
  style,
  ...props
}) {
  const [display, setDisplay] = useState(() =>
    prefersReducedMotion() ? to : from
  )
  const rafRef = useRef(null)
  const fromRef = useRef(from)

  useEffect(() => {
    // Reduced motion → snap to final value, skip the animation entirely.
    if (prefersReducedMotion()) {
      setDisplay(to)
      return
    }

    const start = fromRef.current
    const delta = to - start
    if (delta === 0) {
      setDisplay(to)
      return
    }

    let startTime = null
    const tick = (now) => {
      if (startTime === null) startTime = now
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOut(progress)
      setDisplay(start + delta * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(to)
        fromRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      fromRef.current = to
    }
  }, [to, duration])

  return (
    <span
      className={`tabular-nums ${className}`}
      style={style}
      {...props}
    >
      {prefix}
      {format(display, decimals, separator)}
      {suffix}
    </span>
  )
}

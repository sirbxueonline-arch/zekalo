import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

// <XPBar> — rounded-pill XP meter. hairline track (.xp-track) + gold fill
// (.xp-fill, linear-gradient #FFD43B→#FACC15) with a gold ⚡ cap riding the
// fill edge and a "120 / 200 XP" label. Width animates 600ms ease-out-quint
// (handled by the .xp-fill transition); reduced-motion collapses it instantly
// via the global CSS rule.
//
// Props:
//   value     XP toward target. Alias: `current` (use either).
//   current   alias for value.
//   target    XP needed to fill (default 100).
//   label     show the "x / y XP" caption (default true).
//   labelText override the auto caption with a custom node.
//   showCap   show the gold ⚡ cap on the fill edge (default true).
//   className / style passed through to the wrapper.

export default function XPBar({
  value,
  current,
  target = 100,
  label = true,
  labelText,
  showCap = true,
  className = '',
  style,
  ...props
}) {
  const raw = value != null ? value : current != null ? current : 0
  const safeTarget = target > 0 ? target : 1
  const clamped = Math.max(0, Math.min(raw, safeTarget))
  const pct = (clamped / safeTarget) * 100

  // Animate from 0 on mount so the fill sweeps in (CSS transition does the rest).
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])

  return (
    <div className={`w-full ${className}`} style={style} {...props}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-ink-400 uppercase tracking-[0.04em]">
            XP
          </span>
          <span className="text-[13px] font-semibold text-ink-600 tabular-nums">
            {labelText != null ? (
              labelText
            ) : (
              <>
                {Math.round(raw)} / {Math.round(safeTarget)} XP
              </>
            )}
          </span>
        </div>
      )}

      <div
        className="xp-track relative"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={Math.round(safeTarget)}
      >
        <div className="xp-fill" style={{ width: `${width}%` }} />

        {showCap && width > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1/2 flex items-center justify-center"
            style={{
              left: `${width}%`,
              transform: 'translate(-50%, -50%)',
              width: 20,
              height: 20,
              borderRadius: 999,
              background: 'linear-gradient(180deg, #FFD43B, #FACC15)',
              boxShadow:
                '0 2px 6px -1px rgba(202,154,4,0.55), inset 0 1px 0 rgba(255,255,255,0.6)',
              transition: 'left .6s var(--ease-out-quint)',
            }}
          >
            <Zap className="w-3 h-3 text-white" fill="currentColor" strokeWidth={0} />
          </span>
        )}
      </div>
    </div>
  )
}

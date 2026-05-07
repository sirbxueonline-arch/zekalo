// Pastel ring spinner — periwinkle ring with mint + periwinkle accent arc.
// Drop-in replacement for the previous Loader2 spinner; same prop signature.
const SIZE_MAP = {
  sm: { d: 16, w: 2 },
  md: { d: 32, w: 3 },
  lg: { d: 48, w: 4 },
}

export default function Spinner({ size = 'md', className = '' }) {
  const s = SIZE_MAP[size] || SIZE_MAP.md
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <PastelRing diameter={s.d} thickness={s.w} />
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <PastelRing diameter={42} thickness={3.5} />
    </div>
  )
}

function PastelRing({ diameter, thickness }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="inline-block animate-spin"
      style={{
        width: diameter,
        height: diameter,
        borderRadius: '50%',
        // soft periwinkle base ring
        border: `${thickness}px solid rgba(124,110,224,0.18)`,
        // active arc — mint primary, periwinkle secondary
        borderTopColor: '#5db8a3',
        borderRightColor: '#7c6ee0',
        animationDuration: '0.85s',
        animationTimingFunction: 'linear',
      }}
    />
  )
}

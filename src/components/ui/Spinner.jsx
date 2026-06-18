// Friendly brand-500 spinner — a soft brand-tinted track with a bright
// brand-500 arc that sweeps round. Same prop signature as before; PageSpinner
// keeps its export. Motion collapses under prefers-reduced-motion (handled
// globally in index.css).
const SIZE_MAP = {
  sm: { d: 16, w: 2 },
  md: { d: 32, w: 3 },
  lg: { d: 48, w: 4 },
}

export default function Spinner({ size = 'md', className = '' }) {
  const s = SIZE_MAP[size] || SIZE_MAP.md
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <BrandRing diameter={s.d} thickness={s.w} />
    </div>
  )
}

export function PageSpinner() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 min-h-[60vh]"
      style={{ background: 'var(--canvas)' }}
    >
      <BrandRing diameter={44} thickness={4} />
      {/* tiny bobbing brand dot — a little spark of life under the ring */}
      <span
        aria-hidden="true"
        className="animate-bob"
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: 'var(--brand-500)',
          boxShadow: '0 4px 10px -2px rgba(87,79,207,0.45)',
        }}
      />
    </div>
  )
}

function BrandRing({ diameter, thickness }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="inline-block animate-spin"
      style={{
        width: diameter,
        height: diameter,
        borderRadius: '50%',
        // soft brand base track
        border: `${thickness}px solid var(--brand-100, #ECE9FE)`,
        // bright brand-500 leading arc
        borderTopColor: 'var(--brand-500)',
        animationDuration: '0.7s',
        animationTimingFunction: 'linear',
      }}
    />
  )
}

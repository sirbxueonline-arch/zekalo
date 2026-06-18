// Status pills — soft tint background + saturated same-hue text + a 6px leading
// dot, matching the .pill-* recipe in the design system. Full-radius, 12px/600.
// Each variant maps to one of the palette hues: mint / blue / peri / peach /
// rose / muted / grape / sun.

// Palette: soft-tint bg + saturated same-hue text (dot inherits via currentColor).
const palette = {
  mint:  { bg: '#DCFCE7', color: '#15803D' },
  blue:  { bg: '#DBEAFE', color: '#1D4ED8' },
  peri:  { bg: '#ECE9FE', color: '#4A3FB8' },
  peach: { bg: '#FEF3C7', color: '#B45309' },
  rose:  { bg: '#FEE2E2', color: '#B91C1C' },
  muted: { bg: '#F1F2F4', color: '#5A6072' },
  grape: { bg: '#F1ECFE', color: '#6D28D9' },
  sun:   { bg: '#FEF7D6', color: '#CA9A04' },
}

// Variant → palette hue. Every legacy variant is preserved and remapped.
const variantHue = {
  // Semantic
  success: 'mint',
  warning: 'peach',
  info:    'blue',
  neutral: 'muted',
  error:   'rose',

  // Editions / curriculum (kept for back-compat)
  ib:       'peri',
  national: 'mint',
  ap:       'peach',

  // Attendance / status
  present: 'mint',
  absent:  'rose',
  late:    'peach',
  excused: 'blue',

  // Performance
  excellent: 'mint',
  good:      'peri',
  poor:      'rose',

  default: 'muted',
}

export default function Badge({ variant = 'default', children, className = '' }) {
  // Achievement: a colored shield-ish chip (grape tint + shield glyph) for the
  // gamification surfaces. Distinct lead glyph instead of the status dot.
  if (variant === 'achievement') {
    const s = palette.grape
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold leading-tight tabular-nums whitespace-nowrap ${className}`}
        style={{ background: s.bg, color: s.color, fontSize: '12px', padding: '2px 10px' }}
      >
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
          <path d="M12 1.5 4 4.2v6.3c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V4.2L12 1.5Zm-1.2 14.3-3.4-3.4 1.6-1.6 1.8 1.8 4.4-4.4 1.6 1.6-6 6Z" />
        </svg>
        {children}
      </span>
    )
  }

  // Resolve hue: accept either a semantic variant (e.g. "success") or a direct
  // palette hue (e.g. "mint"); fall back to muted.
  const hue = variantHue[variant] || (palette[variant] ? variant : 'muted')
  const s = palette[hue] || palette.muted
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold leading-tight tabular-nums whitespace-nowrap ${className}`}
      style={{ background: s.bg, color: s.color, fontSize: '12px', padding: '2px 10px' }}
    >
      <span
        aria-hidden="true"
        className="inline-block rounded-full"
        style={{ width: '6px', height: '6px', background: 'currentColor', opacity: 0.85, flexShrink: 0 }}
      />
      {children}
    </span>
  )
}

export function GradeBadge({ score }) {
  if (score == null || typeof score !== 'number' || isNaN(score)) {
    return <Badge variant="default">—</Badge>
  }
  const variant = score >= 8 ? 'excellent' : score >= 6 ? 'good' : 'poor'
  return <Badge variant={variant}>{score.toString().replace('.', ',')}</Badge>
}

export function StatusBadge({ status, labels }) {
  const defaultLabels = { present: 'İştirak', absent: 'Buraxılmış', late: 'Gecikən' }
  const l = labels || defaultLabels
  return <Badge variant={status}>{l[status] || status}</Badge>
}

export function EditionBadge({ edition, govLabel }) {
  if (edition === 'ib') return <Badge variant="ib">IB</Badge>
  return <Badge variant="national">{govLabel || 'Dövlət'}</Badge>
}

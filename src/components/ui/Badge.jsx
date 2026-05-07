// Pastel pill badges. Soft tinted backgrounds with darker accent text and
// a subtle 1px border that blends into the liquid-glass aesthetic.
const styles = {
  // Semantic
  success: { bg: 'rgba(93,184,163,0.14)', color: '#2e7363', border: '1px solid rgba(93,184,163,0.36)' },
  warning: { bg: 'rgba(232,168,124,0.15)', color: '#a55f33', border: '1px solid rgba(232,168,124,0.4)' },
  info:    { bg: 'rgba(124,110,224,0.12)', color: '#5e4fc7', border: '1px solid rgba(124,110,224,0.28)' },
  neutral: { bg: 'rgba(100,116,139,0.10)', color: '#475569', border: '1px solid rgba(100,116,139,0.22)' },
  error:   { bg: 'rgba(239,68,68,0.08)',   color: '#b91c1c', border: '1px solid rgba(239,68,68,0.25)' },

  // Editions / curriculum (kept for back-compat)
  ib:       { bg: 'rgba(124,110,224,0.12)', color: '#5e4fc7', border: '1px solid rgba(124,110,224,0.28)' },
  national: { bg: 'rgba(93,184,163,0.12)',  color: '#3a8170', border: '1px solid rgba(93,184,163,0.32)' },
  ap:       { bg: 'rgba(232,168,124,0.15)', color: '#a55f33', border: '1px solid rgba(232,168,124,0.4)' },

  // Attendance / status
  present: { bg: 'rgba(93,184,163,0.12)',   color: '#3a8170', border: '1px solid rgba(93,184,163,0.32)' },
  absent:  { bg: 'rgba(239,68,68,0.08)',    color: '#b91c1c', border: '1px solid rgba(239,68,68,0.25)' },
  late:    { bg: 'rgba(232,168,124,0.15)',  color: '#a55f33', border: '1px solid rgba(232,168,124,0.4)' },

  // Performance
  excellent: { bg: 'rgba(93,184,163,0.14)', color: '#2e7363', border: '1px solid rgba(93,184,163,0.36)' },
  good:      { bg: 'rgba(124,110,224,0.12)', color: '#5e4fc7', border: '1px solid rgba(124,110,224,0.28)' },
  poor:      { bg: 'rgba(239,68,68,0.08)',   color: '#b91c1c', border: '1px solid rgba(239,68,68,0.25)' },

  default: { bg: 'rgba(255,255,255,0.6)', color: '#64748b', border: '1px solid rgba(124,110,224,0.18)' },
}

export default function Badge({ variant = 'default', children, className = '' }) {
  const s = styles[variant] || styles.default
  return (
    <span
      className={`rounded-full text-xs font-semibold px-2.5 py-0.5 inline-flex items-center gap-1 backdrop-blur-md ${className}`}
      style={{ background: s.bg, color: s.color, border: s.border }}
    >
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

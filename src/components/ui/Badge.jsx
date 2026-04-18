const styles = {
  ib: 'bg-purple-light text-purple-dark border border-[#AFA9EC]',
  national: 'bg-teal-light text-[#085041] border border-teal-mid',
  ap: 'bg-[#faeeda] text-[#633806] border border-[#EF9F27]',
  present: 'bg-teal-light text-[#085041] border border-teal-mid',
  absent: 'bg-red-50 text-red-600 border border-red-200',
  late: 'bg-[#faeeda] text-[#633806] border border-[#EF9F27]',
  excellent: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  good: 'bg-purple-light text-purple border border-purple/20',
  poor: 'bg-red-50 text-red-600 border border-red-200',
  default: 'bg-surface text-gray-500 border border-border-soft',
}

export default function Badge({ variant = 'default', children, className = '' }) {
  return (
    <span className={`rounded-full text-xs font-semibold px-2.5 py-0.5 inline-flex items-center ${styles[variant] || styles.default} ${className}`}>
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

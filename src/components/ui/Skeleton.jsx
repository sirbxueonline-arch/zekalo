// Pastel-tinted skeletons. Uses periwinkle wash instead of cold gray to match
// the liquid-glass aesthetic. Drop-in replacement for old gray skeletons.
export function Skeleton({ className = '', style }) {
  return (
    <div className={`pastel-skeleton ${className}`} style={style} />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="pastel-skeleton"
          style={{ height: '14px', width: i === lines - 1 ? '60%' : '100%', borderRadius: 8 }}
        />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="liquid-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-12" style={{ borderRadius: '16px' }} />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function CardSkeleton({ rows = 4, className = '' }) {
  return (
    <div className={`liquid-card p-6 space-y-4 ${className}`}>
      <Skeleton className="h-5" style={{ width: '8rem' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 flex-shrink-0" style={{ borderRadius: '999px' }} />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3" style={{ width: '75%' }} />
            <Skeleton className="h-3" style={{ width: '50%' }} />
          </div>
          <Skeleton className="h-6 w-12" style={{ borderRadius: '999px' }} />
        </div>
      ))}
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function TableSkeleton({ rows = 6, cols = 5, className = '' }) {
  return (
    <div className={`liquid-card overflow-hidden ${className}`} style={{ padding: 0 }}>
      <div
        className="px-6 py-4"
        style={{
          background: 'rgba(248,247,251,0.8)',
          borderBottom: '1px solid rgba(124,110,224,0.12)',
        }}
      >
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="px-6 py-4 flex gap-4"
          style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8" style={{ width: '12rem' }} />
        <Skeleton className="h-4" style={{ width: '16rem' }} />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <StatCardSkeleton key={i} />)}
      </div>
      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
      </div>
    </div>
  )
}

export default Skeleton

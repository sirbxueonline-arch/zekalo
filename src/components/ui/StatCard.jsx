export default function StatCard({ label, value, icon: Icon, trend, className = '' }) {
  return (
    <div className={`bg-surface rounded-xl p-6 border border-border-soft ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs tracking-widest text-gray-400 uppercase">{label}</span>
        {Icon && <Icon className="w-5 h-5 text-purple-mid" />}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        {trend && (
          <span className={`text-xs font-medium mb-1 ${trend > 0 ? 'text-teal' : trend < 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  )
}

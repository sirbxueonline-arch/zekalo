export default function StatCard({ label, value, icon: Icon, trend, iconBg = 'bg-purple-light', iconColor = 'text-purple', className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-border-soft p-6 flex items-start justify-between hover:shadow-md transition-shadow ${className}`}>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="font-serif text-3xl text-gray-900 mt-1">{value}</p>
        {trend != null && (
          <p className={`text-xs font-medium mt-1 ${trend > 0 ? 'text-teal' : trend < 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </p>
        )}
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      )}
    </div>
  )
}

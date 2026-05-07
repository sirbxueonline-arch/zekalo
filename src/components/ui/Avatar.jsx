// Pastel avatar palette — deterministic from name
const PASTEL_COLORS = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde', '#9d92ea', '#7fcab8']

function pickColor(name) {
  if (!name) return PASTEL_COLORS[0]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return PASTEL_COLORS[h % PASTEL_COLORS.length]
}

export default function Avatar({ name, color, size = 'md', className = '' }) {
  const initials = (name || '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  const bg = color || pickColor(name)

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${sizes[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, ${bg}dd 100%)`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(124,110,224,0.18)',
      }}
    >
      {initials}
    </div>
  )
}

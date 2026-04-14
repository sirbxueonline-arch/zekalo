export default function Avatar({ name, color = '#534AB7', size = 'md', className = '' }) {
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

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium ${sizes[size]} ${className}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

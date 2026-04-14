import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-purple text-white hover:bg-purple-dark',
  ghost: 'border border-purple text-purple hover:bg-purple-light',
  teal: 'border border-teal text-teal hover:bg-teal-light',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  secondary: 'bg-surface text-gray-700 border border-border-soft hover:bg-purple-light',
}

export default function Button({ children, variant = 'primary', className = '', loading, disabled, ...props }) {
  return (
    <button
      className={`rounded-md px-6 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {children}
        </span>
      ) : children}
    </button>
  )
}

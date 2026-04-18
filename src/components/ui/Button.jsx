import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-purple text-white shadow-sm hover:bg-purple-dark hover:shadow-md active:scale-[0.98]',
  ghost: 'border border-purple text-purple hover:bg-purple-light hover:text-purple active:scale-[0.98]',
  teal: 'border border-teal text-teal hover:bg-teal-light active:scale-[0.98]',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md active:scale-[0.98]',
  secondary: 'bg-surface text-gray-700 border border-border-soft shadow-sm hover:bg-purple-light hover:shadow-md active:scale-[0.98]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', loading, disabled, ...props }) {
  return (
    <button
      className={`rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-current opacity-90" />
          {children}
        </span>
      ) : children}
    </button>
  )
}

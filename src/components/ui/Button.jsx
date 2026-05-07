import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'text-white border border-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_24px_rgba(124,110,224,0.25),0_2px_6px_rgba(93,184,163,0.15)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_12px_32px_rgba(124,110,224,0.35),0_3px_8px_rgba(93,184,163,0.2)] hover:-translate-y-0.5 active:translate-y-0',
  secondary: 'bg-white/60 backdrop-blur-md text-[#1a1a2e] border border-[rgba(124,110,224,0.25)] shadow-sm hover:bg-white/85 hover:border-[rgba(124,110,224,0.45)] hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'bg-transparent text-[#534AB7] border border-transparent hover:bg-[rgba(124,110,224,0.08)] hover:text-[#7c6ee0]',
  teal: 'bg-white/60 backdrop-blur-md text-[#1a1a2e] border border-[rgba(93,184,163,0.35)] shadow-sm hover:bg-[rgba(93,184,163,0.08)] hover:border-[rgba(93,184,163,0.55)] hover:-translate-y-0.5 active:translate-y-0',
  danger: 'bg-[#dc2626] text-white border border-white/30 shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:bg-[#b91c1c] hover:shadow-[0_10px_24px_rgba(220,38,38,0.32)] hover:-translate-y-0.5 active:translate-y-0',
}

const primaryGradient = 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)'

const sizes = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-5 py-2 text-sm',
  lg: 'px-7 py-3 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', loading, disabled, style, ...props }) {
  const isPrimary = variant === 'primary'
  const mergedStyle = isPrimary
    ? { background: primaryGradient, ...(style || {}) }
    : style

  const isDisabled = disabled || loading

  return (
    <button
      className={`rounded-full font-semibold transition-all duration-200 ease-out inline-flex items-center justify-center gap-2 ${
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none transform-none' : ''
      } ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={isDisabled}
      style={mergedStyle}
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

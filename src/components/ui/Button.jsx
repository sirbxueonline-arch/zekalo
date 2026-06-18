import { Loader2 } from 'lucide-react'

const variants = {
  // Primary: FLAT solid brand-500 fill, white text, neutral hairline shadow.
  // No gradient, no 3D ledge — hover deepens to brand-600, press nudges 1px.
  primary:
    'bg-brand-500 text-white border border-transparent shadow-[0_1px_2px_rgba(20,22,40,0.08)] ' +
    'hover:bg-brand-600 ' +
    'active:translate-y-[1px]',
  // Secondary: white + hairline-strong border, ink-900 text, hover brand-50.
  secondary:
    'bg-surface text-ink-900 border border-hairline-strong shadow-[0_1px_2px_rgba(20,22,40,0.08)] ' +
    'hover:bg-brand-50 hover:border-brand-300 ' +
    'active:translate-y-[1px]',
  // Ghost: transparent, brand text, hover brand-50 wash.
  ghost:
    'bg-transparent text-brand-500 border border-transparent ' +
    'hover:bg-brand-50 hover:text-brand-600 ' +
    'active:translate-y-[1px]',
  // Teal: mint-tinted outline.
  teal:
    'bg-surface text-ink-900 border border-mint/40 shadow-[0_1px_2px_rgba(20,22,40,0.08)] ' +
    'hover:bg-mint/10 hover:border-mint ' +
    'active:translate-y-[1px]',
  // Danger: flat danger fill, neutral hairline shadow.
  danger:
    'bg-danger text-white border border-transparent shadow-[0_1px_2px_rgba(20,22,40,0.08)] ' +
    'hover:bg-[#DC2626] ' +
    'active:translate-y-[1px]',
}

const sizes = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-5 py-2 text-sm',
  lg: 'px-7 py-3 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', loading, disabled, style, ...props }) {
  const isDisabled = disabled || loading

  return (
    <button
      className={`rounded-pill font-semibold inline-flex items-center justify-center gap-2 select-none ` +
        `transition-[transform,background-color,border-color,color] duration-150 ease-out-quint ` +
        `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 ${
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none transform-none' : ''
        } ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      disabled={isDisabled}
      style={style}
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

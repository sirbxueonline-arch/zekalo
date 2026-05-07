import { forwardRef, useId } from 'react'

const glassBase =
  'w-full rounded-xl px-4 py-3 text-sm text-[#1a1a2e] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

const glassStyle = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(124,110,224,0.25)',
}

const errorStyle = {
  border: '1px solid rgba(220,38,38,0.5)',
  background: 'rgba(254,226,226,0.5)',
}

function HelperRow({ error, helperText }) {
  if (error) return <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
  if (helperText) return <p className="mt-1.5 text-xs text-[#64748b]">{helperText}</p>
  return null
}

const Input = forwardRef(function Input({ label, error, helperText, className = '', style, ...props }, ref) {
  const id = useId()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#1a1a2e] mb-1.5 block">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        style={{ ...glassStyle, ...(error ? errorStyle : {}), ...style }}
        className={`${glassBase} ${
          error
            ? 'focus:ring-red-200 focus:border-red-400'
            : 'focus:ring-[rgba(124,110,224,0.2)] focus:border-[rgba(124,110,224,0.5)]'
        } ${className}`}
        {...props}
      />
      <HelperRow error={error} helperText={helperText} />
    </div>
  )
})

export default Input

export function Textarea({ label, error, helperText, className = '', style, ...props }) {
  const id = useId()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#1a1a2e] mb-1.5 block">
          {label}
        </label>
      )}
      <textarea
        id={id}
        style={{ ...glassStyle, ...(error ? errorStyle : {}), ...style }}
        className={`${glassBase} resize-none min-h-[88px] ${
          error
            ? 'focus:ring-red-200 focus:border-red-400'
            : 'focus:ring-[rgba(124,110,224,0.2)] focus:border-[rgba(124,110,224,0.5)]'
        } ${className}`}
        {...props}
      />
      <HelperRow error={error} helperText={helperText} />
    </div>
  )
}

export function Select({ label, error, helperText, children, className = '', style, ...props }) {
  const id = useId()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#1a1a2e] mb-1.5 block">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          style={{ ...glassStyle, ...(error ? errorStyle : {}), ...style }}
          className={`${glassBase} appearance-none pr-9 ${
            error
              ? 'focus:ring-red-200 focus:border-red-400'
              : 'focus:ring-[rgba(124,110,224,0.2)] focus:border-[rgba(124,110,224,0.5)]'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-4 h-4 text-[#7c6ee0]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <HelperRow error={error} helperText={helperText} />
    </div>
  )
}

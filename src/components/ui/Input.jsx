import { forwardRef, useId } from 'react'

// Label sits above the field: 13px ink-700 semibold, 6px gap.
const labelClass = 'block text-[13px] font-semibold leading-tight text-ink-700 mb-1.5'

// Base field: relies on .pastel-input (white bg, hairline-strong border,
// rounded-input 12px, 40px tall, 14px text, brand focus + ring, smooth transition).
const fieldBase = 'pastel-input'

// Error overrides: danger border + danger ring on focus.
const errorClass =
  'border-danger focus:border-danger shadow-[0_0_0_3px_rgba(239,68,68,0.15)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'

function HelperRow({ error, helperText }) {
  if (error) return <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
  if (helperText) return <p className="mt-1.5 text-xs text-ink-400">{helperText}</p>
  return null
}

const Input = forwardRef(function Input({ label, error, helperText, className = '', style, ...props }, ref) {
  const id = useId()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        style={style}
        className={`${fieldBase} ${error ? errorClass : ''} ${className}`}
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
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        style={style}
        className={`${fieldBase} h-auto min-h-[88px] resize-none py-2.5 leading-relaxed ${
          error ? errorClass : ''
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
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          style={style}
          className={`${fieldBase} cursor-pointer appearance-none pr-9 ${error ? errorClass : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="h-4 w-4 text-ink-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <HelperRow error={error} helperText={helperText} />
    </div>
  )
}

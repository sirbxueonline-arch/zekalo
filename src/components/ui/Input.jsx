import { forwardRef, useId } from 'react'

const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  const id = useId()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1.5 block">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
          error
            ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
            : 'border-border-soft focus:ring-purple/20 focus:border-purple'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Input

export function Textarea({ label, error, className = '', ...props }) {
  const id = useId()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1.5 block">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
          error
            ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
            : 'border-border-soft focus:ring-purple/20 focus:border-purple'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  const id = useId()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1.5 block">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
            error
              ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
              : 'border-border-soft focus:ring-purple/20 focus:border-purple'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

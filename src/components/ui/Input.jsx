import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        ref={ref}
        className={`w-full border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Input

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <textarea
        className={`w-full border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent resize-none ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select
        className={`w-full border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent bg-white ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

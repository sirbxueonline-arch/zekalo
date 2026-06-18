import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const titleId = useId()
  const panelRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    // Move focus into the dialog for keyboard + screen-reader users.
    panelRef.current?.focus()
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-none',
  }

  const isFull = size === 'full'

  return (
    <div className={`liquid-backdrop ${isFull ? '!p-0' : ''}`}>
      <div className="absolute inset-0" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`liquid-modal relative flex flex-col outline-none ${
          isFull
            ? 'w-screen h-screen mx-0 max-h-screen !rounded-none'
            : `w-full ${sizes[size]} mx-4 max-h-[90vh]`
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-hairline shrink-0">
          <h2 id={titleId} className="font-display font-semibold text-[18px] leading-tight text-ink-900 truncate">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Bağla"
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-ink-400 hover:text-ink-900 hover:bg-hairline transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

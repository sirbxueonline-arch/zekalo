import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// Each type maps to a quiet white-bg + colored-border treatment (.toast-*),
// plus a leading status icon tinted to its own hue. Warning reuses the
// `info` container surface with the sun/amber accent.
const TYPE_CONFIG = {
  success: {
    className: 'toast-success',
    icon: CheckCircle2,
    accent: 'var(--mint)',
    accentSoft: 'rgba(34,197,94,0.12)',
  },
  error: {
    className: 'toast-error',
    icon: XCircle,
    accent: 'var(--danger)',
    accentSoft: 'rgba(239,68,68,0.10)',
  },
  warning: {
    className: 'toast-info',
    icon: AlertTriangle,
    accent: 'var(--warning)',
    accentSoft: 'rgba(245,158,11,0.14)',
  },
  info: {
    className: 'toast-info',
    icon: Info,
    accent: 'var(--brand-500)',
    accentSoft: 'rgba(87,79,207,0.12)',
  },
}

function Toast({ toast, removeToast }) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info
  const Icon = config.icon

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })

    const start = Date.now()
    const duration = 4000
    let rafId
    const tick = () => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (elapsed < duration) {
        rafId = requestAnimationFrame(tick)
      }
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(showTimer)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => removeToast(toast.id), 200)
  }

  return (
    <div
      className={`toast-card ${config.className} flex items-start gap-3 pl-3.5 pr-2.5 py-3 min-w-[300px] max-w-[400px] rounded-tile relative overflow-hidden
        transition-[opacity,transform] duration-200 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
    >
      <div
        className="w-8 h-8 rounded-tile flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: config.accentSoft }}
      >
        <Icon style={{ color: config.accent, width: 18, height: 18 }} />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {toast.title && (
          <p className="font-semibold text-[14px] leading-tight mb-0.5">{toast.title}</p>
        )}
        <p className="text-[14px] leading-snug text-ink-600">{toast.message}</p>
      </div>

      <button
        onClick={handleClose}
        className="shrink-0 flex items-center justify-center w-7 h-7 rounded-pill text-ink-400 hover:text-ink-900 hover:bg-canvas transition-colors"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Quiet auto-dismiss progress hairline */}
      <div
        className="absolute bottom-0 left-0 h-[3px] rounded-full"
        style={{ width: `${progress}%`, background: config.accent, opacity: 0.55 }}
      />
    </div>
  )
}

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 items-end"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  )
}

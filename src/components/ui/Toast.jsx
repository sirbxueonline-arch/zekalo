import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const TYPE_CONFIG = {
  success: {
    border: 'border-teal-200',
    icon: CheckCircle,
    iconColor: 'text-teal-500',
    bar: 'bg-teal-500',
  },
  error: {
    border: 'border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
    bar: 'bg-red-500',
  },
  warning: {
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    bar: 'bg-amber-500',
  },
  info: {
    border: 'border-purple-200',
    icon: Info,
    iconColor: 'text-purple-500',
    bar: 'bg-purple-500',
  },
}

function Toast({ toast, removeToast }) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info
  const Icon = config.icon

  useEffect(() => {
    // Trigger slide-in
    const showTimer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })

    // Animate progress bar
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
    setTimeout(() => removeToast(toast.id), 300)
  }

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border
        min-w-[280px] max-w-[380px] bg-white text-gray-900 relative overflow-hidden
        ${config.border}
        transition-all duration-300
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm leading-tight mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm leading-snug text-gray-700">{toast.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${config.bar} transition-none`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  )
}

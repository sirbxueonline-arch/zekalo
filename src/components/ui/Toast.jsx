import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const TYPE_CONFIG = {
  success: {
    accent: '#5db8a3',
    accentSoft: 'rgba(93,184,163,0.12)',
    icon: CheckCircle,
  },
  error: {
    accent: '#dc2626',
    accentSoft: 'rgba(220,38,38,0.10)',
    icon: XCircle,
  },
  warning: {
    accent: '#e8a87c',
    accentSoft: 'rgba(232,168,124,0.14)',
    icon: AlertTriangle,
  },
  info: {
    accent: '#7c6ee0',
    accentSoft: 'rgba(124,110,224,0.12)',
    icon: Info,
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
    setTimeout(() => removeToast(toast.id), 300)
  }

  return (
    <div
      className={`flex items-start gap-3 pl-4 pr-3 py-3 min-w-[300px] max-w-[400px] text-[#1a1a2e] relative overflow-hidden transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.72) 100%)',
        backdropFilter: 'blur(20px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
        border: '1px solid rgba(255,255,255,0.7)',
        borderLeft: `4px solid ${config.accent}`,
        borderRadius: '16px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 12px 32px rgba(140,120,200,0.18), 0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: config.accentSoft }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: config.accent, width: 18, height: 18 }} />
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm leading-tight mb-0.5 text-[#1a1a2e]">{toast.title}</p>
        )}
        <p className="text-sm leading-snug text-[#475569]">{toast.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-[#94a3b8] hover:text-[#1a1a2e] transition-colors"
        style={{ background: 'rgba(255,255,255,0.5)' }}
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[3px] transition-none"
        style={{ width: `${progress}%`, background: config.accent, opacity: 0.7 }}
      />
    </div>
  )
}

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  )
}

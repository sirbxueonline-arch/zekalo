import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import ToastContainer from '../components/ui/Toast'

const ToastContext = createContext(null)

const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timerIds = useRef(new Set())

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, title }])
    const timerId = setTimeout(() => {
      timerIds.current.delete(timerId)
      setToasts(prev => prev.filter(t => t.id !== id))
    }, AUTO_DISMISS_MS)
    timerIds.current.add(timerId)
  }, [])

  // Clear any pending auto-dismiss timers on unmount to avoid leaks /
  // setState-after-unmount warnings.
  useEffect(() => () => timerIds.current.forEach(clearTimeout), [])

  const toast = {
    success: (msg, title) => addToast(msg, 'success', title),
    error:   (msg, title) => addToast(msg, 'error', title),
    warning: (msg, title) => addToast(msg, 'warning', title),
    info:    (msg, title) => addToast(msg, 'info', title),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

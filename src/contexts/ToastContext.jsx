import { createContext, useContext, useState, useCallback } from 'react'
import ToastContainer from '../components/ui/Toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, title }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

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

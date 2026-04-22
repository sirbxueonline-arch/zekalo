import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ToastProvider } from './contexts/ToastContext'
import { initSentry } from './lib/sentry'
import { Analytics } from '@vercel/analytics/react'
import './index.css'

initSentry()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
          <Analytics />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
)

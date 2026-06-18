import { Component } from 'react'
import { Sentry } from '../../lib/sentry'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
    if (Sentry?.captureException) {
      Sentry.captureException(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas px-6 py-10">
          <div className="text-center max-w-md w-full rounded-card-lg bg-surface shadow-soft-lg px-8 py-10">
            {/* Friendly emoji-free mascot — a gentle star-creature having a little stumble */}
            <div className="mx-auto mb-6 w-32 h-32">
              <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
                {/* soft halo */}
                <circle cx="64" cy="64" r="52" fill="var(--brand-50)" />
                <circle cx="64" cy="64" r="52" fill="var(--brand-100)" opacity="0.5" />
                {/* friendly rounded star body */}
                <path
                  d="M64 22c3 0 5.4 1.9 6.6 4.6l6 13.2 14.4 1.7c5.7.7 8 7.7 3.8 11.6L84 64.8l2.8 14.2c1.1 5.6-4.9 9.9-9.9 7.1L64 79.4l-12.9 6.7c-5 2.8-11-1.5-9.9-7.1L44 64.8 33.2 54.7c-4.2-3.9-1.9-10.9 3.8-11.6L51.4 41.4l6-13.2C58.6 25.5 61 23.6 64 22z"
                  fill="var(--brand-500)"
                />
                {/* lighter inner highlight */}
                <path
                  d="M64 34c1.6 0 3 1 3.7 2.5l3.6 7.9 8.6 1c3 .4 4.2 4 2 6L75 57.5l1.7 8.5c.6 3-2.6 5.3-5.3 3.8L64 66l-7.4 3.8c-2.7 1.5-5.9-.8-5.3-3.8L53 57.5l-6.9-6.1c-2.2-2-1-5.6 2-6l8.6-1 3.6-7.9C61 35 62.4 34 64 34z"
                  fill="var(--brand-400)"
                  opacity="0.55"
                />
                {/* eyes — closed, content little arcs */}
                <path d="M55 58c1.6-2 4.4-2 6 0" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M67 58c1.6-2 4.4-2 6 0" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" />
                {/* small "oops" mouth */}
                <circle cx="64" cy="66" r="2.4" fill="#FFFFFF" />
                {/* cheeks */}
                <circle cx="52" cy="63" r="2.6" fill="var(--coral)" opacity="0.6" />
                <circle cx="76" cy="63" r="2.6" fill="var(--coral)" opacity="0.6" />
                {/* floating sparkles */}
                <circle cx="30" cy="34" r="3" fill="var(--sun)" />
                <circle cx="98" cy="40" r="2.4" fill="var(--mint)" />
                <circle cx="96" cy="92" r="3" fill="var(--coral)" />
                <circle cx="32" cy="94" r="2.2" fill="var(--sky)" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">Xəta baş verdi</h2>
            <p className="text-ink-600 text-sm leading-relaxed mb-7">
              Gözlənilməz bir problem yarandı. Zəhmət olmasa səhifəni yeniləyin.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-3d w-full sm:w-auto !text-sm"
              >
                Səhifəni yenilə
              </button>
              <button
                onClick={() => { window.location.href = '/' }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-pill text-sm font-semibold text-ink-700 bg-surface border border-hairline-strong hover:bg-brand-50 transition-colors"
              >
                Ana səhifə
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

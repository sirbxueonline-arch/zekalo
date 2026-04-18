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
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-gray-900 mb-2">Xəta baş verdi</h2>
            <p className="text-gray-500 text-sm mb-6">Gözlənilməz bir problem yarandı. Zəhmət olmasa səhifəni yeniləyin.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-purple text-white rounded-full text-sm font-medium hover:bg-purple-dark transition-colors"
            >
              Səhifəni yenilə
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

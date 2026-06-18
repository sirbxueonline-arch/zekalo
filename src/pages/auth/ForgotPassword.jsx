import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LanguageContext'
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { AuthStyles, AuthBrandPanel } from './Login'

export default function ForgotPassword() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/sifre-yenile`,
      })
      if (error) throw error
      setSent(true)
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <AuthStyles />

      {/* ── Left brand panel — wordmark + abstract pattern, no mascot ── */}
      <AuthBrandPanel title={t('reset_password')} copy={t('forgot_subtitle')} />

      {/* ── Right form panel ── */}
      <main className="auth-pane">
        <div className="auth-mobile-back">
          <Link to="/" className="auth-link-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Zirva
          </Link>
        </div>

        <div className="auth-card-anim auth-card">
          <div className="auth-logo">
            <span className="auth-wordmark font-display">Zirva</span>
          </div>

          <h1 className="auth-title">{t('reset_password')}</h1>
          <p className="auth-sub">{t('forgot_subtitle')}</p>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle style={{ width: 32, height: 32, color: '#15803D' }} />
              </div>
              <p className="font-display" style={{ fontWeight: 700, color: 'var(--ink-900)', fontSize: 19, marginBottom: 6 }}>
                {t('link_sent')}
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--ink-600)', marginBottom: 22, lineHeight: 1.55 }}>
                <strong style={{ color: 'var(--ink-900)' }}>{email}</strong> {t('link_sent_body')}
              </p>
              <Link to="/daxil-ol" className="auth-link" style={{ fontSize: 13.5 }}>
                {t('back_to_login')}
              </Link>
            </div>
          ) : (
            <>
              {error && <div className="auth-alert auth-alert-danger">{error}</div>}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="auth-label">{t('email')}</label>
                  <input
                    required
                    type="email"
                    className="auth-input"
                    autoComplete="email"
                    placeholder="ad@mekteb.az"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-pastel auth-btn-block"
                  style={{ marginTop: 4 }}
                >
                  {loading ? <><SpinIcon /> {t('sending') || '...'}</> : <>{t('send_link')} <ArrowRight style={{ width: 16, height: 16 }} /></>}
                </button>
              </form>
              <p style={{ color: 'var(--ink-600)', fontSize: 13.5, textAlign: 'center', marginTop: 22 }}>
                <Link to="/daxil-ol" className="auth-link">{t('back_to_login')}</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function SpinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: 'spin .8s linear infinite', flexShrink: 0 }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

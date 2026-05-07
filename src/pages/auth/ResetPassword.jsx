import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LanguageContext'
import { ArrowLeft } from 'lucide-react'

export default function ResetPassword() {
  const { t } = useLang()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Şifrələr uyğun gəlmir'); return }
    if (password.length < 6) { setError('Şifrə ən az 6 simvol olmalıdır'); return }
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/daxil-ol?reset=1')
  }

  const matchError = confirm && password !== confirm ? t('passwords_dont_match') : ''

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        background: 'linear-gradient(-45deg, #e8ecff, #f8f7fb, #c8e6e0, #f5e6d8, #b8c0ff, #f8f7fb)',
        backgroundSize: '400% 400%',
        animation: 'heroGradient 12s ease infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <style>{`
        @keyframes heroGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes authFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .auth-card-anim { animation: authFadeUp .55s cubic-bezier(.22,1,.36,1) both; position: relative; z-index: 5; }
        .auth-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(124,110,224,0.25);
          color: #1a1a2e;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
          font-family: inherit;
          box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: rgba(124,110,224,0.5);
          box-shadow: 0 0 0 4px rgba(124,110,224,0.12);
          background: rgba(255,255,255,0.78);
        }
        .auth-input::placeholder { color: #94a3b8; }
        .auth-input.error { border-color: rgba(239,68,68,0.5); }
        .auth-label { display:block; font-size:12px; font-weight:700; color:#64748b; letterSpacing:'0.04em'; text-transform: uppercase; margin-bottom: 7px; }
        .auth-link { color: #7c6ee0; text-decoration: none; font-weight: 600; transition: color .15s; }
        .auth-link:hover { color: #5b4fcf; }
        .auth-link-muted { color: #64748b; text-decoration: none; font-size: 13px; font-weight: 600; transition: color .15s; }
        .auth-link-muted:hover { color: #1a1a2e; }
        .btn-pastel-full { width: 100%; justify-content: center; padding: 14px 22px; font-size: 14.5px; }
        .btn-pastel-full:disabled { opacity: 0.7; cursor: not-allowed; }
        .field-error { margin-top: 6px; font-size: 12px; color: #dc2626; }
      `}</style>

      <div className="hb1" />
      <div className="hb2" />
      <div className="hb4" />
      <div className="hb6" />

      <div style={{ position: 'fixed', top: 24, left: 28, zIndex: 20 }}>
        <Link to="/" className="auth-link-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Zirva
        </Link>
      </div>

      <div
        className="auth-card-anim liquid-card"
        style={{ width: '100%', maxWidth: 420, padding: '40px 36px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 26 }}>
          <img src="/logo.png" alt="Zirva" style={{ height: 30 }} />
          <span style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e', letterSpacing: '-0.01em' }}>Zirva</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center', color: '#1a1a2e', lineHeight: 1.15 }}>
          <span className="pastel-text">{t('new_password_set')}</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 26 }}>
          {t('new_password_subtitle')}
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="auth-label">{t('new_password')}</label>
            <input
              required
              type="password"
              className="auth-input"
              autoComplete="new-password"
              placeholder={t('new_password_placeholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="auth-label">{t('confirm_password')}</label>
            <input
              required
              type="password"
              className={`auth-input ${matchError ? 'error' : ''}`}
              autoComplete="new-password"
              placeholder={t('confirm_password_placeholder')}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
            {matchError && <p className="field-error">{matchError}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-pastel btn-pastel-full"
            style={{ marginTop: 4 }}
          >
            {loading ? <><SpinIcon /> {t('loading') || '...'}</> : t('update_password_btn')}
          </button>
        </form>
      </div>
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

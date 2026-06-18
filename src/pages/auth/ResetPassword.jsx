import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LanguageContext'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function ResetPassword() {
  const { t } = useLang()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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

  /* Password strength indicator */
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3
  const strengthColors = ['', '#EF4444', '#EAB308', '#1FA855']
  const strengthLabels = ['', 'Zəif', 'Orta', 'Güclü']

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        background: 'var(--canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <style>{`
        @keyframes authFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes strengthGrow { from{width:0} to{width:100%} }
        .auth-card-anim { animation: authFadeUp .5s cubic-bezier(.22,1,.36,1) both; position: relative; z-index: 5; }
        .auth-field-label {
          display:block; font-size:12px; font-weight:600; color:var(--ink-700);
          letter-spacing:.04em; text-transform:uppercase; margin-bottom:6px;
        }
        .auth-input-wrap { position:relative; }
        .auth-input-icon {
          position:absolute; left:13px; top:50%; transform:translateY(-50%);
          color:var(--ink-400); pointer-events:none; display:flex;
        }
        .auth-input-toggle {
          position:absolute; right:13px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:var(--ink-400);
          padding:0; display:flex; transition:color .15s;
        }
        .auth-input-toggle:hover { color:var(--ink-900); }
        .rp-input {
          width:100%; padding:11px 40px; border-radius:10px;
          background:var(--surface); border:1px solid var(--hairline-strong);
          color:var(--ink-900); font-size:14px; font-weight:500;
          outline:none; box-sizing:border-box; font-family:inherit;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .rp-input:focus {
          border-color:var(--brand-500);
          box-shadow: 0 0 0 3px rgba(87,79,207,0.15);
        }
        .rp-input.has-error { border-color: var(--danger); }
        .rp-input.has-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.15); }
        .rp-input::placeholder { color:var(--ink-400); }
        .auth-link {
          color:var(--brand-500); text-decoration:none; font-weight:600; transition:color .15s;
        }
        .auth-link:hover { color:var(--brand-600); }
        .auth-link-muted {
          color:var(--ink-600); text-decoration:none; font-size:13px; font-weight:600; transition:color .15s;
        }
        .auth-link-muted:hover { color:var(--ink-900); }
        @media (prefers-reduced-motion: reduce) {
          .auth-card-anim { animation:none; }
        }
      `}</style>

      {/* Single calm hero wash */}
      <div className="hb1" />

      {/* Back to home */}
      <div style={{ position: 'fixed', top: 24, left: 28, zIndex: 20 }}>
        <Link to="/" className="auth-link-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Zirva
        </Link>
      </div>

      {/* Card */}
      <div
        className="auth-card-anim liquid-card"
        style={{ width: '100%', maxWidth: 420, padding: '40px 36px', borderRadius: 16 }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 22 }}>
          <span className="font-display" style={{ fontWeight: 800, fontSize: 21, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>Zirva</span>
        </div>

        {/* Lock glyph + heading */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--brand-50)', color: 'var(--brand-500)',
          }}>
            <Lock style={{ width: 24, height: 24 }} />
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.4rem,3vw,1.65rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6, color: 'var(--ink-900)', lineHeight: 1.18 }}>
            {t('new_password_set')}
          </h1>
          <p style={{ color: 'var(--ink-600)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
            {t('new_password_subtitle')}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: '#FEE2E2', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10, padding: '12px 16px', color: '#B91C1C',
            fontSize: 13, marginBottom: 16, lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* New password */}
          <div>
            <label className="auth-field-label">{t('new_password')}</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Lock style={{ width: 15, height: 15 }} /></span>
              <input
                required
                type={showPwd ? 'text' : 'password'}
                className="rp-input"
                autoComplete="new-password"
                placeholder={t('new_password_placeholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" className="auth-input-toggle" onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                {showPwd ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: 7, display: 'flex', gap: 6, alignItems: 'center' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 4, borderRadius: 999,
                    background: i <= strength ? strengthColors[strength] : 'var(--hairline-strong)',
                    transition: 'background .25s ease',
                  }} />
                ))}
                <span style={{ fontSize: 11, fontWeight: 600, color: strengthColors[strength] || 'var(--ink-400)', whiteSpace: 'nowrap', minWidth: 32, textAlign: 'right' }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="auth-field-label">{t('confirm_password')}</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Lock style={{ width: 15, height: 15 }} /></span>
              <input
                required
                type={showConfirm ? 'text' : 'password'}
                className={`rp-input${matchError ? ' has-error' : ''}`}
                autoComplete="new-password"
                placeholder={t('confirm_password_placeholder')}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
              <button type="button" className="auth-input-toggle" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                {showConfirm ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            </div>
            {matchError && (
              <p style={{ marginTop: 5, fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>{matchError}</p>
            )}
            {confirm && !matchError && (
              <p style={{ marginTop: 5, fontSize: 12, color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 style={{ width: 12, height: 12 }} /> Şifrələr uyğundur
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-pastel"
            style={{ marginTop: 4, width: '100%', justifyContent: 'center', fontSize: 14.5, padding: '13px 24px' }}
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
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'spin .8s linear infinite', flexShrink: 0 }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

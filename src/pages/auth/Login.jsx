import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'

export default function Login() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [showReset, setShowReset]       = useState(false)
  const [resetEmail, setResetEmail]     = useState('')
  const [resetSent, setResetSent]       = useState(false)
  const [resetError, setResetError]     = useState(null)
  const [resetLoading, setResetLoading] = useState(false)
  // MFA challenge state — appears between password success and full login
  const [mfaFactor, setMfaFactor]       = useState(null)   // { id, friendly_name }
  const [mfaCode, setMfaCode]           = useState('')
  const [mfaLoading, setMfaLoading]     = useState(false)
  const [mfaError, setMfaError]         = useState('')
  // TEMPORARY visible diagnostic — shows the MFA decision on screen
  // so we can debug "MFA not prompting" without DevTools. Remove once fixed.
  const [mfaDebug, setMfaDebug]         = useState(null)
  const { signIn, user, profile, t, fetchProfile } = useAuth()
  const navigate                        = useNavigate()
  const [searchParams]                  = useSearchParams()
  const sessionExpired = searchParams.get('expired') === '1'
  const passwordReset  = searchParams.get('reset')   === '1'

  useEffect(() => {
    if (!user || !profile) return
    // CRITICAL: do not auto-redirect while:
    //   - an MFA challenge is being shown (mfaFactor truthy)
    //   - handleSubmit is still running (loading) — profile may have loaded
    //     before the AAL check finishes, racing the effect against the
    //     MFA UI and bouncing the user to a dashboard at AAL1.
    if (mfaFactor) return
    if (loading) return
    const d = { student:'/dashboard', teacher:'/muellim/dashboard', parent:'/valideyn/dashboard', admin:'/admin/dashboard', super_admin:'/superadmin/dashboard' }
    navigate(d[profile.role] || '/dashboard', { replace: true })
  }, [user, profile, navigate, mfaFactor, loading])

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await signIn(email, password)

      // Defensive MFA gate: don't trust getAuthenticatorAssuranceLevel alone
      // (it occasionally returns stale or unexpected payloads). The source
      // of truth is "does this user have a verified TOTP factor AND is the
      // current session below AAL2?" — if both, prompt the challenge.
      let factors = null, aal = null
      try {
        const r1 = await supabase.auth.mfa.listFactors()
        factors = r1.data
      } catch (e) { console.error('[mfa] listFactors failed:', e) }
      try {
        const r2 = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        aal = r2.data
      } catch (e) { console.error('[mfa] getAAL failed:', e) }

      const verifiedTotp = (factors?.totp || []).find(f => f.status === 'verified')
      const alreadyAal2  = aal?.currentLevel === 'aal2'
      const allTotp      = factors?.totp || []
      const allPhone     = factors?.phone || []

      const debug = {
        currentLevel: aal?.currentLevel ?? '(none)',
        nextLevel:    aal?.nextLevel ?? '(none)',
        totpCount:    allTotp.length,
        totpStatuses: allTotp.map(f => f.status).join(',') || '(none)',
        phoneCount:   allPhone.length,
        verifiedTotp: !!verifiedTotp,
        willPrompt:   !!(verifiedTotp && !alreadyAal2),
      }
      setMfaDebug(debug)
      console.log('[login] mfa state', debug)

      if (verifiedTotp && !alreadyAal2) {
        setMfaFactor(verifiedTotp)
        setLoading(false)
        return
      }
      // No MFA required — navigate explicitly. We don't rely on the
      // [user, profile] useEffect because it's gated on `loading` (to avoid
      // a different race where it fires mid-MFA-decision), so we have to
      // drive the redirect ourselves once we know MFA isn't in play.
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id
      let role = null
      if (uid) {
        try {
          const fresh = await fetchProfile?.(uid)
          role = fresh?.role || null
        } catch {}
      }
      setLoading(false)
      const dest = { student:'/dashboard', teacher:'/muellim/dashboard', parent:'/valideyn/dashboard', admin:'/admin/dashboard', super_admin:'/superadmin/dashboard' }
      navigate(dest[role] || '/dashboard', { replace: true })
    } catch (err) {
      if (err?.message?.includes('Invalid login'))            setError(t('invalid_login'))
      else if (err?.message?.includes('Email not confirmed')) setError(t('email_not_confirmed'))
      else setError(err?.message || t('error'))
      setLoading(false)
    }
  }

  async function handleMfa(e) {
    e.preventDefault()
    setMfaError(''); setMfaLoading(true)
    try {
      const code = mfaCode.trim()
      if (code.length !== 6) throw new Error('6 rəqəmli kod daxil edin')
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: mfaFactor.id })
      if (chErr) throw chErr
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId:    mfaFactor.id,
        challengeId: ch.id,
        code,
      })
      if (vErr) throw vErr

      // Get the freshly-verified session and resolve the role from a profile
      // we fetch right here. We don't trust the [user, profile] useEffect to
      // fire — TOKEN_REFRESHED can hand back the same user reference and React
      // will skip the effect, leaving us stuck on /daxil-ol.
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id || user?.id
      let role = profile?.role
      if (uid) {
        try {
          const fresh = await fetchProfile?.(uid)
          if (fresh?.role) role = fresh.role
        } catch {}
      }
      setMfaFactor(null); setMfaCode(''); setMfaLoading(false)
      const dest = { student:'/dashboard', teacher:'/muellim/dashboard', parent:'/valideyn/dashboard', admin:'/admin/dashboard', super_admin:'/superadmin/dashboard' }
      navigate(dest[role] || '/dashboard', { replace: true })
    } catch (err) {
      setMfaError(err.message?.replace('Invalid TOTP code entered', 'Yanlış kod, yenidən cəhd edin') || String(err))
      setMfaLoading(false)
    }
  }

  async function cancelMfa() {
    await supabase.auth.signOut()
    setMfaFactor(null); setMfaCode(''); setMfaError('')
  }

  async function handleReset() {
    if (!resetEmail) { setResetError(t('email')); return }
    setResetLoading(true); setResetError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/sifre-sifirla'
    })
    setResetLoading(false)
    if (err) { setResetError(err.message); return }
    setResetSent(true)
  }

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
        .auth-label { display:block; font-size:12px; font-weight:700; color:#64748b; letterSpacing:'0.04em'; text-transform: uppercase; margin-bottom: 7px; }
        .auth-link { color: #7c6ee0; text-decoration: none; font-weight: 600; transition: color .15s; }
        .auth-link:hover { color: #5b4fcf; }
        .auth-link-muted { color: #64748b; text-decoration: none; font-size: 13px; font-weight: 600; transition: color .15s; }
        .auth-link-muted:hover { color: #1a1a2e; }
        .btn-pastel-full { width: 100%; justify-content: center; padding: 14px 22px; font-size: 14.5px; }
        .btn-pastel-full:disabled { opacity: 0.7; cursor: not-allowed; }
        .pwd-toggle {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:#94a3b8; padding:0; display:flex;
          transition: color .15s;
        }
        .pwd-toggle:hover { color: #1a1a2e; }
      `}</style>

      {/* Drifting pastel blobs */}
      <div className="hb1" />
      <div className="hb2" />
      <div className="hb4" />
      <div className="hb6" />

      {/* Back link */}
      <div style={{ position: 'fixed', top: 24, left: 28, zIndex: 20 }}>
        <Link to="/" className="auth-link-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Zirva
        </Link>
      </div>

      {/* Card */}
      <div
        className="auth-card-anim liquid-card"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '40px 36px',
        }}
      >
        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 26 }}>
          <img src="/logo.png" alt="Zirva" style={{ height: 30 }} />
          <span style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e', letterSpacing: '-0.01em' }}>Zirva</span>
        </div>

        {mfaFactor ? (
          <>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center', color: '#1a1a2e', lineHeight: 1.15 }}>
              <span className="pastel-text">İki amilli identifikasiya</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 26, lineHeight: 1.55 }}>
              Authenticator tətbiqindəki 6 rəqəmli kodu daxil edin.
            </p>
            <form onSubmit={handleMfa} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                disabled={mfaLoading}
                autoFocus
                className="pastel-input"
                style={{ width: '100%', textAlign: 'center', fontSize: 26, letterSpacing: '0.45em', fontWeight: 700, padding: '14px 16px' }}
              />
              {mfaError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13.5 }}>
                  {mfaError}
                </div>
              )}
              <button type="submit" disabled={mfaLoading || mfaCode.length !== 6} className="btn-pastel btn-pastel-full" style={{ marginTop: 4 }}>
                {mfaLoading ? <><SpinIcon /> Yoxlanılır…</> : <>Təsdiqlə <ArrowRight style={{ width: 16, height: 16 }} /></>}
              </button>
              <button type="button" onClick={cancelMfa} disabled={mfaLoading}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginTop: 4 }}>
                <ArrowLeft style={{ width: 13, height: 13, display: 'inline', marginRight: 6, verticalAlign: '-2px' }}/>
                Geri qayıt
              </button>
            </form>
          </>
        ) : showReset ? (
          <>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center', color: '#1a1a2e', lineHeight: 1.15 }}>
              <span className="pastel-text">{t('reset_password')}</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 26, lineHeight: 1.55 }}>
              {t('forgot_subtitle')}
            </p>

            {resetSent ? (
              <div style={{ background: 'rgba(93,184,163,0.15)', borderRadius: 12, padding: '12px 16px', color: '#15803d', fontSize: 13.5, textAlign: 'center', marginBottom: 22 }}>
                {t('reset_link_sent')}
              </div>
            ) : (
              <>
                {resetError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
                    {resetError}
                  </div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <label className="auth-label">{t('email')}</label>
                  <input
                    type="email"
                    className="auth-input"
                    autoComplete="email"
                    placeholder="ad@mekteb.az"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleReset}
                  disabled={resetLoading}
                  className="btn-pastel btn-pastel-full"
                >
                  {resetLoading ? <><SpinIcon /> {t('sending')}</> : t('send_link')}
                </button>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                type="button"
                onClick={() => { setShowReset(false); setResetSent(false); setResetError(null); setResetEmail('') }}
                className="auth-link"
                style={{ fontSize: 13.5, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ← {t('back_to_login')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center', color: '#1a1a2e', lineHeight: 1.15 }}>
              <span className="pastel-text">{t('login_welcome')}</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 26 }}>
              {t('login_subtitle')}
            </p>

            {passwordReset && (
              <div style={{ background: 'rgba(93,184,163,0.15)', borderRadius: 12, padding: '12px 16px', color: '#15803d', fontSize: 13, marginBottom: 16 }}>
                {t('password_updated')}
              </div>
            )}
            {sessionExpired && (
              <div style={{ background: 'rgba(232,168,124,0.18)', borderRadius: 12, padding: '12px 16px', color: '#92400e', fontSize: 13, marginBottom: 16 }}>
                {t('session_expired')}
              </div>
            )}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* TEMPORARY MFA debug banner — visible diagnostic. Remove once login is fixed. */}
            {mfaDebug && (
              <div style={{
                background: mfaDebug.willPrompt ? 'rgba(93,184,163,0.15)' : 'rgba(251,191,36,0.18)',
                border: `1px solid ${mfaDebug.willPrompt ? 'rgba(93,184,163,0.4)' : 'rgba(251,191,36,0.5)'}`,
                borderRadius: 12, padding: '12px 14px', marginBottom: 16,
                fontSize: 12, fontFamily: 'monospace', color: '#1a1a2e', lineHeight: 1.55,
              }}>
                <div style={{ fontWeight:700, marginBottom:4 }}>
                  [MFA DEBUG] willPrompt = {String(mfaDebug.willPrompt)}
                </div>
                <div>currentLevel: {mfaDebug.currentLevel}</div>
                <div>nextLevel:    {mfaDebug.nextLevel}</div>
                <div>totpCount:    {mfaDebug.totpCount}</div>
                <div>totpStatuses: {mfaDebug.totpStatuses}</div>
                <div>phoneCount:   {mfaDebug.phoneCount}</div>
                <div>verifiedTotp: {String(mfaDebug.verifiedTotp)}</div>
              </div>
            )}

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
              <div>
                <label className="auth-label">{t('password')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="pwd-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -2 }}>
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="auth-link"
                  style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {t('forgot_password')}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-pastel btn-pastel-full"
                style={{ marginTop: 4 }}
              >
                {loading ? <><SpinIcon /> {t('loading')}</> : <>{t('login')} <ArrowRight style={{ width: 16, height: 16 }} /></>}
              </button>
            </form>

          </>
        )}
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

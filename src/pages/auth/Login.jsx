import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'

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
    <div className="auth-shell">
      <AuthStyles />

      {/* ── Left brand panel (hidden on small screens) — wordmark + abstract pattern, no mascot ── */}
      <AuthBrandPanel title={t('login_welcome')} copy={t('login_subtitle')} />

      {/* ── Right form panel ── */}
      <main className="auth-pane">
        <div className="auth-mobile-back">
          <Link to="/" className="auth-link-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Zirva
          </Link>
        </div>

        <div className="auth-card-anim auth-card">
          {/* Logo + brand */}
          <div className="auth-logo">
            <span className="auth-wordmark">Zirva</span>
          </div>

          {mfaFactor ? (
            <>
              <div className="auth-glyph">
                <ShieldCheck style={{ width: 26, height: 26 }} />
              </div>
              <h1 className="auth-title">İki amilli identifikasiya</h1>
              <p className="auth-sub">Authenticator tətbiqindəki 6 rəqəmli kodu daxil edin.</p>
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
                  aria-label="6 rəqəmli kod"
                  className="auth-input auth-otp"
                />
                {mfaError && <div className="auth-alert auth-alert-danger">{mfaError}</div>}
                <button type="submit" disabled={mfaLoading || mfaCode.length !== 6} className="btn-pastel auth-btn-block" style={{ marginTop: 4 }}>
                  {mfaLoading ? <><SpinIcon /> Yoxlanılır…</> : <>Təsdiqlə <ArrowRight style={{ width: 16, height: 16 }} /></>}
                </button>
                <button type="button" onClick={cancelMfa} disabled={mfaLoading} className="auth-link-muted auth-back-btn">
                  <ArrowLeft style={{ width: 13, height: 13, display: 'inline', marginRight: 6, verticalAlign: '-2px' }}/>
                  Geri qayıt
                </button>
              </form>
            </>
          ) : showReset ? (
            <>
              <h1 className="auth-title">{t('reset_password')}</h1>
              <p className="auth-sub">{t('forgot_subtitle')}</p>

              {resetSent ? (
                <div className="auth-alert auth-alert-success" style={{ textAlign: 'center' }}>
                  {t('reset_link_sent')}
                </div>
              ) : (
                <>
                  {resetError && <div className="auth-alert auth-alert-danger">{resetError}</div>}
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
                    className="btn-pastel auth-btn-block"
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
              <h1 className="auth-title">{t('login_welcome')}</h1>
              <p className="auth-sub">{t('login_subtitle')}</p>

              {passwordReset && <div className="auth-alert auth-alert-success">{t('password_updated')}</div>}
              {sessionExpired && <div className="auth-alert auth-alert-warning">{t('session_expired')}</div>}
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
                  className="btn-pastel auth-btn-block"
                  style={{ marginTop: 4 }}
                >
                  {loading ? <><SpinIcon /> {t('loading')}</> : <>{t('login')} <ArrowRight style={{ width: 16, height: 16 }} /></>}
                </button>
              </form>
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

/**
 * Shared brand panel — wordmark + calm deep-brand gradient + a quiet abstract
 * pattern. No mascot (per V3 §3.2/§5.3). Reused across every auth page.
 */
export function AuthBrandPanel({ title, copy }) {
  return (
    <aside className="auth-brand">
      <AuthBrandPattern />
      <Link to="/" className="auth-brand-back">
        <ArrowLeft style={{ width: 15, height: 15 }} /> Zirva
      </Link>
      <div className="auth-brand-inner">
        <span className="auth-brand-mark font-display">Zirva</span>
        <h2 className="auth-brand-title font-display">{title}</h2>
        <p className="auth-brand-copy">{copy}</p>
      </div>
    </aside>
  )
}

/** Refined, static abstract pattern — concentric arcs + a faint dot grid. */
function AuthBrandPattern() {
  return (
    <svg className="auth-brand-pattern" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="abp-glow" cx="78%" cy="18%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id="abp-dots" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#fff" fillOpacity="0.10" />
        </pattern>
      </defs>
      <rect width="600" height="800" fill="url(#abp-dots)" />
      <rect width="600" height="800" fill="url(#abp-glow)" />
      <g fill="none" stroke="#fff" strokeOpacity="0.12">
        <circle cx="500" cy="120" r="120" />
        <circle cx="500" cy="120" r="190" strokeOpacity="0.07" />
        <circle cx="500" cy="120" r="270" strokeOpacity="0.05" />
      </g>
      <g fill="none" stroke="#fff" strokeOpacity="0.08">
        <circle cx="70" cy="690" r="150" />
        <circle cx="70" cy="690" r="230" strokeOpacity="0.05" />
      </g>
    </svg>
  )
}

/** Shared auth styles — token-driven (no hardcoded legacy hex, no Baloo). */
export function AuthStyles() {
  return (
    <style>{`
      .auth-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1.05fr 1fr;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        background: var(--canvas);
      }
      @media (max-width: 900px) { .auth-shell { grid-template-columns: 1fr; } }
      @keyframes authFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes spin { to{transform:rotate(360deg)} }

      /* ── Brand panel: calm deep-brand gradient + static abstract pattern ── */
      .auth-brand {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px;
        background: linear-gradient(165deg, var(--brand-600) 0%, var(--brand-500) 46%, var(--brand-700) 100%);
      }
      @media (max-width: 900px) { .auth-brand { display: none; } }
      .auth-brand-pattern {
        position: absolute; inset: 0; width: 100%; height: 100%;
        pointer-events: none; z-index: 1;
      }
      .auth-brand-back {
        position: absolute; top: 28px; left: 32px; z-index: 5;
        display: flex; align-items: center; gap: 6px;
        color: rgba(255,255,255,0.82); text-decoration: none;
        font-size: 14px; font-weight: 600;
        transition: color .15s;
      }
      .auth-brand-back:hover { color: #fff; }
      .auth-brand-inner {
        position: relative; z-index: 2;
        max-width: 380px; text-align: center; color: #fff;
        display: flex; flex-direction: column; align-items: center;
        animation: authFadeUp .6s cubic-bezier(.22,1,.36,1) both;
      }
      .auth-brand-mark {
        font-family: 'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif;
        font-weight: 800; font-size: 34px; letter-spacing: -0.02em;
        color: #fff; line-height: 1; margin-bottom: 28px;
      }
      .auth-brand-title {
        font-family: 'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif;
        font-weight: 700; font-size: 30px; line-height: 1.18;
        margin: 0 0 12px; letter-spacing: -0.02em; color: #fff;
      }
      .auth-brand-copy {
        font-size: 15.5px; line-height: 1.6; color: rgba(255,255,255,0.82);
        max-width: 320px; font-weight: 400;
      }

      /* ── Form pane ── */
      .auth-pane {
        position: relative;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 40px 24px;
      }
      .auth-mobile-back { position: absolute; top: 20px; left: 22px; z-index: 5; display: none; }
      @media (max-width: 900px) { .auth-mobile-back { display: block; } }

      .auth-card-anim { animation: authFadeUp .55s cubic-bezier(.22,1,.36,1) both; }
      .auth-card {
        width: 100%; max-width: 420px;
        background: var(--surface);
        border: 1px solid var(--hairline);
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(20,22,40,.05), 0 12px 28px -10px rgba(20,22,40,.12);
        padding: 40px 36px;
      }
      .auth-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 24px; }
      .auth-wordmark { font-family: 'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif; font-weight: 800; font-size: 21px; color: var(--ink-900); letter-spacing: -0.02em; }

      .auth-glyph {
        width: 52px; height: 52px; border-radius: 14px; margin: 0 auto 16px;
        display: flex; align-items: center; justify-content: center;
        background: var(--brand-50);
        color: var(--brand-500);
      }
      .auth-title {
        font-family: 'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif;
        font-weight: 700; font-size: 25px; line-height: 1.18;
        letter-spacing: -0.02em; text-align: center; color: var(--ink-900);
        margin-bottom: 8px;
      }
      .auth-sub { color: var(--ink-600); font-size: 14px; text-align: center; margin-bottom: 24px; line-height: 1.55; }

      .auth-input {
        width: 100%;
        padding: 11px 15px;
        border-radius: 10px;
        background: var(--surface);
        border: 1px solid var(--hairline-strong);
        color: var(--ink-900);
        font-size: 14px;
        font-weight: 500;
        outline: none;
        transition: border-color .15s var(--ease-out-quint), box-shadow .15s ease;
        font-family: inherit;
        box-sizing: border-box;
      }
      .auth-input:focus { border-color: var(--brand-500); box-shadow: 0 0 0 3px rgba(87,79,207,0.15); }
      .auth-input::placeholder { color: var(--ink-400); }
      .auth-input.error { border-color: var(--danger); box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
      .auth-otp { text-align: center; font-size: 26px; letter-spacing: 0.45em; font-weight: 700; padding: 14px 16px; font-variant-numeric: tabular-nums; }

      .auth-label { display:block; font-size:13px; font-weight:600; color:var(--ink-700); margin-bottom: 7px; }

      .auth-link { color: var(--brand-500); text-decoration: none; font-weight: 600; transition: color .15s; }
      .auth-link:hover { color: var(--brand-700); }
      .auth-link-muted { color: var(--ink-600); text-decoration: none; font-size: 13px; font-weight: 600; transition: color .15s; }
      .auth-link-muted:hover { color: var(--ink-900); }
      .auth-back-btn { background: transparent; border: none; cursor: pointer; padding: 8px 0; margin-top: 4px; font-family: inherit; }

      .auth-btn-block { width: 100%; justify-content: center; padding-top: 13px; padding-bottom: 13px; }
      .btn-pastel:disabled { opacity: 0.55; cursor: not-allowed; pointer-events: none; }

      .auth-alert { border-radius: 10px; padding: 12px 16px; font-size: 13px; margin-bottom: 16px; line-height: 1.5; }
      .auth-alert-danger  { background: #FEE2E2; color: #B91C1C; }
      .auth-alert-success { background: #DCFCE7; color: #15803D; }
      .auth-alert-warning { background: #FEF3C7; color: #B45309; }

      .auth-select {
        width: 100%;
        padding: 11px 40px 11px 15px;
        border-radius: 10px;
        background: var(--surface);
        border: 1px solid var(--hairline-strong);
        color: var(--ink-900);
        font-size: 14px;
        font-weight: 500;
        outline: none;
        appearance: none;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color .15s var(--ease-out-quint), box-shadow .15s ease;
        cursor: pointer;
      }
      .auth-select:focus { border-color: var(--brand-500); box-shadow: 0 0 0 3px rgba(87,79,207,0.15); }

      .field-error { margin-top: 6px; font-size: 12px; color: #B91C1C; }

      .pwd-toggle {
        position:absolute; right:14px; top:50%; transform:translateY(-50%);
        background:none; border:none; cursor:pointer; color:var(--ink-400); padding:0; display:flex;
        transition: color .15s;
      }
      .pwd-toggle:hover { color: var(--ink-900); }

      @media (prefers-reduced-motion: reduce) {
        .auth-card-anim, .auth-brand-inner { animation: none; }
      }
    `}</style>
  )
}

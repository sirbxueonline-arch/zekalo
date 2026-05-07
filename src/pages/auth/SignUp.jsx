import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { School, User, Check, ArrowLeft, ArrowRight } from 'lucide-react'

export default function SignUp() {
  const navigate = useNavigate()
  const { t } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [schoolName, setSchoolName] = useState('')
  const [district, setDistrict] = useState('')
  const [edition, setEdition] = useState('government')
  const [language, setLanguage] = useState('az')

  const STEPS = [
    { label: t('step_account'), icon: User },
    { label: t('school'), icon: School },
    { label: t('step_confirm'), icon: Check },
  ]

  function canAdvance() {
    if (step === 0) {
      return (
        fullName.trim().length > 0 &&
        email.trim().length > 0 &&
        password.length >= 6 &&
        password === confirmPassword
      )
    }
    if (step === 1) return schoolName.trim().length > 0
    return true
  }

  async function handleFinish() {
    setError('')
    setLoading(true)
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (authErr) throw authErr
      if (!authData.user) throw new Error(t('error'))

      if (!authData.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (signInErr) throw new Error(
          'Supabase-da e-poçt təsdiqi aktifdir. Dashboard → Authentication → Settings → "Enable email confirmations" söndürün.'
        )
      }

      const { data: schoolData, error: schoolErr } = await supabase
        .from('schools')
        .insert({
          name: schoolName.trim(),
          district: district.trim() || null,
          edition,
          default_language: language,
        })
        .select()
        .single()
      if (schoolErr) throw schoolErr

      const { error: profileErr } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: fullName.trim(),
        email: email.trim(),
        role: 'admin',
        school_id: schoolData.id,
        edition,
        language,
      })
      if (profileErr) throw profileErr

      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const passwordMismatch = confirmPassword && password !== confirmPassword

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
        .auth-select {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(124,110,224,0.25);
          color: #1a1a2e;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          appearance: none;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
          cursor: pointer;
        }
        .auth-select:focus {
          border-color: rgba(124,110,224,0.5);
          box-shadow: 0 0 0 4px rgba(124,110,224,0.12);
          background: rgba(255,255,255,0.78);
        }
        .auth-label { display:block; font-size:12px; font-weight:700; color:#64748b; letterSpacing:'0.04em'; text-transform: uppercase; margin-bottom: 7px; }
        .auth-link { color: #7c6ee0; text-decoration: none; font-weight: 600; transition: color .15s; }
        .auth-link:hover { color: #5b4fcf; }
        .auth-link-muted { color: #64748b; text-decoration: none; font-size: 13px; font-weight: 600; transition: color .15s; }
        .auth-link-muted:hover { color: #1a1a2e; }
        .btn-pastel-cta { justify-content: center; padding: 12px 24px; font-size: 14px; }
        .btn-pastel-cta:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-ghost-cta { justify-content: center; padding: 12px 24px; font-size: 14px; }
        .field-error { margin-top: 6px; font-size: 12px; color: #dc2626; }
        .step-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 999px;
          font-size: 12px; font-weight: 600;
          transition: all .2s ease;
        }
        .step-pill.active {
          background: linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(124,110,224,0.3);
        }
        .step-pill.done {
          background: rgba(93,184,163,0.18);
          color: #15803d;
        }
        .step-pill.todo {
          background: rgba(255,255,255,0.55);
          color: #94a3b8;
          border: 1px solid rgba(124,110,224,0.18);
        }
        .step-divider { width: 18px; height: 1px; }
        .review-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13.5px;
        }
        .review-divider {
          height: 1px;
          background: rgba(124,110,224,0.15);
          margin: 4px 0;
        }
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
        style={{ width: '100%', maxWidth: 480, padding: '40px 36px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 22 }}>
          <img src="/logo.png" alt="Zirva" style={{ height: 30 }} />
          <span style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e', letterSpacing: '-0.01em' }}>Zirva</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center', color: '#1a1a2e', lineHeight: 1.15 }}>
          <span className="pastel-text">{t('register_school_title')}</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 22 }}>
          {t('create_admin_subtitle')}
        </p>

        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => {
            const state = i === step ? 'active' : i < step ? 'done' : 'todo'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className={`step-pill ${state}`}>
                  {i < step ? <Check style={{ width: 12, height: 12 }} /> : <s.icon style={{ width: 12, height: 12 }} />}
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="step-divider" style={{ background: i < step ? '#5db8a3' : 'rgba(124,110,224,0.25)' }} />
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Step 0 */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
              {t('admin_details')}
            </p>
            <div>
              <label className="auth-label">{t('name_surname')}</label>
              <input
                className="auth-input"
                autoComplete="name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={t('name_surname')}
              />
            </div>
            <div>
              <label className="auth-label">{t('email')}</label>
              <input
                className="auth-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@mekteb.az"
              />
            </div>
            <div>
              <label className="auth-label">{t('password')}</label>
              <input
                className="auth-input"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('min_password')}
              />
            </div>
            <div>
              <label className="auth-label">{t('confirm_password')}</label>
              <input
                className={`auth-input ${passwordMismatch ? 'error' : ''}`}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t('confirm_password_placeholder')}
              />
              {passwordMismatch && <p className="field-error">{t('passwords_dont_match')}</p>}
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
              {t('school_details')}
            </p>
            <div>
              <label className="auth-label">{t('school_name')}</label>
              <input
                className="auth-input"
                autoComplete="organization"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                placeholder={t('school_name_placeholder')}
              />
            </div>
            <div>
              <label className="auth-label">{t('district_city')}</label>
              <input
                className="auth-input"
                autoComplete="address-level2"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                placeholder={t('district_placeholder')}
              />
            </div>
            <div>
              <label className="auth-label">{t('type')}</label>
              <div style={{ position: 'relative' }}>
                <select className="auth-select" value={edition} onChange={e => setEdition(e.target.value)}>
                  <option value="government">{t('government_school')}</option>
                  <option value="ib">{t('ib_school')}</option>
                </select>
                <ChevronDown />
              </div>
            </div>
            <div>
              <label className="auth-label">{t('interface_language')}</label>
              <div style={{ position: 'relative' }}>
                <select className="auth-select" value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="az">Azərbaycanca</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>
                <ChevronDown />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
              {t('review')}
            </p>
            <div
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(124,110,224,0.18)',
                borderRadius: 14,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div className="review-row">
                <span style={{ color: '#64748b' }}>{t('full_name')}</span>
                <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{fullName}</span>
              </div>
              <div className="review-row">
                <span style={{ color: '#64748b' }}>{t('email')}</span>
                <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{email}</span>
              </div>
              <div className="review-divider" />
              <div className="review-row">
                <span style={{ color: '#64748b' }}>{t('school')}</span>
                <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{schoolName}</span>
              </div>
              {district && (
                <div className="review-row">
                  <span style={{ color: '#64748b' }}>{t('district')}</span>
                  <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{district}</span>
                </div>
              )}
              <div className="review-row">
                <span style={{ color: '#64748b' }}>{t('type')}</span>
                <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{edition === 'ib' ? t('ib_school') : t('government_school')}</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
              {t('teachers_via_admin')}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 24 }}>
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="btn-ghost-pastel btn-ghost-cta"
            >
              <ArrowLeft style={{ width: 15, height: 15 }} /> {t('back')}
            </button>
          ) : (
            <div />
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="btn-pastel btn-pastel-cta"
              style={{ marginLeft: 'auto' }}
            >
              {t('continue')} <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="btn-pastel btn-pastel-cta"
              style={{ marginLeft: 'auto' }}
            >
              {loading ? <><SpinIcon /> {t('loading') || '...'}</> : <>{t('confirm_school')} <Check style={{ width: 15, height: 15 }} /></>}
            </button>
          )}
        </div>

        <p style={{ color: '#64748b', fontSize: 13.5, textAlign: 'center', marginTop: 22 }}>
          {t('have_account')}{' '}
          <Link to="/daxil-ol" className="auth-link">{t('login')}</Link>
        </p>
      </div>
    </div>
  )
}

function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

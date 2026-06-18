import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { School, User, Check, ArrowLeft, ArrowRight } from 'lucide-react'
import { AuthStyles, AuthBrandPanel } from './Login'

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
    <div className="auth-shell">
      <AuthStyles />
      <SignUpStyles />

      {/* ── Left brand panel — wordmark + abstract pattern, no mascot ── */}
      <AuthBrandPanel title={t('register_school_title')} copy={t('create_admin_subtitle')} />

      {/* ── Right form panel ── */}
      <main className="auth-pane">
        <div className="auth-mobile-back">
          <Link to="/" className="auth-link-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Zirva
          </Link>
        </div>

        <div className="auth-card-anim auth-card" style={{ maxWidth: 480 }}>
          <div className="auth-logo">
            <span className="auth-wordmark">Zirva</span>
          </div>

          <h1 className="auth-title">{t('register_school_title')}</h1>
          <p className="auth-sub">{t('create_admin_subtitle')}</p>

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
                    <div className="step-divider" style={{ background: i < step ? 'var(--mint)' : 'var(--hairline-strong)' }} />
                  )}
                </div>
              )
            })}
          </div>

          {error && <div className="auth-alert auth-alert-danger">{error}</div>}

          {/* Step 0 */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p className="step-section-label">{t('admin_details')}</p>
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
              <p className="step-section-label">{t('school_details')}</p>
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
              <p className="step-section-label">{t('review')}</p>
              <div className="review-card">
                <div className="review-row">
                  <span className="review-key">{t('full_name')}</span>
                  <span className="review-val">{fullName}</span>
                </div>
                <div className="review-row">
                  <span className="review-key">{t('email')}</span>
                  <span className="review-val">{email}</span>
                </div>
                <div className="review-divider" />
                <div className="review-row">
                  <span className="review-key">{t('school')}</span>
                  <span className="review-val">{schoolName}</span>
                </div>
                {district && (
                  <div className="review-row">
                    <span className="review-key">{t('district')}</span>
                    <span className="review-val">{district}</span>
                  </div>
                )}
                <div className="review-row">
                  <span className="review-key">{t('type')}</span>
                  <span className="review-val">{edition === 'ib' ? t('ib_school') : t('government_school')}</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-400)', textAlign: 'center', lineHeight: 1.5 }}>
                {t('teachers_via_admin')}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 24 }}>
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="btn-ghost-pastel btn-step"
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
                className="btn-pastel btn-step"
                style={{ marginLeft: 'auto' }}
              >
                {t('continue')} <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="btn-pastel btn-step"
                style={{ marginLeft: 'auto' }}
              >
                {loading ? <><SpinIcon /> {t('loading') || '...'}</> : <>{t('confirm_school')} <Check style={{ width: 15, height: 15 }} /></>}
              </button>
            )}
          </div>

          <p style={{ color: 'var(--ink-600)', fontSize: 13.5, textAlign: 'center', marginTop: 22 }}>
            {t('have_account')}{' '}
            <Link to="/daxil-ol" className="auth-link">{t('login')}</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

/** SignUp-specific styles — step pills, review card, step buttons. */
function SignUpStyles() {
  return (
    <style>{`
      .step-pill {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 12px; border-radius: 999px;
        font-size: 12px; font-weight: 600;
        transition: all .2s ease;
      }
      .step-pill.active {
        background: var(--brand-500);
        color: #fff;
        box-shadow: 0 1px 2px rgba(20,22,40,.10);
      }
      .step-pill.done { background: #DCFCE7; color: #15803D; }
      .step-pill.todo { background: var(--surface-2); color: var(--ink-400); border: 1px solid var(--hairline-strong); }
      .step-divider { width: 18px; height: 1px; }

      .step-section-label {
        font-size: 11.5px; font-weight: 600; color: var(--ink-400);
        letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 2px;
      }

      .review-card {
        background: var(--surface-2);
        border: 1px solid var(--hairline);
        border-radius: 12px;
        padding: 16px 18px;
        display: flex; flex-direction: column; gap: 10px;
      }
      .review-row { display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; gap: 12px; }
      .review-key { color: var(--ink-600); }
      .review-val { font-weight: 600; color: var(--ink-900); text-align: right; }
      .review-divider { height: 1px; background: var(--hairline); margin: 4px 0; }

      .btn-step { padding: 12px 24px; font-size: 14px; }
      .btn-ghost-pastel.btn-step { padding: 12px 22px; }
    `}</style>
  )
}

function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-400)' }}
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

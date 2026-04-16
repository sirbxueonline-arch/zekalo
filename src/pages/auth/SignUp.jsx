import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import { School, User, Check } from 'lucide-react'

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
      // Use the register-school Edge Function which runs with service-role key,
      // bypassing RLS for the bootstrap case (no profile exists yet).
      const { data, error: fnErr } = await supabase.functions.invoke('register-school', {
        body: {
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          school_name: schoolName.trim(),
          district: district.trim() || null,
          edition,
          language,
        },
      })
      if (fnErr) throw fnErr
      if (data?.error) throw new Error(data.error)

      // The function returns a session — set it on the client so the user is
      // immediately logged in without a separate sign-in call.
      if (data?.session) {
        await supabase.auth.setSession(data.session)
      }

      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[440px] xl:w-[480px] bg-[#534AB7] flex-col justify-between p-12 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Zirva" width="28" height="28" className="object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          <span className="font-serif text-2xl text-white tracking-tight">Zirva</span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium tracking-widest text-purple-200 uppercase mb-3">{t('login_panel_title')}</p>
            <h2 className="font-serif text-3xl xl:text-4xl text-white leading-tight">
              {t('signup_panel_headline')}
            </h2>
          </div>
          <p className="text-purple-200 text-sm leading-relaxed">
            {t('signup_panel_body')}
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 space-y-3">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 transition-opacity ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${i < step ? 'bg-teal' : i === step ? 'bg-white' : 'bg-white/20'}`}>
                {i < step
                  ? <Check className="w-3.5 h-3.5 text-white" />
                  : <s.icon className={`w-3.5 h-3.5 ${i === step ? 'text-purple' : 'text-white'}`} />
                }
              </div>
              <span className="text-white text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-10">
            <img src="/logo.png" alt="Zirva" width="28" height="28" className="object-contain" />
            <span className="font-serif text-2xl text-gray-900">Zirva</span>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-3xl text-gray-900 mb-2">{t('register_school_title')}</h1>
            <p className="text-sm text-gray-500">{t('create_admin_subtitle')}</p>
          </div>

          {/* Mobile step indicators */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === step ? 'bg-purple text-white' : i < step ? 'bg-teal text-white' : 'bg-white text-gray-400 border border-border-soft'
                }`}>
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </div>
                {i < STEPS.length - 1 && <div className={`w-6 h-px ${i < step ? 'bg-teal' : 'bg-border-soft'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 0 */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('admin_details')}</p>
              <Input label={t('name_surname')} value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t('name_surname')} />
              <Input label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@mekteb.az" />
              <Input label={t('password')} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('min_password')} />
              <Input
                label={t('confirm_password')}
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t('confirm_password_placeholder')}
                error={confirmPassword && password !== confirmPassword ? t('passwords_dont_match') : ''}
              />
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('school_details')}</p>
              <Input label={t('school_name')} value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder={t('school_name_placeholder')} />
              <Input label={t('district_city')} value={district} onChange={e => setDistrict(e.target.value)} placeholder={t('district_placeholder')} />
              <Select label={t('type')} value={edition} onChange={e => setEdition(e.target.value)}>
                <option value="government">{t('government_school')}</option>
                <option value="ib">{t('ib_school')}</option>
              </Select>
              <Select label={t('interface_language')} value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="az">Azərbaycanca</option>
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </Select>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('review')}</p>
              <div className="bg-white border border-border-soft rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('full_name')}</span>
                  <span className="font-medium text-gray-900">{fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('email')}</span>
                  <span className="font-medium text-gray-900">{email}</span>
                </div>
                <div className="h-px bg-border-soft" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('school')}</span>
                  <span className="font-medium text-gray-900">{schoolName}</span>
                </div>
                {district && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('district')}</span>
                    <span className="font-medium text-gray-900">{district}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('type')}</span>
                  <span className="font-medium text-gray-900">{edition === 'ib' ? t('ib_school') : t('government_school')}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                {t('teachers_via_admin')}
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 0
              ? <Button variant="ghost" onClick={() => setStep(s => s - 1)}>{t('back')}</Button>
              : <div />
            }
            {step < 2
              ? <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}>{t('continue')}</Button>
              : <Button onClick={handleFinish} loading={loading}>{t('confirm_school')}</Button>
            }
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            {t('have_account')}{' '}
            <Link to="/daxil-ol" className="text-purple hover:text-purple-dark font-medium">{t('login')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}



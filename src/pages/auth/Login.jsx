import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Eye, EyeOff, Sparkles, BookOpen, Users, BarChart2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState(null)
  const [resetLoading, setResetLoading] = useState(false)
  const { signIn, user, profile, t } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('expired') === '1'
  const passwordReset = searchParams.get('reset') === '1'

  const features = [
    { icon: BookOpen, text: t('feat_digital_journal') },
    { icon: Users,    text: t('feat_role_panels') },
    { icon: Sparkles, text: t('feat_zeka_assistant') },
    { icon: BarChart2,text: t('feat_school_analytics') },
  ]

  useEffect(() => {
    if (user && profile) {
      const dashboards = { student: '/dashboard', teacher: '/muellim/dashboard', parent: '/valideyn/dashboard', admin: '/admin/dashboard', super_admin: '/superadmin/dashboard' }
      navigate(dashboards[profile.role] || '/dashboard', { replace: true })
    }
  }, [user, profile, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      if (err?.message?.includes('Invalid login')) {
        setError(t('invalid_login'))
      } else if (err?.message?.includes('Email not confirmed')) {
        setError(t('email_not_confirmed'))
      } else {
        setError(err?.message || t('error'))
      }
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!resetEmail) { setResetError('E-poçt daxil edin'); return }
    setResetLoading(true)
    setResetError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/sifre-sifirla'
    })
    setResetLoading(false)
    if (err) { setResetError(err.message); return }
    setResetSent(true)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[440px] xl:w-[480px] bg-[#534AB7] flex-col justify-between p-12 shrink-0">
        <div className="flex items-center gap-3">
          <ZirvaIcon />
          <span className="font-serif text-2xl text-white tracking-tight">Zirva</span>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-medium tracking-widest text-purple-200 uppercase">{t('login_panel_title')}</p>
          <h2 className="font-serif text-3xl xl:text-4xl text-white leading-tight">
            {t('login_panel_headline')}
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed">{t('login_panel_body')}</p>
        </div>

        <div className="space-y-4">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/80 text-sm">{text}</span>
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

          {showReset ? (
            /* Inline password reset panel */
            <div>
              <div className="mb-8">
                <h1 className="font-serif text-3xl text-gray-900 mb-2">Şifrəni sıfırla</h1>
                <p className="text-sm text-gray-500">E-poçtunuza sıfırlama linki göndərəcəyik.</p>
              </div>

              {resetSent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-4 text-sm text-green-700 mb-6">
                  Sıfırlama linki e-poçtunuza göndərildi.
                </div>
              ) : (
                <>
                  {resetError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">
                      {resetError}
                    </div>
                  )}
                  <div className="space-y-4">
                    <Input
                      label="E-poçt"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="ad@mekteb.az"
                    />
                    <Button onClick={handleReset} loading={resetLoading} className="w-full">
                      Sıfırlama linki göndər
                    </Button>
                  </div>
                </>
              )}

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => { setShowReset(false); setResetSent(false); setResetError(null); setResetEmail('') }}
                  className="text-sm text-purple hover:text-purple-dark font-medium transition-colors"
                >
                  Geri qayıt
                </button>
              </div>
            </div>
          ) : (
            /* Login form */
            <>
              <div className="mb-8">
                <h1 className="font-serif text-3xl text-gray-900 mb-2">{t('welcome')}</h1>
                <p className="text-sm text-gray-500">{t('login_subtitle')}</p>
              </div>

              {passwordReset && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 text-sm text-green-700">
                  Şifrəniz uğurla yeniləndi. İndi daxil ola bilərsiniz.
                </div>
              )}

              {sessionExpired && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
                  Sessiyanız başa çatdı. Zəhmət olmasa yenidən daxil olun.
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t('email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ad@mekteb.az"
                  required
                />
                <div className="relative">
                  <Input
                    label={t('password')}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="text-xs text-purple hover:text-purple-dark transition-colors"
                  >
                    Şifrəni unutmusunuz?
                  </button>
                </div>

                <Button type="submit" loading={loading} className="w-full">
                  {t('login')}
                </Button>
              </form>

              <p className="text-sm text-gray-500 text-center mt-6">
                {t('no_account')}{' '}
                <Link to="/qeydiyyat" className="text-purple hover:text-purple-dark font-medium transition-colors">
                  {t('signup')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ZirvaIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 3L26 23H2L14 3Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 3L20 15H8L14 3Z" fill="white"/>
    </svg>
  )
}

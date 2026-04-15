import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import { School, User, Check } from 'lucide-react'

const STEPS = [
  { label: 'Hesab', icon: User },
  { label: 'Məktəb', icon: School },
  { label: 'Təsdiq', icon: Check },
]

export default function SignUp() {
  const navigate = useNavigate()
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
      if (!authData.user) throw new Error('İstifadəçi yaradılmadı')

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
      setError(err.message || 'Xəta baş verdi. Yenidən cəhd edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[440px] xl:w-[480px] bg-[#534AB7] flex-col justify-between p-12 shrink-0">
        <div className="flex items-center gap-3">
          <ZirvaIcon />
          <span className="font-serif text-2xl text-white tracking-tight">Zirva</span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium tracking-widest text-purple-200 uppercase mb-3">Məktəb İdarəetmə Sistemi</p>
            <h2 className="font-serif text-3xl xl:text-4xl text-white leading-tight">
              Məktəbinizi platforma ilə tanışdırın
            </h2>
          </div>
          <p className="text-purple-200 text-sm leading-relaxed">
            Qeydiyyatdan keçin, məktəbinizi əlavə edin və müəllim, şagird və valideynləri dəvət edin — hamısı bir neçə dəqiqə ərzində.
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
            <ZirvaIconDark />
            <span className="font-serif text-2xl text-gray-900">Zirva</span>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-3xl text-gray-900 mb-2">Məktəbi qeydiyyatdan keçir</h1>
            <p className="text-sm text-gray-500">Admin hesabı yaradın</p>
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
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-4">Admin məlumatları</p>
              <Input label="Ad və soyad" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Adınız Soyadınız" />
              <Input label="E-poçt" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@mekteb.az" />
              <Input label="Şifrə" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 simvol" />
              <Input
                label="Şifrəni təsdiqləyin"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Şifrəni yenidən daxil edin"
                error={confirmPassword && password !== confirmPassword ? 'Şifrələr uyğun gəlmir' : ''}
              />
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-4">Məktəb məlumatları</p>
              <Input label="Məktəbin adı" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="Məs: 1 nömrəli tam orta məktəb" />
              <Input label="Rayon / Şəhər" value={district} onChange={e => setDistrict(e.target.value)} placeholder="Məs: Bakı" />
              <Select label="Növ" value={edition} onChange={e => setEdition(e.target.value)}>
                <option value="government">Dövlət məktəbi</option>
                <option value="ib">IB məktəbi</option>
              </Select>
              <Select label="İnterfeys dili" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="az">Azərbaycanca</option>
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </Select>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-4">Yoxlayın</p>
              <div className="bg-white border border-border-soft rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ad</span>
                  <span className="font-medium text-gray-900">{fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">E-poçt</span>
                  <span className="font-medium text-gray-900">{email}</span>
                </div>
                <div className="h-px bg-border-soft" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Məktəb</span>
                  <span className="font-medium text-gray-900">{schoolName}</span>
                </div>
                {district && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rayon</span>
                    <span className="font-medium text-gray-900">{district}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Növ</span>
                  <span className="font-medium text-gray-900">{edition === 'ib' ? 'IB məktəbi' : 'Dövlət məktəbi'}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Müəllim və şagirdləri admin panelindən əlavə edə bilərsiniz
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 0
              ? <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Geri</Button>
              : <div />
            }
            {step < 2
              ? <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}>Davam et</Button>
              : <Button onClick={handleFinish} loading={loading}>Məktəbi yarat</Button>
            }
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            Hesabınız var?{' '}
            <Link to="/daxil-ol" className="text-purple hover:text-purple-dark font-medium">Daxil olun</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function ZirvaIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 3L26 23H2L14 3Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 3L20 15H8L14 3Z" fill="white" strokeWidth="0"/>
    </svg>
  )
}

function ZirvaIconDark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 3L26 23H2L14 3Z" fill="#534AB7" fillOpacity="0.15" stroke="#534AB7" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 3L20 15H8L14 3Z" fill="#534AB7" strokeWidth="0"/>
    </svg>
  )
}

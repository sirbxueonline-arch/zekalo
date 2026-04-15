import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Eye, EyeOff, Sparkles, BookOpen, Users, BarChart2 } from 'lucide-react'

const features = [
  { icon: BookOpen, text: 'Rəqəmsal jurnal və qiymətləndirmə' },
  { icon: Users, text: 'Şagird, müəllim və valideyn panelləri' },
  { icon: Sparkles, text: 'Zəka — süni intellekt müəllim köməkçisi' },
  { icon: BarChart2, text: 'IB və dövlət məktəbləri üçün analitika' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && profile) {
      const dashboards = { student: '/dashboard', teacher: '/muellim/dashboard', parent: '/valideyn/dashboard', admin: '/admin/dashboard' }
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
        setError('E-poçt və ya şifrə yanlışdır.')
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('E-poçt hələ təsdiqlənməyib.')
      } else {
        setError(err?.message || 'Xəta baş verdi. Yenidən cəhd edin.')
      }
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
              Məktəbinizin idarəetməsini rəqəmsallaşdırın
            </h2>
          </div>
          <p className="text-purple-200 text-sm leading-relaxed">
            IB və dövlət məktəbləri üçün hazırlanmış, Azərbaycan dilinə tam uyğunlaşdırılmış platforma.
          </p>
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
            <ZirvaIcon className="text-purple" />
            <span className="font-serif text-2xl text-gray-900">Zirva</span>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-3xl text-gray-900 mb-2">Xoş gəlmisiniz</h1>
            <p className="text-sm text-gray-500">Hesabınıza daxil olun</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-poçt"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ad@mekteb.az"
              required
            />
            <div className="relative">
              <Input
                label="Şifrə"
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
              <Link to="/sifremi-unutdum" className="text-xs text-purple hover:text-purple-dark transition-colors">
                Şifrəni unutmusunuz?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Daxil ol
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Hesabınız yoxdur?{' '}
            <Link to="/qeydiyyat" className="text-purple hover:text-purple-dark font-medium transition-colors">
              Qeydiyyat
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function ZirvaIcon({ className = '' }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M14 3L26 23H2L14 3Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 3L20 15H8L14 3Z" fill="white" strokeWidth="0"/>
    </svg>
  )
}
